import os
import google.generativeai as genai

# Load the API key and configure the client
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the model using the compatible API
model = genai.GenerativeModel('gemini-1.5-flash-latest')

def generate_hypothesis_from_finding(correlation_finding: dict) -> str:
    """
    Takes a statistical finding and uses the Gemini LLM to generate a
    human-readable scientific hypothesis.
    """
    if not correlation_finding or correlation_finding.get("error"):
        return "No significant correlations were found in the current dataset."

    # Prompt Engineering: Give the model a persona, context, and instructions.
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

    **Example Output:**
    A strong positive correlation was observed between elevated sea surface temperatures and the population density of Indian Mackerel in the Arabian Sea.

    **Generate the hypothesis for the finding provided above:**
    """
    try:
        # Use the new library to generate the content
        response = model.generate_content(prompt)
        return response.text.strip()

    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return "Failed to generate hypothesis due to an API error."