# 🛡️ Scholar Sandbox

**Scholar Sandbox** is an AI-powered, educational malware analysis environment built for students and cybersecurity researchers to safely deconstruct, execute, and understand suspicious payloads without risking their host machines. 

By combining **Static Analysis** (YARA, PE inspection), **Dynamic Analysis** (isolated Docker-in-Docker execution with `strace`), and **Generative AI** (Mistral 7B via Ollama), this platform provides a comprehensive and easy-to-understand breakdown of potential threats.

---

## 🚀 Features

- **Drag-and-Drop Interface**: A premium, cinematic Next.js frontend with real-time WebSocket telemetry streaming.
- **Static Pre-Scanner**: Python-based static analysis engine that extracts MIME types, detects extension mismatches, and runs YARA malware rules against uploaded binaries.
- **Isolated Sandbox Engine**: Executes payloads in a headless, network-restricted, read-only Ubuntu Docker container with hardware limits, dumping system calls via `strace`.
- **AI-Powered "Teacher" Explanations**: Integrates with local LLMs (Mistral 7B) to translate complex hexadecimal and system calls into plain English threat intelligence reports.
- **Educational UI State**: Displays cycling cybersecurity history facts during payload processing.

---

## 🏗️ Architecture

The project is built around a microservice architecture orchestrated via Docker Compose:

1. **Frontend (`/frontend`)**: Next.js 14, React, Tailwind CSS, socket.io-client.
2. **Backend Engine (`/backend`)**: Node.js, Express, Dockerode (for dynamic container spinning), WebSockets. 
3. **Static Scanner (`/scanner`)**: Python 3, `python-magic`, `yara-python`.
4. **Sandbox Box (`/sandbox`)**: Read-only `ubuntu:22.04` Docker image pre-installed with `strace` and interpreters to safely run the payload.
5. **AI Pipeline (`/ai`)**: Python 3 `ollama` SDK communicating with a standalone `ollama/ollama` Docker container.

---

## ⚙️ Prerequisites

Before running the sandbox, ensure your system has the following installed:

1. **Docker Engine**: Installed and running.
2. **Docker Compose Plugin**: To orchestrate the services.
3. **Ollama**: (Handled by Docker Compose, but requires internet access to initially download the 4.4GB Mistral model).

*Note: Since the backend spawns dynamic Docker containers on the fly, it requires access to the host's `/var/run/docker.sock`.*

---

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shivajirathod007/Scholar-Sandbox.git
   cd Scholar-Sandbox
   ```

2. **(Optional) Build the Local Sandbox Engine:**
   *The backend relies on the `scholar-sandbox-engine` image to run payloads. If it is not built, the dynamic analysis phase will gracefully fallback.*
   ```bash
   cd sandbox
   docker build -t scholar-sandbox-engine .
   cd ..
   ```

3. **Spin up the Cluster:**
   This command will build the frontend and backend Node.js images, and pull down the Ollama engine.
   ```bash
   docker compose --profile ollama up --build -d
   ```

4. **Pull the AI Model:**
   Since the Ollama image ships empty, you must download the Mistral 7B brain. Run this command while the cluster is running:
   ```bash
   docker exec scholar-sandbox-ollama-1 ollama pull mistral
   ```
   *(This downloads ~4.4GB of weights. You only ever have to run this once).*

---

## 💻 Usage

Once the cluster is running and the model is pulled:

1. Navigate to **[http://localhost:3000](http://localhost:3000)** in your web browser.
2. Drag and drop any suspicious file (e.g., an executable, a script, or a PDF macro).
3. Watch the Live Execution Feed stream realtime static scan results, Docker initialization telemetry, and `strace` system calls.
4. When finished, review the **Teacher's AI Analysis** for a human-readable explanation of what the payload attempted to do.

---

## ⚠️ Security Warning

**DO NOT** run this application in a production environment exposed to the open internet without severe modifications. 
- The backend mounts the host Docker socket (`/var/run/docker.sock`), meaning a compromise of the backend Node.js server grants root access to the host machine.
- This project is designed exclusively for *local*, educational, and controlled research environments.

## 📄 License
See the `LICENSE` file for more details.
