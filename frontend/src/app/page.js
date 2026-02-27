"use client";

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import DropZone from '@/components/DropZone';
import { AlertTriangle, CheckCircle, Info, Shield, Download, FileKey, Activity, Terminal, Lock, Cpu, Database, Eye } from 'lucide-react';

const CYBER_FACTS = [
  { title: "The First Worm", text: "The Morris Worm, created in 1988 by a grad student, was the first computer worm distributed via the internet. It accidentally caused massive damage, taking down roughly 10% of the internet at the time." },
  { title: "ILOVEYOU Virus", text: "In 2000, the ILOVEYOU virus infected over 10 million Windows computers. It arrived in an email with the subject line 'ILOVEYOU' and caused billions of dollars in damages globally." },
  { title: "Stuxnet - Digital Weaponry", text: "Stuxnet was a highly sophisticated worm first uncovered in 2010. It targeted SCADA systems and is believed to have physically destroyed centrifuges in Iran's nuclear program." },
  { title: "Ransomware Economics", text: "Global ransomware damage costs are predicted to exceed $265 billion by 2031. It has evolved from isolated attacks into a highly organized, profitable criminal enterprise." },
  { title: "The Origin of 'Sandbox'", text: "The term 'sandbox' comes from computer security, describing a tightly controlled set of resources for guest programs to run in, keeping the underlying system clean and safe." },
  { title: "Zero-Day Exploit", text: "A zero-day exploit is an attack that occurs on the same day a weakness is discovered in software, meaning the developer has exactly 'zero days' to patch it before it's used." },
  { title: "Phishing Origins", text: "The term 'phishing' was coined around 1996 by hackers stealing AOL accounts. They used the 'ph' spelling as a nod to 'phreaking' (early telephone hacking)." },
];

