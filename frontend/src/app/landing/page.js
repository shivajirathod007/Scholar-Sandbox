"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import {
    Shield,
    Brain,
    Search,
    Lock,
    Lightbulb,
    BarChart2,
    Terminal,
    Cpu,
    Activity,
    Eye,
    FileKey,
    Database,
    Info,
    Download
} from 'lucide-react';

const stats = [
    { value: "87%", label: "Detection Accuracy" },
    { value: "<5s", label: "Analysis Time" },
    { value: "100%", label: "Local & Private" },
    { value: "50+", label: "Safe Alternatives" },
];

const features = [
    {
        icon: Shield,
        title: "Secure File Detonation",
        desc: "Every file runs inside an isolated Docker container with no internet access. Your system stays completely safe — the container is destroyed after analysis, leaving zero trace.",
        tag: "SANDBOX ENGINE",
    },
    {
        icon: Brain,
        title: "AI Teach-Back Explanation",
        desc: "Our locally-running Mistral 7B model reads the raw behavioral logs and translates them into plain English — what the file tried to steal, who it tried to contact, and why you should care.",
        tag: "CORE INNOVATION",
    },
    {
        icon: Search,
        title: "Deep Technical Analysis",
        desc: "System call tracing (strace), network connection monitoring, filesystem mutation tracking, and YARA rule matching. Full forensic-grade telemetry — all explained at your level.",
        tag: "STATIC + DYNAMIC",
    },
    {
        icon: Lock,
        title: "100% Private — No Cloud",
        desc: "Your file never leaves your machine. No VirusTotal uploads, no external APIs, no cloud inference. The entire AI pipeline runs on AMD ROCm hardware locally.",
        tag: "PRIVACY FIRST",
    },
    {
        icon: Lightbulb,
        title: "Safe Alternative Suggester",
        desc: "Caught a cracked MATLAB installer? We'll tell you exactly what it tried to do AND point you to GNU Octave — a free, safe, fully compatible replacement. No more excuses to use pirated tools.",
        tag: "BEYOND DETECTION",
    },
    {
        icon: BarChart2,
        title: "Risk Score Dashboard",
        desc: "A color-coded 0–100 risk score, behavioral event timeline, threat category tag, and a full incident report you can export as PDF — all in a dashboard built for non-security experts.",
        tag: "VISUALIZATION",
    },
];

