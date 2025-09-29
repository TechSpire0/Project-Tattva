# app/core/llm_service.py

import os
import google.generativeai as genai
import redis
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models

# Load the API key and configure the client
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the model
model = genai.GenerativeModel('gemini-pro-latest')

# Redis client
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    decode_responses=True
)

def cached_hypothesis_key():
    return "tattva:hypothesis:latest"

def generate_hypothesis_from_finding(correlation_finding: dict) -> str:
    cache_key = cached_hypothesis_key()
    cached = redis_client.get(cache_key)
    if cached:
        return cached

    if not correlation_finding or correlation_finding.get("error"):
        return "No significant correlations were found in the current dataset."

    correlation_value = correlation_finding.get("correlation", 0.0)
    variable = correlation_finding.get("variable") or "Unknown variable"
    species_name = correlation_finding.get("species_name") or "Unknown species"

    prompt = f"""
    You are a marine biology research assistant. Your task is to translate a raw statistical finding into a concise, insightful scientific hypothesis.

    **Statistical Finding:**
    - Correlation Coefficient: {correlation_value:.2f}
    - Environmental Variable: {variable}
    - Species: {species_name}

    **Instructions:**
    1. Analyze the direction of the correlation (positive or negative).
    2. Write a single, clear hypothesis in one sentence.
    3. Do not include the correlation value in the hypothesis.
    4. Frame it as an observation ready for further investigation.

    **Generate the hypothesis for the finding provided above:**
    """

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        redis_client.setex(cache_key, 600, text)
        return text
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return "Failed to generate hypothesis due to an API error."


# -----------------------------
# Conversational AI with DB context
# -----------------------------

def generate_chat_response(user_input: str, db: Session, context: str = "") -> str:
    """
    Generate a conversational response from Gemini, enriched with DB context.
    """
    # Pull top species stats
    try:
        species_counts = db.query(
            models.Species.scientific_name, func.count(models.Sighting.id)
        ).join(
            models.Sighting, models.Sighting.species_id == models.Species.id
        ).group_by(
            models.Species.scientific_name
        ).order_by(
            func.count(models.Sighting.id).desc()
        ).limit(5).all()

        species_summary = (
            ", ".join([f"{name} ({count} sightings)" for name, count in species_counts])
            if species_counts else "No species data available"
        )
    except Exception as e:
        print(f"[Chat] DB query failed: {e}")
        species_summary = "Species data unavailable due to a database error."

    # Build prompt
    prompt = f"""
    You are a helpful marine biology research assistant.

    Context:
    - Top observed species: {species_summary}
    {context}

    User Question: {user_input}

    Provide a clear, concise, and domain-aware answer.
    """

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error calling Gemini API for chat: {e}")
        return "Sorry, I couldn't generate a response at this time."
