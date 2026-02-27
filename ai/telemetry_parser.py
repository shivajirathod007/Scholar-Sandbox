import re
import json
import sys

def parse_strace_logs(filepath):
    """
    Parses raw `strace` output from the Docker sandbox.
    Uses regex and heuristics to identify malicious system calls.
    
    Args:
        filepath (str): Path to the strace log text file.
        
    Returns:
        Prints a JSON string containing categorized telemetry arrays:
        - syscalls: Suspicious file access patterns
        - network_attempts: Detected IP addresses the payload tried to contact
        - file_mutations: Attempts to write to persistence locations
        - threat_indicators: High-level tags (e.g., 'credential_access')
    """
    telemetry = {
        "syscalls": [],
        "network_attempts": [],
        "file_mutations": [],
        "threat_indicators": []
    }
    
    try:
        with open(filepath, 'r') as f:
            raw_logs = f.read()
            
        for line in raw_logs.split('\n'):
            # Network connections
            if 'connect(' in line:
                ip_match = re.search(r'inet_addr\("(\d+\.\d+\.\d+\.\d+)"\)', line) 
                if not ip_match:
                     ip_match = re.search(r'sa_data="(\d+\.\d+\.\d+\.\d+)', line)
                if ip_match:
                    telemetry['network_attempts'].append({
                        "ip": ip_match.group(1), "blocked": True
                    })
                    if 'exfiltration_attempt' not in telemetry['threat_indicators']:
                        telemetry['threat_indicators'].append('exfiltration_attempt')
            
            # Credential file access
            if any(p in line for p in ['/etc/passwd', 'Login Data', '.bash_history', 'shadow']):
                if "openat" in line or "open(" in line:
                    telemetry['syscalls'].append(line.strip())
                    if 'credential_access' not in telemetry['threat_indicators']:
                        telemetry['threat_indicators'].append('credential_access')
            
            # Persistence (startup entries)
            if any(p in line for p in ['HKCU/Run', 'autostart', '.bashrc', 'init.d']):
                if "open" in line or "write" in line or "chmod" in line:
                    telemetry['file_mutations'].append(line.strip())
                    if 'persistence' not in telemetry['threat_indicators']:
                        telemetry['threat_indicators'].append('persistence')
                        
        print(json.dumps(telemetry))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
    parse_strace_logs(sys.argv[1])
