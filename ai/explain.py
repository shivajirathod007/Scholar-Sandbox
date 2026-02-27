import json
import sys
import ollama

SYSTEM_PROMPT = """
You are a cybersecurity teacher explaining threats to a first-year engineering student.
Given behavioral telemetry from a file analysis, you must:
1. Explain in simple, jargon-free language what the file tried to do
2. Name the threat category (Infostealer / Ransomware / Trojan / Adware / Clean)
3. Explain why this is dangerous to the student personally
4. Suggest a free, safe alternative if the file was a cracked tool
5. Give one practical learning tip

NEVER use technical terms without immediately explaining them in brackets.
Always respond in this exact JSON format:
{
  "risk_score": <0-100>,
  "threat_category": "<category>",
  "plain_explanation": "<2-3 sentences in plain English>",
  "technical_summary": "<brief technical detail>",
  "safe_alternative": "<specific tool name and URL>",
  "learning_tip": "<one actionable tip>"
}
"""

def get_ai_explanation(telemetry: dict, file_context: dict) -> dict:
    user_message = f"""
    Analyze this file behavior:
    File Type: {file_context.get('mime_type')}
    Disguised As: {file_context.get('disguised_as', 'unknown')}
    Telemetry: {json.dumps(telemetry, indent=2)}
    """
    
    try:
        client = ollama.Client(host='http://ollama:11434')
        response = client.chat(
            model='mistral',
            messages=[
                {'role': 'system', 'content': SYSTEM_PROMPT},
                {'role': 'user', 'content': user_message}
            ]
        )
        return response['message']['content']
    except Exception as e:
        return json.dumps({
            "risk_score": 50,
            "threat_category": "Unknown",
            "plain_explanation": f"AI model failed to respond: {str(e)}",
            "technical_summary": "Ollama connection or inference error",
            "safe_alternative": "N/A",
            "learning_tip": "Check if Ollama service is running and 'mistral' is pulled."
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
