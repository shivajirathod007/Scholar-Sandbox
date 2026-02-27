import re
import json
import sys

# ── CONSTANTS (defined once, not inside loop) ──────────────────────────

CREDENTIAL_PATHS = [
    '/etc/passwd', '/etc/shadow', '/etc/sudoers',
    'Login Data',       # Chrome credentials
    'Cookies',          # Browser cookies
    'key4.db',          # Firefox passwords
    'logins.json',      # Firefox logins
    '.bash_history',    # Command history
    '.ssh/id_rsa',      # SSH private key
    '.ssh/authorized_keys',
    '.gnupg',           # GPG keys
    'id_rsa', 'id_ed25519',  # SSH keys (any location)
    'wallet.dat',       # Crypto wallets
    '.config/google-chrome',
    '.mozilla/firefox',
]

PERSISTENCE_PATHS = [
    'autostart',            # Linux GNOME autostart
    '.bashrc',              # Linux shell persistence
    '.bash_profile',        # Linux shell persistence
    '.profile',             # Linux shell persistence
    'init.d',               # Linux init service
    'systemd/system',       # Linux systemd service
    'crontab',              # Linux cron
    '/etc/rc.local',        # Linux startup script
    '/etc/cron',            # Linux cron directories
    'HKCU/Run',             # Windows registry (static analysis)
    'HKLM/Run',             # Windows registry (static analysis)
    'StartupItems',         # macOS startup
    '.config/autostart',    # Linux autostart folder
]

HIDDEN_FILE_PATTERNS = [
    r'/tmp/\.',             # Hidden files in /tmp
    r'/var/tmp/\.',         # Hidden files in /var/tmp
    r'/dev/shm/\.',         # Hidden in shared memory
    r'\./\.',               # Hidden in current dir
    r'\.svchost',           # Fake Windows process name
    r'\.update_helper',     # Fake update process
    r'\.cache/\.[a-z]',     # Hidden in cache
]

SUSPICIOUS_PORTS = {
    4444: 'reverse_shell_metasploit',
    1337: 'reverse_shell',
    31337: 'reverse_shell_elite',
    8080: 'http_proxy_c2',
    9999: 'common_c2',
    6667: 'irc_botnet',
    6666: 'irc_botnet',
}

SAFE_PORTS = {80, 443, 53, 22, 21, 25, 587}

KNOWN_MALICIOUS_IPS = [
    '185.220.', '45.142.', '91.108.', '193.32.',  # Common C2 ranges
]

EVIDENCE_DELETION_PATHS = [
    '/var/log/', '/tmp/tmp', '.bash_history',
    '/proc/', 'wtmp', 'utmp', 'lastlog'
]

RANSOMWARE_EXTENSIONS = [
    '.locked', '.encrypted', '.enc', '.crypto',
    '.crypt', '.crypted', '.cerber', '.locky'
]

MAX_LINE_LENGTH = 2000  # Ignore absurdly long lines (memory dumps)


# ── HELPER FUNCTIONS ────────────────────────────────────────────────────

def extract_ip_and_port(line):
    """
    Extracts IP address and port from strace connect() lines.
    Handles multiple strace output formats.
    """
    # Format 1: inet_addr("x.x.x.x") with optional port
    m = re.search(r'inet_addr\("(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})"\)', line)
    port_m = re.search(r'sin_port=htons\((\d+)\)', line)
    if m:
        return m.group(1), int(port_m.group(1)) if port_m else None

    # Format 2: IPv6-mapped IPv4
    m = re.search(r'::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})', line)
    if m:
        return m.group(1), int(port_m.group(1)) if port_m else None

    # Format 3: Raw hex sockaddr (partial — extracts port only)
    # connect(3, "\x02\x00\x01\xbb...", 16) — port is bytes 2-3
    m = re.search(r'\\x02\\x00\\x([0-9a-f]{2})\\x([0-9a-f]{2})', line)
    if m:
        port = int(m.group(1) + m.group(2), 16)
        return None, port

    return None, None


def extract_path_from_line(line):
    """Extracts file path argument from a strace syscall line."""
    m = re.search(r'"(/[^"]*)"', line)
    return m.group(1) if m else None


def is_private_ip(ip):
    """Returns True if IP is a private/loopback address (not malicious)."""
    if not ip:
        return True
    private_prefixes = ('127.', '10.', '192.168.', '172.16.', '0.0.0.0')
    return ip.startswith(private_prefixes)


def looks_like_known_malicious(ip):
    """Check IP against known malicious ranges."""
    if not ip:
        return False
    return any(ip.startswith(prefix) for prefix in KNOWN_MALICIOUS_IPS)


def add_indicator(telemetry, indicator):
    """Adds an indicator only if not already present."""
    if indicator not in telemetry['threat_indicators']:
        telemetry['threat_indicators'].append(indicator)


