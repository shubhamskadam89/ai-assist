import json


def extract_json(text: str):
    try:
        # Strip <think> blocks which are common in DeepSeek-R1 responses
        import re
        text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)
        
        # Try to find the first '{' and last '}'
        start = text.find("{")
        end = text.rfind("}") + 1
        if start == -1 or end == 0:
            print(f"No JSON found in text: {text}")
            return {}
        
        json_str = text[start:end]
        return json.loads(json_str)
    except Exception as e:
        print(f"Error extracting JSON: {e}")
        print(f"Raw text: {text}")
        return {}