export default function Dashboard() {
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, analyzing, complete, error
  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState(null);
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    if (status === 'idle' || status === 'complete' || status === 'error') return;
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % CYBER_FACTS.length);
    }, 10000); // 10 second break between facts for readability
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (!jobId) return;

    const socket = io('http://localhost:4000');

    socket.on('connect', () => {
      socket.emit('join', jobId);
    });

    socket.on('log', (data) => {
      setLogs(prev => [...prev, data]);
    });

    socket.on('status', (data) => {
      setStatus(data.status);
    });

    socket.on('complete', (data) => {
      setResults(data.results);
      setStatus('complete');
      socket.disconnect();
    });

    socket.on('error', (err) => {
      setLogs(prev => [...prev, `[ERROR] ${err.message}`]);
      setStatus('error');
      socket.disconnect();
    });

    return () => socket.disconnect();
  }, [jobId]);

  const handleFileUpload = async (formData) => {
    try {
      setStatus('uploading');
      setLogs([]);
      setResults(null);
      setFactIndex(Math.floor(Math.random() * CYBER_FACTS.length)); // Start on a random fact
      const res = await axios.post('http://localhost:4000/api/analyze', formData);
      setJobId(res.data.jobId);
      setStatus('analyzing');
    } catch (err) {
      setStatus('error');
      setLogs(prev => [...prev, `Upload failed: ${err.message}`]);
    }
  };

  const getRiskColor = (score) => {
    if (score < 30) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/10';
    if (score < 70) return 'text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-amber-500/10';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/30 shadow-rose-500/10';
  };

  const getRiskIcon = (score) => {
    if (score < 30) return <CheckCircle className="w-16 h-16 text-emerald-400" />;
    if (score < 70) return <AlertTriangle className="w-16 h-16 text-amber-400" />;
    return <AlertTriangle className="w-16 h-16 text-rose-500" />;
  };

  return (
    <main className="min-h-screen bg-[#060913] text-slate-200 p-4 xl:p-8 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <div className="max-w-[1600px] w-full mx-auto space-y-8 relative">

        {/* Background glow effects - strictly decorative */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-screen"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-screen"></div>

        {/* Header */}
        <header className="flex items-center space-x-6 pb-6 border-b border-white/5 backdrop-blur-md">
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 rounded-2xl"></div>
            <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl border border-white/20 shadow-2xl">
              <Shield className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight flex items-center flex-wrap gap-4">
              SCHOLAR SHIELD
              <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black tracking-widest uppercase shadow-inner">
                Intelligence Dashboard
              </span>
            </h1>
            <p className="text-slate-400 font-medium tracking-wide text-[14px] mt-3 leading-relaxed max-w-4xl">
              <span className="text-blue-400 font-bold opacity-100"><Eye className="w-4 h-4 inline mr-1 -mt-0.5" /> AI-Powered Malware Analysis, Explained in Plain English.</span> We dive deep into technical telemetry to show you exactly how threats operate across the filesystem and network, while suggesting safe, open-source alternatives.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 min-h-[calc(100vh-140px)] pb-6 relative z-10">

          {/* Left Column: Upload & Logs */}
          <div className="lg:col-span-4 xl:col-span-4 flex flex-col space-y-6 h-full">

            {/* Target Acquisition Card */}
            <div className="bg-[#111827]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-7 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-bl-[100px] pointer-events-none"></div>

              <h2 className="text-lg font-bold text-white mb-6 flex items-center tracking-wide">
                <FileKey className="w-5 h-5 mr-3 text-blue-400" />
                Target Acquisition
              </h2>

              <DropZone onFileUpload={handleFileUpload} disabled={status === 'uploading' || status === 'analyzing'} />

              {status !== 'idle' && (
                <div className={`mt-6 p-5 rounded-2xl border flex items-center justify-between transition-colors duration-300
                  ${status === 'complete' ? 'bg-emerald-950/30 border-emerald-500/20' :
                    status === 'error' ? 'bg-rose-950/30 border-rose-500/20' :
                      'bg-blue-950/30 border-blue-500/20'}`}>

                  <div className="flex items-center space-x-3 text-sm font-semibold tracking-wide">
                    {/* Status Pip */}
                    <div className="relative flex h-3 w-3">
                      {status !== 'complete' && status !== 'error' && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      )}
                      <span className={`relative inline-flex rounded-full h-3 w-3 
                        ${status === 'complete' ? 'bg-emerald-500' :
                          status === 'error' ? 'bg-rose-500' : 'bg-blue-500'}`}></span>
                    </div>
                    <span className="text-slate-200">System State</span>
                  </div>

                  <span className={`text-[11px] font-black uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full border shadow-sm
                    ${status === 'complete' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                      status === 'error' ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' :
                        'text-blue-400 border-blue-500/30 bg-blue-500/10 animate-pulse'}`}>
                    {status}
                  </span>
                </div>
              )}
            </div>

            {/* Live Telemetry / Execution Feed */}
            <div className="bg-[#111827]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col flex-1 transform transition-all duration-300">
              <div className="p-6 border-b border-white/5 bg-gradient-to-r from-black/40 to-transparent flex items-center justify-between">
                <h2 className="text-sm font-bold text-white uppercase tracking-[0.15em] flex items-center">
                  <Terminal className="w-4 h-4 mr-3 text-blue-400" />
                  Execution Feed
                </h2>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700"></div>
                </div>
              </div>

              <div className="flex-1 h-0 overflow-y-auto bg-[#04060C] p-6 font-mono text-[13px] text-emerald-400/90 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {logs.length === 0 ? (
                  <div className="flex items-center text-slate-600 space-x-3 opacity-60">
                    <span className="animate-pulse w-2 h-5 bg-slate-600"></span>
                    <span>Waiting for payload execution...</span>
                  </div>
                ) : (
                  <div className="space-y-2 pb-2">
                    {logs.map((log, i) => (
                      <div key={i} className={`leading-relaxed break-all flex ${log.includes('---') ? 'py-2 font-bold opacity-100' : 'opacity-80'}`}>
                        <span className="text-slate-700 mr-4 select-none shrink-0">{String(i + 1).padStart(3, '0')}</span>
                        <span className={log.includes('[ERROR]') ? 'text-rose-500 font-bold' : log.includes('---') ? 'text-blue-400 tracking-widest' : ''}>
                          {log}
                        </span>
                      </div>
                    ))}
                    {status === 'analyzing' && (
                      <div className="flex items-center text-blue-400 space-x-3 mt-4 opacity-80">
                        <span className="animate-pulse w-2 h-5 bg-blue-400"></span>
                        <span>AWAITING STREAM...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Dashboard Results */}
          <div className="lg:col-span-8 xl:col-span-8 flex flex-col h-full">
            <div className={`bg-[#111827]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 xl:p-10 shadow-2xl flex-1 flex flex-col relative overflow-hidden transition-all duration-700 h-full
                ${results ? 'ring-1 ring-white/10' : ''}`}>

              {/* Background watermark icon */}
              <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none">
                <Shield className="w-96 h-96" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-10 flex items-center relative z-10 tracking-wide">
                {status === 'analyzing' ? <Cpu className="w-6 h-6 mr-4 text-blue-400 animate-pulse" /> : <Lock className="w-6 h-6 mr-4 text-blue-400" />}
                Threat Intelligence Report
              </h2>

              {!results ? (
                // LOADING / IDLE STATES
                <div className="flex-1 flex flex-col w-full h-full">
                  {(status !== 'idle' && status !== 'error' && status !== 'complete') ? (
                    <div className="flex flex-col items-center justify-center w-full h-full px-4 animate-in fade-in zoom-in-95 duration-500">

                      {/* Analysis Header */}
                      <div className="flex items-center space-x-6 mb-10 w-full max-w-4xl bg-black/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
                        <div className="relative">
                          <div className="absolute inset-0 bg-blue-500 rounded-full blur-[20px] opacity-40 animate-pulse"></div>
                          <div className="relative w-16 h-16 bg-[#070B14] rounded-full border border-blue-500/30 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-blue-400 animate-pulse" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-white tracking-tight">Interrogating Payload</h3>
                          <p className="text-slate-400 mt-1">Decompiling binary, tracing syscalls, and querying Mistral AI models...</p>
                        </div>
                      </div>

                      {/* Prominent Cyber Fact Display - Psychological Engagement */}
                      <div className="w-full max-w-4xl flex-1 flex flex-col justify-center relative group min-h-[300px]">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-blue-500/5 blur-[120px] pointer-events-none rounded-full"></div>

                        <div className="relative z-10 bg-gradient-to-br from-[#0a1520] to-[#04060c] border border-blue-500/20 rounded-[2rem] p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex-1 flex flex-col">
                          {/* Progress Line */}
                          <div className="absolute top-0 left-0 h-1.5 bg-[#060913] w-full">
                            <div
                              key={`progress-${factIndex}`}
                              className="h-full bg-gradient-to-r from-blue-400 to-emerald-400"
                              style={{ animation: 'loadBar 10s linear', width: '100%' }}
                            ></div>
                          </div>

                          <style>{`
                            @keyframes loadBar {
                              from { width: 0%; }
                              to { width: 100%; }
                            }
                          `}</style>

                          <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity duration-1000 rotate-12 pointer-events-none">
                            <Database className="w-64 h-64" />
                          </div>

                          <div className="flex items-center mb-8">
                            <div className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full border border-blue-500/20 font-black text-[11px] uppercase tracking-[0.25em] flex items-center shadow-inner">
                              <Info className="w-4 h-4 mr-2" /> Security Intelligence Fact
                            </div>
                            <div className="ml-auto text-slate-500 font-mono text-sm font-bold tracking-widest">
                              {String(factIndex + 1).padStart(2, '0')} / {String(CYBER_FACTS.length).padStart(2, '0')}
                            </div>
                          </div>

                          <div className="flex-1 flex flex-col justify-center relative z-10">
                            <h5
                              key={`title-${factIndex}`}
                              className="text-3xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 mb-6 tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700"
                            >
                              {CYBER_FACTS[factIndex].title}
                            </h5>
                            <p
                              key={`text-${factIndex}`}
                              className="text-lg lg:text-xl text-slate-300 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150 fill-mode-both max-w-3xl"
                            >
                              {CYBER_FACTS[factIndex].text}
                            </p>
                          </div>

                          {/* Dot indicators */}
                          <div className="flex space-x-3 items-center justify-center relative z-10 mt-auto pt-8">
                            {CYBER_FACTS.map((_, i) => (
                              <div key={i} className={`h-2 rounded-full transition-all duration-700 ease-out 
                                ${i === factIndex ? 'w-12 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'w-2 bg-slate-700'}`}>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center opacity-30 hover:opacity-100 transition-opacity duration-700 h-full">
                      <div className="w-32 h-32 mb-8 rounded-[2.5rem] border border-dashed border-white/20 flex items-center justify-center bg-white/5 rotate-3 hover:rotate-0 transition-transform duration-500">
                        <Shield className="w-14 h-14 text-slate-400" strokeWidth={1.5} />
                      </div>
                      <p className="text-2xl font-semibold text-slate-300 tracking-tight">System Armed and Ready</p>
                      <p className="text-base font-medium tracking-wide text-slate-500 mt-3">Submit a file parameter to initiate strategic telemetry capture</p>
                    </div>
                  )}
                </div>
              ) : (
                // SUCCESS RESULTS STATE
                <div className="flex-1 flex flex-col space-y-8 animate-in fade-in zoom-in-95 duration-500 relative z-10 w-full h-full">

                  {/* Top row: Score + Classification */}
                  <div className="flex flex-col md:flex-row gap-8">

                    {/* Score Card */}
                    <div className={`p-8 rounded-[2rem] border shadow-2xl backdrop-blur-md flex-1 overflow-hidden relative group transition-all duration-500 ${getRiskColor(results.risk_score)}`}>
                      <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                        {getRiskIcon(results.risk_score)}
                      </div>
                      <div className="flex items-center space-x-6 relative z-10">
                        <div className="bg-black/20 p-5 rounded-3xl backdrop-blur-md shadow-inner">
                          {getRiskIcon(results.risk_score)}
                        </div>
                        <div className="flex flex-col">
                          <div className="text-6xl font-black tracking-tighter drop-shadow-sm">
                            {results.risk_score}<span className="text-3xl opacity-50 font-bold tracking-normal">/100</span>
                          </div>
                          <div className="text-[12px] font-bold uppercase tracking-[0.2em] mt-3 opacity-80">Final Threat Score</div>
                        </div>
                      </div>
                    </div>

                    {/* Category Card */}
                    <div className="bg-black/20 border border-white/5 rounded-[2rem] p-8 flex flex-col justify-center min-w-[250px] relative overflow-hidden shadow-inner">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[100px] pointer-events-none"></div>
                      <h3 className="text-[11px] text-slate-500 uppercase tracking-[0.25em] font-bold mb-4 flex items-center">
                        <Activity className="w-4 h-4 mr-2" /> Global Classification
                      </h3>
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-6 py-3 rounded-2xl bg-[#060913] border border-white/10 text-white font-black text-2xl tracking-normal shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                          <span className={`w-3 h-3 rounded-full mr-4 
                              ${results.risk_score < 30 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' :
                              results.risk_score < 70 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]' :
                                'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]'} animate-pulse`}></span>
                          {results.threat_category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Explanation spanning full width */}
                  <div className="bg-gradient-to-br from-blue-900/10 via-indigo-900/10 to-[#04060C] border border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.05)] rounded-[2rem] p-10 relative overflow-hidden group">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 opacity-50"></div>
                    <div className="absolute right-0 bottom-0 opacity-[0.03] group-hover:scale-105 transition-transform duration-1000 pointer-events-none translate-x-1/4 translate-y-1/4">
                      <Cpu className="w-64 h-64" />
                    </div>

                    <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-blue-400 mb-6 flex items-center">
                      <Cpu className="w-5 h-5 mr-3" />
                      Teacher's AI Analysis
                    </h3>
                    <p className="text-white text-xl leading-[1.7] font-medium mb-8 relative z-10 max-w-4xl tracking-wide">
                      {results.plain_explanation}
                    </p>

                    <div className="bg-black/50 rounded-2xl p-6 border border-white/5 relative z-10 backdrop-blur-sm">
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3 flex items-center">
                        <Activity className="w-3.5 h-3.5 mr-2" /> Technical Telemetry Overview
                      </h4>
                      <p className="text-[14px] text-emerald-400/90 font-mono italic leading-relaxed">
                        {'>'} {results.technical_summary || "No low-level technical anomalies detected by strace engine."}
                      </p>
                    </div>
                  </div>

                  {/* Grid for Bottom Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-auto">
                    {/* Safety alternative component */}
                    {results.safe_alternative && results.safe_alternative.toLowerCase() !== "n/a" && (
                      <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-[2rem] p-8 relative overflow-hidden hover:bg-emerald-900/20 transition-colors">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500/50"></div>
                        <h3 className="text-[11px] font-black text-emerald-400 mb-4 uppercase tracking-[0.2em] flex items-center">
                          <Download className="w-4 h-4 mr-2.5" />
                          Safe Alternative
                        </h3>
                        <p className="text-emerald-50 text-lg font-semibold">{results.safe_alternative}</p>
                      </div>
                    )}

                    {/* Learning tip component */}
                    {results.learning_tip && (
                      <div className="bg-amber-900/10 border border-amber-500/20 rounded-[2rem] p-8 relative overflow-hidden hover:bg-amber-900/20 transition-colors">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500/50"></div>
                        <h3 className="text-[11px] font-black text-amber-400 mb-4 uppercase tracking-[0.2em] flex items-center">
                          <Info className="w-4 h-4 mr-2.5" />
                          Security Principle
                        </h3>
                        <p className="text-amber-50 text-[16px] font-medium leading-relaxed">{results.learning_tip}</p>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
