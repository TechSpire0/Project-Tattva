# app/core/llm_service.py

import os
import google.generativeai as genai

# Load the API key and configure the client
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the model
model = genai.GenerativeModel('gemini-1.5-flash-latest')

def generate_hypothesis_from_finding(correlation_finding: dict) -> str:
    # Your existing function
    if not correlation_finding or correlation_finding.get("error"):
        return "No significant correlations were found in the current dataset."
    
    prompt = f"""
    You are a marine biology research assistant. Your task is to translate a raw statistical finding into a concise, insightful scientific hypothesis.

    **Statistical Finding:**
    - Correlation Coefficient: {correlation_finding.get('correlation', 'N/A'):.2f}
    - Environmental Variable: {correlation_finding.get('variable', 'N/A')}
    - Species: {correlation_finding.get('species_name', 'N/A')}

    **Instructions:**
    1. Analyze the direction of the correlation (positive or negative).
    2. Write a single, clear hypothesis in one sentence.
    3. Do not include the correlation value in the hypothesis.
    4. Frame it as an observation ready for further investigation.

    **Generate the hypothesis for the finding provided above:**
    """
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return "Failed to generate hypothesis due to an API error."

# -----------------------------
# New function for conversational AI
# -----------------------------
def generate_chat_response(user_input: str, context: str = "") -> str:
    """
    Generate a conversational response from the Gemini model.
    Optional context can include sightings, species info, or any prompt instructions.
    """
    prompt = f"""
    You are a helpful marine biology research assistant.
    {context}

    User Question: {user_input}
    Provide a clear and concise answer.
    """
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error calling Gemini API for chat: {e}")
        return "Sorry, I couldn't generate a response at this time."