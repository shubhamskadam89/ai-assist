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
    Unified chat completion that switches between OpenAI and Gemini
    based on the AI_PROVIDER environment variable.
    """
    provider = os.getenv("AI_PROVIDER", "openai").lower()
    
    if provider == "gemini":
        try:
            return _gemini_completion(system_prompt, user_prompt)
        except Exception as e:
            print(f"Gemini error: {e}")
            raise e # Explicitly fail rather than falling back to broken OpenAI key
    
    return _openai_completion(system_prompt, user_prompt)


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
