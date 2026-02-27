# 🧪 Scholar Sandbox - Demonstration Guide

In order to fully test and present the Scholar Sandbox system, follow this guide to intentionally trigger different analytical outcomes.

## 1. Static Scan Detection (EICAR)
The EICAR file is a universal, harmless anti-virus test file.
- **File**: `samples/eicar.com.txt`
- **Expected Outcome**: The file will trigger the YARA `EICAR_Test_File` rule instantly. The engine will halt execution and assign a maximum Risk Score (100) and flag it as a `Static Malware Detection`.

## 2. Dynamic Heuristics (Suspicious Script)
This file is a harmless Bash script that simulates malicious behaviors like network beaconing, credential hunting, and persistence creation.
- **File**: `samples/suspicious_script.sh`
- **Expected Outcome**: The Static scan passes. The Docker sandbox begins executing it and capturing telemetry. The AI will view the `strace` log reporting `connect()`, `open(/etc/passwd)`, and `.bashrc` writes. It will flag this as a Trojan/Infostealer with a high-to-moderate risk score, explaining *why* it is dangerous to the user.

## 3. Clean Baseline (Standard PDF)
- **File**: (Upload any safe PDF or JPG file)
- **Expected Outcome**: The system boots the sandbox, attempts to execute it, fails (because it's just data), and reports a low risk score. The AI will explain that it is an inert file type harmlessly displaying data.
