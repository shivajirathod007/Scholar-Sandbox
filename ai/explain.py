import json
import sys
import ollama

import os

def load_system_prompt() -> str:
    """Loads the AI system prompt from the prompts directory."""
    prompt_path = os.path.join(os.path.dirname(__file__), 'prompts', 'system_prompt.txt')
    try:
        with open(prompt_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        print(json.dumps({"error": "System prompt file not found."}))
        sys.exit(1)

SYSTEM_PROMPT = load_system_prompt()

def get_ai_explanation(telemetry: dict, file_context: dict) -> dict:
    user_message = f"""
    Analyze this file behavior:
    File Type: {file_context.get('mime_type')}
    Disguised As: {file_context.get('disguised_as', 'unknown')}
    Telemetry: {json.dumps(telemetry, indent=2)}
    """
    
    try:
        # Use host.docker.internal to reach Ollama if it's running on the host, 
        # or the explicitly provided host
        ollama_host = os.environ.get('OLLAMA_HOST', 'http://ollama:11434')
        client = ollama.Client(host=ollama_host)
        response = client.chat(
            model='mistral',
            messages=[
                {'role': 'system', 'content': SYSTEM_PROMPT},
                {'role': 'user', 'content': user_message}
            ]
        )
        content = response.message.content
        # Strip markdown code fences Ollama sometimes adds
        content = content.replace("```json", "").replace("```", "").strip()
        return content
    except Exception as e:
        return json.dumps({
            "risk_score": 50,
            "threat_category": "Unknown",
            "plain_explanation": f"AI model failed to respond: Failed to connect to Ollama. Please check that Ollama is downloaded, running and accessible. https://ollama.com/download",
            "technical_summary": "Ollama connection or inference error",
            "safe_alternative": "N/A",
            "learning_tip": f"Check if Ollama service is running. Details: {str(e)}"
        })

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing arguments"}))
        sys.exit(1)
        
    try:
        telemetry_data = json.loads(sys.argv[1])
        context_data = json.loads(sys.argv[2])
        res = get_ai_explanation(telemetry_data, context_data)
        print(res)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
