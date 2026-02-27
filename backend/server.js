const express = require('express');
const multer = require('multer');
const Docker = require('dockerode');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const docker = new Docker(); // connects to /var/run/docker.sock by default
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 50 * 1024 * 1024 }
});

// Socket room management
io.on('connection', (socket) => {
    socket.on('join', (jobId) => {
        socket.join(jobId);
        console.log(`Client joined job ${jobId}`);
    });
});

const sendStatus = (jobId, status) => {
    io.to(jobId).emit('status', { status });
};

const sendLog = (jobId, message) => {
    io.to(jobId).emit('log', message);
};

const executePythonScript = (scriptPath, args) => {
    return new Promise((resolve, reject) => {
        const py = spawn('python3', [scriptPath, ...args]);
        let output = '';
        let errOutput = '';

        py.stdout.on('data', data => output += data.toString());
        py.stderr.on('data', data => errOutput += data.toString());

        py.on('close', code => {
            resolve({ code, output, errOutput });
        });
    });
};

async function runSandbox(filePath, jobId) {
    sendLog(jobId, '[DOCKER] Creating isolated container...');

    // Create results directory path
    const hostDir = `/mnt/windows/AI-SCHOLER/scholar-sandbox/backend/uploads`;
    const filename = path.basename(filePath);

    try {
        const container = await docker.createContainer({
            Image: 'scholar-sandbox-engine',
            // Run strace on our entrypoint script
            Cmd: ['strace', '-f', '-e', 'trace=network,file,process', '-o', '/sandbox/results/telemetry.txt', '/sandbox/run_sample.sh', `/sandbox/sample/${filename}`],
            HostConfig: {
                NetworkMode: 'none',          // No internet mapped
                ReadonlyRootfs: true,         // Read-only filesystem
                Binds: [`${hostDir}:/sandbox/sample:ro`, `${hostDir}:/sandbox/results:rw`],
                SecurityOpt: ['no-new-privileges'],
                Memory: 512 * 1024 * 1024,    // 512MB RAM cap
            }
        });

        sendLog(jobId, '[DOCKER] Container created. Starting execution...');
        await container.start();

        const logsStream = await container.logs({ stdout: true, stderr: true, follow: true });

        logsStream.on('data', chunk => {
            let logLine = chunk.toString('utf8').replace(/[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/g, "");
            if (logLine.length > 0) sendLog(jobId, `[SANDBOX] ${logLine}`);
        });

        await container.wait();
        sendLog(jobId, '[DOCKER] Execution complete. Removing container...');
        await container.remove();

        // We assume the strace logs or output are saved in the mounted volume or we pass the raw stderr logs to parser
        // For this prototype, we'll just read telemetry if we dumped it, or return dummy telemetry if not present
        return { status: "sandbox_complete" };
    } catch (err) {
        sendLog(jobId, `[DOCKER ERROR] ${err.message}`);
        throw err;
    }
}

async function runAnalysisPipeline(filePath, jobId) {
    try {
        // 1. Static Scan
        sendStatus(jobId, 'static_scan');
        sendLog(jobId, '--- STATIC ANALYSIS START ---');
        const staticScanPath = path.resolve(__dirname, '../scanner/static_scan.py');
        const staticRes = await executePythonScript(staticScanPath, [filePath]);
        sendLog(jobId, `Static scan completed`);

        let staticResults = {};
        if (staticRes.output.trim()) {
            try { staticResults = JSON.parse(staticRes.output); } catch (e) { }
        }

        // 2. Docker Sandbox
        sendStatus(jobId, 'dynamic_analysis');
        sendLog(jobId, '--- DYNAMIC ANALYSIS START ---');
        try {
            await runSandbox(filePath, jobId);
        } catch (e) {
            sendLog(jobId, 'Warning: Dynamic analysis skipped or failed. Falling back to static data.');
            // Keep going to AI phase even if docker fails for now
        }

        // 3. Telemetry Parser (Mock passing data for now)
        sendStatus(jobId, 'parsing_telemetry');
        sendLog(jobId, 'Parsing extracted telemetry...');
        // We would parse the strace logs here. Since we lack the Docker container setup initially,
        // we'll pass the static results to AI.

        // 4. AI Explanation
        sendStatus(jobId, 'generating_ai_report');
        sendLog(jobId, '--- AI ANALYSIS START ---');
        const aiPath = path.resolve(__dirname, '../ai/explain.py');

        // For now we pass in stringified JSON of the staticResults as mock telemetry
        const mockTelemetryString = JSON.stringify({
            syscalls: [], network_attempts: [], file_mutations: [], threat_indicators: staticResults.yara_matches || []
        });

        const contextString = JSON.stringify({
            mime_type: staticResults.mime_type || "application/octet-stream",
            disguised_as: staticResults.extension_mismatch ? "mismatched extension" : "unknown"
        });

        const aiRes = await executePythonScript(aiPath, [mockTelemetryString, contextString]);
        let finalExplanation = {
            risk_score: staticResults.is_suspicious ? 80 : 10,
            threat_category: staticResults.is_suspicious ? "Suspicious File" : "Clean",
            plain_explanation: "Placeholder explanation since AI model is initializing.",
            technical_summary: "N/A",
            learning_tip: "Always check file extensions."
        };

        if (aiRes.output.trim()) {
            try {
                // Find JSON inside output
                const jsonStart = aiRes.output.indexOf('{');
                const jsonEnd = aiRes.output.lastIndexOf('}') + 1;
                if (jsonStart !== -1 && jsonEnd !== -1) {
                    finalExplanation = JSON.parse(aiRes.output.substring(jsonStart, jsonEnd));
                }
            } catch (e) {
                sendLog(jobId, `[AI ERROR] Failed to parse dict from Ollama: ${e.message}`);
            }
        }

        // 5. Complete
        sendLog(jobId, '--- ANALYSIS COMPLETE ---');
        io.to(jobId).emit('complete', {
            results: finalExplanation
        });

    } catch (err) {
        sendLog(jobId, `Pipeline Error: ${err.message}`);
        sendStatus(jobId, 'error');
    }
}

app.post('/api/analyze', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = req.file.path;
    const jobId = req.file.filename;

    // Repond immediately
    res.json({ jobId });

    // Run async
    runAnalysisPipeline(filePath, jobId).catch(e => console.error(e));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