def add_unique(lst, item):
    """Adds item to list only if not already present (deduplication)."""
    if item not in lst:
        lst.append(item)


# ── MAIN PARSER ─────────────────────────────────────────────────────────

def parse_strace_logs(filepath):
    """
    Parses raw strace output from the Docker sandbox.
    Categorizes behavioral telemetry into threat indicators.
    """
    telemetry = {
        "syscalls": [],
        "network_attempts": [],
        "file_mutations": [],
        "threat_indicators": [],
        "process_activity": [],
        "evidence_tampering": [],
        "severity_score": 0,          # Raw score before AI
        "parse_warnings": []
    }

    # Track counters for ransomware heuristics
    write_counter = {}
    rename_counter = 0
    lines_parsed = 0

    try:
        # Use errors='replace' to handle binary/non-UTF8 strace output
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            raw_logs = f.read()

        lines = raw_logs.split('\n')

        for line in lines:
            lines_parsed += 1

            # Skip empty lines and overly long lines (memory dumps)
            if not line.strip() or len(line) > MAX_LINE_LENGTH:
                continue

            # ── 1. NETWORK CONNECTIONS ──────────────────────────────
            if 'connect(' in line and 'AF_INET' in line:
                ip, port = extract_ip_and_port(line)

                if ip and not is_private_ip(ip):
                    entry = {"ip": ip, "port": port, "blocked": True}

                    # Flag known malicious IP ranges
                    if looks_like_known_malicious(ip):
                        entry["known_malicious_range"] = True
                        add_indicator(telemetry, 'known_c2_ip')
                        telemetry['severity_score'] += 25

                    # Flag suspicious ports
                    if port and port in SUSPICIOUS_PORTS:
                        entry["port_label"] = SUSPICIOUS_PORTS[port]
                        add_indicator(telemetry, SUSPICIOUS_PORTS[port])
                        telemetry['severity_score'] += 30

                    # Flag non-standard ports (not 80/443/53 etc.)
                    elif port and port not in SAFE_PORTS:
                        entry["unusual_port"] = True
                        add_indicator(telemetry, 'unusual_port_connection')
                        telemetry['severity_score'] += 10

                    telemetry['network_attempts'].append(entry)
                    add_indicator(telemetry, 'exfiltration_attempt')
                    telemetry['severity_score'] += 15

            # ── 2. DNS LOOKUPS (domain resolution before connecting) ──
            if 'getaddrinfo' in line or 'gethostbyname' in line:
                domain_m = re.search(r'"([a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})"', line)
                if domain_m:
                    domain = domain_m.group(1)
                    # Skip common safe domains
                    safe_domains = ('localhost', 'example.com', 'ubuntu.com', 'debian.org')
                    if not any(d in domain for d in safe_domains):
                        add_unique(telemetry['network_attempts'], {
                            "domain": domain, "type": "dns_lookup"
                        })
                        add_indicator(telemetry, 'external_dns_lookup')
                        telemetry['severity_score'] += 5

            # ── 3. CREDENTIAL FILE ACCESS ───────────────────────────
            if any(p in line for p in CREDENTIAL_PATHS):
                syscall = 'openat' in line or 'open(' in line or 'read(' in line
                # Exclude /dev/null redirects (false positive filter)
                if syscall and '/dev/null' not in line:
                    path = extract_path_from_line(line)
                    entry = {"syscall": line.strip()[:300], "path": path}
                    add_unique(telemetry['syscalls'], entry)
                    add_indicator(telemetry, 'credential_access')
                    telemetry['severity_score'] += 20

                    # Extra weight for SSH keys and crypto wallets
                    if any(k in line for k in ['.ssh/id_rsa', 'wallet.dat', 'key4.db']):
                        add_indicator(telemetry, 'high_value_credential_access')
                        telemetry['severity_score'] += 20

            # ── 4. PERSISTENCE MECHANISMS ───────────────────────────
            if any(p in line for p in PERSISTENCE_PATHS):
                if any(s in line for s in ['openat', 'open(', 'write(', 'creat(', 'chmod']):
                    path = extract_path_from_line(line)
                    entry = {"syscall": line.strip()[:300], "path": path}
                    add_unique(telemetry['file_mutations'], entry)
                    add_indicator(telemetry, 'persistence')
                    telemetry['severity_score'] += 20

            # ── 5. HIDDEN FILE DROPS ─────────────────────────────────
            for pattern in HIDDEN_FILE_PATTERNS:
                if re.search(pattern, line):
                    if any(s in line for s in ['openat', 'open(', 'creat(', 'write(']):
                        path = extract_path_from_line(line)
                        entry = {"syscall": line.strip()[:300], "path": path}
                        add_unique(telemetry['file_mutations'], entry)
                        add_indicator(telemetry, 'hidden_file_drop')
                        telemetry['severity_score'] += 15
                    break

            # ── 6. EXECUTABLE PERMISSIONS ON DROPPED FILES ──────────
            if 'chmod(' in line or 'fchmod(' in line:
                # PROT_EXEC or octal 0755/0777 patterns
                if re.search(r'0[0-7]*[157][0-7]{2}', line) or 'PROT_EXEC' in line:
                    path = extract_path_from_line(line)
                    add_unique(telemetry['file_mutations'], {
                        "syscall": "chmod_executable",
                        "path": path,
                        "detail": line.strip()[:200]
                    })
                    add_indicator(telemetry, 'executable_file_created')
                    telemetry['severity_score'] += 15

            # ── 7. PROCESS SPAWNING / EXECUTION ─────────────────────
            if 'execve(' in line:
                path = extract_path_from_line(line)
                # Flag suspicious child processes
                suspicious_cmds = ['curl', 'wget', 'nc', 'ncat', 'bash -c', 'sh -c', 'python', 'perl']
                if path or any(cmd in line for cmd in suspicious_cmds):
                    entry = {"path": path, "detail": line.strip()[:300]}
                    add_unique(telemetry['process_activity'], entry)
                    if any(cmd in line for cmd in ['nc ', 'ncat', 'bash -i']):
                        add_indicator(telemetry, 'reverse_shell_attempt')
                        telemetry['severity_score'] += 35
                    elif any(cmd in line for cmd in ['curl', 'wget']):
                        add_indicator(telemetry, 'download_execution')
                        telemetry['severity_score'] += 20

            # ── 8. PROCESS INJECTION (ptrace) ───────────────────────
            if 'ptrace(' in line and 'PTRACE_ATTACH' in line:
                add_unique(telemetry['process_activity'], {
                    "type": "ptrace_injection",
                    "detail": line.strip()[:200]
                })
                add_indicator(telemetry, 'process_injection')
                telemetry['severity_score'] += 30

            # ── 9. SHELLCODE INJECTION (mmap PROT_EXEC) ─────────────
            if 'mmap(' in line and 'PROT_EXEC' in line and 'PROT_WRITE' in line:
                add_unique(telemetry['process_activity'], {
                    "type": "mmap_rwx",
                    "detail": line.strip()[:200]
                })
                add_indicator(telemetry, 'shellcode_injection')
                telemetry['severity_score'] += 30

            # ── 10. EVIDENCE TAMPERING ───────────────────────────────
            if 'unlink(' in line or 'unlinkat(' in line or 'rmdir(' in line:
                path = extract_path_from_line(line)
                if path and any(p in path for p in EVIDENCE_DELETION_PATHS):
                    add_unique(telemetry['evidence_tampering'], {
                        "type": "log_deletion",
                        "path": path
                    })
                    add_indicator(telemetry, 'evidence_tampering')
                    telemetry['severity_score'] += 25

            # ── 11. RANSOMWARE HEURISTICS ────────────────────────────
            # Track mass writes to different files
            if 'write(' in line or 'pwrite' in line:
                path = extract_path_from_line(line)
                if path and '/tmp' not in path and '/proc' not in path:
                    dir_path = '/'.join(path.split('/')[:-1])
                    write_counter[dir_path] = write_counter.get(dir_path, 0) + 1

            # Track file renames (encrypting = rename to .locked etc.)
            if 'rename(' in line or 'renameat(' in line:
                rename_counter += 1
                for ext in RANSOMWARE_EXTENSIONS:
                    if ext in line:
                        add_indicator(telemetry, 'ransomware_file_encryption')
                        telemetry['severity_score'] += 40
                        break

        # ── POST-LOOP: RANSOMWARE MASS-WRITE DETECTION ──────────────
        # If writes to 10+ unique directories — ransomware pattern
        high_write_dirs = [d for d, count in write_counter.items() if count > 5]
        if len(high_write_dirs) > 10 or rename_counter > 20:
            add_indicator(telemetry, 'mass_file_modification')
            telemetry['severity_score'] += 35
            if rename_counter > 20:
                add_indicator(telemetry, 'possible_ransomware')

        # ── PARSE SUMMARY ────────────────────────────────────────────
        telemetry['parse_warnings'].append(
            f"Parsed {lines_parsed} strace lines"
        )

        # Cap severity score at 100
        telemetry['severity_score'] = min(telemetry['severity_score'], 100)

        print(json.dumps(telemetry, indent=2))

    except FileNotFoundError:
        print(json.dumps({"error": f"Telemetry file not found: {filepath}"}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e), "type": type(e).__name__}))
        sys.exit(1)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python3 telemetry_parser.py <strace_log_path>"}))
        sys.exit(1)
    parse_strace_logs(sys.argv[1])