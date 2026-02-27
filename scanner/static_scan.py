import magic
import pefile
import yara
import json
import sys
import os

def check_suspicious_imports(imports):
    BAD = ['keylogger', 'GetAsyncKeyState', 'CryptEncrypt', 'WinExec', 'CreateRemoteThread', 'WriteProcessMemory', 'VirtualAllocEx']
    return [i for i in imports if any(b.lower() in i.lower() for b in BAD)]

def check_extension_mismatch(filepath, file_type):
    _, ext = os.path.splitext(filepath)
    ext = ext.lower()
    
    # Very basic heuristics for demo purposes
    if 'executable' in file_type and ext not in ['.exe', '.dll', '.sys', '.com']:
        return True
    if 'pdf' in file_type and ext != '.pdf':
        return True
    return False

def scan(filepath):
    results = {
        'filepath': filepath,
        'mime_type': 'unknown',
        'extension_mismatch': False,
        'imports': [],
        'suspicious_imports': [],
        'yara_matches': [],
        'is_suspicious': False
    }
    
    try:
        if not os.path.exists(filepath):
            print(json.dumps({'error': 'File not found'}))
            return

        # Check real file type vs extension
        file_type = magic.from_file(filepath, mime=True)
        results['mime_type'] = file_type
        results['extension_mismatch'] = check_extension_mismatch(filepath, file_type)
        
        # PE analysis for executables
        if 'executable' in file_type or 'x-dosexec' in file_type or 'pe' in file_type.lower():
            try:
                pe = pefile.PE(filepath)
                if hasattr(pe, 'DIRECTORY_ENTRY_IMPORT'):
                    for entry in pe.DIRECTORY_ENTRY_IMPORT:
                        if entry.dll:
                            results['imports'].append(entry.dll.decode('utf-8', 'ignore'))
                        for imp in entry.imports:
                            if imp.name:
                                results['imports'].append(imp.name.decode('utf-8', 'ignore'))
                    
                results['suspicious_imports'] = check_suspicious_imports(results['imports'])
            except Exception as e:
                # Not a valid PE or error parsing
                pass
        
        # YARA rules
        rules_path = os.path.join(os.path.dirname(__file__), 'rules', 'malware_rules.yar')
        if os.path.exists(rules_path):
            rules = yara.compile(rules_path)
            matches = rules.match(filepath)
            results['yara_matches'] = [m.rule for m in matches]
        
        results['is_suspicious'] = bool(results['yara_matches'] or results['extension_mismatch'] or results['suspicious_imports'])
        
        print(json.dumps(results))
        
    except Exception as e:
        print(json.dumps({'error': str(e)}))

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No file path provided'}))
        sys.exit(1)
        
    scan(sys.argv[1])
