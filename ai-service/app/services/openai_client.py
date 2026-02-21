import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def chat_completion(system_prompt: str, user_prompt: str) -> str:
    """
    Unified chat completion that switches between OpenAI, Gemini and Ollama
    based on the AI_PROVIDER environment variable.
    """
    provider = os.getenv("AI_PROVIDER", "openai").lower()
    
    try:
        if provider == "gemini":
            res = _gemini_completion(system_prompt, user_prompt)
        elif provider == "ollama":
            res = _ollama_completion(system_prompt, user_prompt)
        else:
            res = _openai_completion(system_prompt, user_prompt)
        
        print(f"AI Response ({provider}): {res[:200]}...")
        return res
    except Exception as e:
        print(f"Error with provider {provider}: {e}")
        raise e


def _openai_completion(system_prompt: str, user_prompt: str) -> str:
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.2
    )
    return response.choices[0].message.content


def _gemini_completion(system_prompt: str, user_prompt: str) -> str:
    # Use 'gemini-flash-latest' for stability and better limits
    model = genai.GenerativeModel('gemini-flash-latest')
    
    combined_prompt = f"""
System Instruction:
{system_prompt}

User Request:
{user_prompt}
"""
    response = model.generate_content(combined_prompt)
    return response.text


def _ollama_completion(system_prompt: str, user_prompt: str) -> str:
    """
    Calls local Ollama instance using the OpenAI-compatible API
    """
    from openai import OpenAI
    
    base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")
    model = os.getenv("OLLAMA_MODEL", "llama3")
    
    client = OpenAI(
        base_url=base_url,
        api_key="ollama",  # Required but ignored by Ollama
    )
    
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.2,
        response_format={"type": "json_object"}
    )
    return response.choices[0].message.content