const threatTypes = [
    { name: "Infostealer", color: "text-rose-500 bg-rose-500/10 border-rose-500/30", desc: "Steals your passwords, browser cookies, and saved credentials" },
    { name: "Ransomware", color: "text-amber-500 bg-amber-500/10 border-amber-500/30", desc: "Encrypts your files and demands payment to restore them" },
    { name: "Trojan", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30", desc: "Disguises itself as a legitimate tool while running malicious code" },
    { name: "Adware", color: "text-purple-500 bg-purple-500/10 border-purple-500/30", desc: "Injects unwanted ads and tracks your browsing behavior" },
    { name: "Clean", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30", desc: "No threats detected — file appears safe to use" },
];

const pipeline = [
    { step: "01", label: "Upload File", detail: "Drag & drop any suspicious file — EXE, PDF, ZIP, script" },
    { step: "02", label: "Static Pre-Scan", detail: "YARA rules + file header inspection catch obvious threats instantly" },
    { step: "03", label: "Sandbox Detonation", detail: "File executes inside isolated Docker container with full monitoring" },
    { step: "04", label: "Telemetry Capture", detail: "strace logs every syscall, network attempt, and file mutation" },
    { step: "05", label: "AI Analysis", detail: "Mistral 7B reads telemetry and generates your personalized explanation" },
    { step: "06", label: "Report + Alternatives", detail: "Risk score, plain-English explanation, and safe tool suggestions" },
];

function AnimatedCounter({ target, suffix = "" }) {
    const [count, setCount] = useState(0);
    const isNum = !isNaN(parseInt(target));

    useEffect(() => {
        if (!isNum) return;
        const end = parseInt(target);
        let start = 0;
        const timer = setInterval(() => {
            start += Math.ceil(end / 40);
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(start);
        }, 30);
        return () => clearInterval(timer);
    }, [isNum, target]);

    return <span>{isNum ? count + suffix : target}</span>;
}

export default function ScholarShieldLanding() {
    const [activeFeature, setActiveFeature] = useState(null);

    return (
        <main className="min-h-screen bg-[#060913] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
            {/* Ambient background glowing orbs from existing UI */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-screen"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-screen"></div>

            <div className="max-w-[1200px] mx-auto w-full relative z-10 p-6 md:p-10">

                {/* Nav Bar */}
                <header className="flex justify-between items-center mb-24 pt-4 border-b border-white/5 pb-6 backdrop-blur-sm">
                    <div className="flex items-center space-x-4">
                        <div className="relative group cursor-pointer">
                            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 rounded-2xl"></div>
                            <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl border border-white/20 shadow-2xl">
                                <Shield className="w-6 h-6 text-white" strokeWidth={1.5} />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
                                SCHOLAR<span className="text-blue-400">SHIELD</span>
                            </span>
                            <span className="text-[11px] text-blue-400 font-medium tracking-wide flex items-center">
                                <Eye className="w-3 h-3 mr-1 opacity-80" /> AI + Cybersecurity & Privacy
                            </span>
                        </div>
                    </div>

                    <div className="hidden md:flex space-x-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === 1 ? 'bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'bg-slate-800'}`} />
                        ))}
                    </div>

                    <div className="hidden sm:block text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">
                        AMD IDEATHON 2025
                    </div>
                </header>

                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[60vh]">
                    <div className="space-y-8">
                        <div className="inline-flex items-center space-x-2 text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
                            <Cpu className="w-3.5 h-3.5" />
                            <span>Deep Technical Analysis</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter leading-[1.1]">
                            SCHOLAR
                            <br />
                            <span className="text-blue-400 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">SHIELD</span>
                        </h1>

                        <p className="text-xl text-slate-300 font-medium leading-relaxed max-w-lg">
                            AI-powered malware analysis, explained in plain English — <span className="text-emerald-400">and in full technical depth.</span>
                        </p>

                        <p className="text-[15px] text-slate-400 leading-relaxed max-w-lg">
                            Upload any suspicious file. ScholarShield detonates it safely, captures every system call, network attempt, and file mutation — then translates it all into something you can actually understand. No threat left vague. And when it catches a cracked tool, it tells you the safe, free alternative.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <Link href="/">
                                <button className="relative group cursor-pointer overflow-hidden rounded-[2rem] bg-blue-500 text-white font-bold py-4 px-8 tracking-wide transition-all shadow-lg hover:shadow-blue-500/25 border border-blue-400/50">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <span className="relative z-10 flex items-center">
                                        ANALYZE A FILE <Activity className="w-4 h-4 ml-2 group-hover:block hidden" /> <span className="ml-2 group-hover:hidden">→</span>
                                    </span>
                                </button>
                            </Link>
                            <button className="rounded-[2rem] bg-transparent text-blue-400 font-bold py-4 px-8 tracking-wide transition-all border border-blue-500/30 hover:bg-blue-500/5">
                                VIEW DEMO
                            </button>
                        </div>
                    </div>

                    <div className="relative flex justify-center items-center h-full opacity-80 group mt-10 lg:mt-0">
                        <div className="absolute w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[80px] group-hover:bg-blue-500/10 transition-colors duration-700"></div>
                        <div className="relative z-10 bg-gradient-to-b from-[#0a1520] to-[#0d1825] p-16 rounded-full border border-blue-500/20 shadow-[0_0_60px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_80px_rgba(59,130,246,0.2)] transition-shadow duration-700 animate-[pulse_4s_ease-in-out_infinite]">
                            <Shield className="w-40 h-40 text-blue-400 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]" strokeWidth={1} />
                        </div>

                        <div className="absolute bottom-10 lg:bottom-20 right-0 lg:right-10 flex items-center space-x-2 text-[11px] font-mono tracking-widest text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-4 py-2 rounded-lg backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>THREAT_NEUTRALIZED</span>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-32 mb-24">
                    {stats.map((s, i) => (
                        <div key={i} className="bg-[#111827]/80 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] flex flex-col items-center justify-center text-center shadow-lg hover:border-white/20 transition-all group">
                            <div className={`text-4xl font-extrabold mb-2 ${i % 2 === 0 ? 'text-blue-400' : 'text-emerald-400'} drop-shadow-sm`}>
                                <AnimatedCounter target={s.value} />
                            </div>
                            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-2">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* System Overview */}
                <div className="my-32 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-blue-500/5 blur-[100px] rounded-full -z-10"></div>

                    <div className="text-[12px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4 flex items-center">
                        <Info className="w-4 h-4 mr-2" /> System Overview
                    </div>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-16 tracking-tight">
                        What is ScholarShield?
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        <div className="space-y-6">
                            <p className="text-lg text-slate-300 leading-relaxed">
                                ScholarShield is a <strong className="text-white font-bold">privacy-first, AI-powered malware analysis sandbox</strong> built specifically for students. Engineering students routinely download academic resources from unverified sources — cracked software, Telegram-shared PDFs, pirated textbook installers.
                            </p>
                            <p className="text-lg text-slate-300 leading-relaxed">
                                Traditional antivirus <span className="text-rose-400">silently deletes the file</span>. You learn nothing. Enterprise sandbox tools produce detailed technical reports written for security professionals — reports a first-year student simply won't understand.
                            </p>
                            <p className="text-lg text-slate-300 leading-relaxed">
                                ScholarShield bridges that gap. It safely detonates the file, captures everything it tried to do at the OS level, and uses a local AI model to explain the attack — <span className="text-emerald-400">technically complete, but written for you</span>.
                            </p>
                        </div>

                        <div className="bg-[#04060C] border border-slate-800 rounded-[2rem] p-8 shadow-2xl relative group hover:border-slate-700 transition-colors">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-400 rounded-t-[2rem]"></div>
                            <div className="flex items-center space-x-2 mb-6 text-slate-600">
                                <div className="w-3 h-3 rounded-full bg-rose-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                            </div>
                            <div className="font-mono text-[13px] sm:text-sm space-y-3 leading-relaxed">
                                <div className="text-slate-500"># ScholarShield analysis output</div>
                                <div className="text-blue-400 flex items-center"><span className="text-slate-500 mr-2">$</span> scholarscan MATLAB_2024_Crack.exe</div>
                                <div className="text-slate-500">→ Running static pre-scan...</div>
                                <div className="text-slate-500">→ Spinning up isolated container...</div>
                                <div className="text-amber-500 bg-amber-500/10 px-2 py-1 rounded inline-block mt-2">⚠ THREAT DETECTED</div>
                                <div className="text-white mt-4">Risk Score: <span className="text-rose-500 font-bold">87/100 — HIGH</span></div>
                                <div className="text-white">Category: <span className="text-rose-400 shrink">Infostealer + Persistence</span></div>
                                <div className="text-slate-400 mt-4 border-l-2 border-slate-700 pl-4">
                                    This file tried to read your saved browser passwords and create a hidden startup entry. It also attempted to contact 185.220.x.x.
                                </div>
                                <div className="text-emerald-400 mt-6 bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20 flex items-center">
                                    <Download className="w-4 h-4 mr-2" />
                                    Safe Alternative: GNU Octave (octave.org)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pipeline / How It Works */}
                <div className="my-32">
                    <div className="text-[12px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4 flex items-center">
                        <Terminal className="w-4 h-4 mr-2" /> Analysis Pipeline
                    </div>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-16 tracking-tight">
                        How It Works
                    </h2>

                    <div className="space-y-4 relative">
                        <div className="hidden md:block absolute left-[28px] top-[24px] bottom-[24px] w-[2px] bg-slate-800"></div>
                        {pipeline.map((p, i) => (
                            <div key={i} className="flex items-start md:items-center p-6 md:p-8 rounded-[2rem] bg-[#111827]/40 border border-transparent hover:border-white/10 hover:bg-[#111827]/80 transition-all duration-300 relative group">
                                <div className="bg-[#060913] border-2 border-slate-700 group-hover:border-blue-500 text-blue-400 font-bold w-14 h-14 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors shadow-lg mr-6">
                                    {p.step}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2 tracking-wide">{p.label}</h3>
                                    <p className="text-slate-400 text-[15px] leading-relaxed max-w-2xl">{p.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Features / Capabilities */}
                <div className="my-32 relative">
                    <div className="text-[12px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4 flex items-center">
                        <Database className="w-4 h-4 mr-2" /> Capabilities
                    </div>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-16 tracking-tight">
                        What ScholarShield Does
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => {
                            const Icon = f.icon;
                            const isActive = activeFeature === i;
                            return (
                                <div
                                    key={i}
                                    className={`bg-[#111827]/60 backdrop-blur-xl border ${isActive ? 'border-blue-500/50 shadow-blue-500/10' : 'border-white/10'} rounded-[2rem] p-8 cursor-pointer transition-all duration-300 hover:border-white/20 hover:bg-[#111827] shadow-xl relative overflow-hidden group`}
                                    onClick={() => setActiveFeature(isActive ? null : i)}
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[100px] translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none"></div>

                                    <div className="flex justify-between items-start mb-8 relative z-10">
                                        <div className="bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform duration-300">
                                            <Icon className="w-8 h-8" strokeWidth={1.5} />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 border border-blue-500/20 bg-blue-500/10 text-blue-400 rounded-full">
                                            {f.tag}
                                        </span>
                                    </div>

                                    <div className="relative z-10">
                                        <h3 className="text-lg font-bold text-white mb-3 tracking-wide">{f.title}</h3>
                                        <p className={`text-slate-400 text-sm leading-[1.8] ${isActive ? '' : 'line-clamp-3 md:line-clamp-none'}`}>{f.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Threat Types */}
                <div className="my-32 p-10 md:p-16 rounded-[3rem] bg-gradient-to-br from-[#0a1520] to-[#0d1825] border border-blue-500/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="text-[12px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4 flex items-center relative z-10">
                        <Activity className="w-4 h-4 mr-2" /> Threat Intelligence
                    </div>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight relative z-10">
                        Categories We Detect
                    </h2>
                    <p className="text-lg text-slate-400 mb-12 max-w-2xl relative z-10 leading-relaxed">
                        Every file gets classified into one of these categories with a full plain-English + technical explanation of what that means for you.
                    </p>

                    <div className="flex flex-wrap gap-4 flex-col md:flex-row relative z-10">
                        {threatTypes.map((t, i) => (
                            <div key={i} className={`flex flex-col border p-6 rounded-2xl flex-1 hover:-translate-y-1 transition-transform duration-300 ${t.color}`}>
                                <div className="font-bold text-lg mb-2 tracking-wide">{t.name}</div>
                                <div className="text-sm opacity-90 leading-relaxed">{t.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Value Prop */}
                <div className="my-32">
                    <div className="text-[12px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4 flex items-center">
                        <FileKey className="w-4 h-4 mr-2" /> Value Proposition
                    </div>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-16 tracking-tight">
                        Why ScholarShield Exists
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: "Traditional Antivirus", pro: "Deletes the file", con: "You learn nothing. Behavior repeats. Campus stays vulnerable.", color: "rose", highlight: false },
                            { label: "Enterprise Sandboxes", pro: "Technical report", con: "Written for security analysts. Hex dumps, PE analysis — useless for a student.", color: "amber", highlight: false },
                            { label: "ScholarShield", pro: "Plain English + Depth + Alternatives", con: "We fill the gap between deletion and deep technical incomprehension.", color: "emerald", highlight: true },
                        ].map((c, i) => (
                            <div key={i} className={`p-8 rounded-[2rem] border relative flex flex-col justify-between
                ${c.highlight ? 'bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)] transform md:-translate-y-4' : 'bg-[#111827]/40 border-white/5 hover:border-white/10 transition-colors'}
              `}>
                                {c.highlight && (
                                    <div className="absolute top-0 inset-x-0 flex justify-center -translate-y-1/2">
                                        <span className="bg-emerald-500 text-black text-[10px] uppercase font-bold tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg shadow-emerald-500/20">The Solution</span>
                                    </div>
                                )}
                                <div>
                                    <div className={`text-[11px] font-black uppercase tracking-[0.2em] mb-4 
                    ${c.color === 'rose' ? 'text-rose-400' : c.color === 'amber' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                        {c.label}
                                    </div>
                                    <div className="text-xl font-bold text-white mb-4 tracking-wide">{c.pro}</div>
                                    <div className={`text-[15px] leading-relaxed ${c.highlight ? 'text-emerald-50' : 'text-slate-400'}`}>{c.con}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-white/10 mt-20 bg-[#04060C] relative z-10 py-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="text-xl font-bold text-white flex items-center tracking-tight">
                    <Shield className="w-5 h-5 mr-3 text-blue-400" strokeWidth={2.5} />
                    SCHOLAR<span className="text-blue-400">SHIELD</span>
                </div>
                <div className="text-xs uppercase font-bold tracking-[0.2em] text-slate-500">
                    AI-POWERED MALWARE ANALYSIS — AMD IDEATHON 2025
                </div>
                <div className="text-[11px] font-mono tracking-wide text-slate-600 flex space-x-4 max-w-sm flex-wrap justify-center gap-y-2 mt-2">
                    <span>100% LOCAL</span>
                    <span className="opacity-50">•</span>
                    <span>OPEN SOURCE</span>
                    <span className="opacity-50">•</span>
                    <span>PRIVACY FIRST</span>
                    <span className="opacity-50">•</span>
                    <span>ROCm ACCELERATED</span>
                </div>
            </footer>
        </main>
    );
}
