# app/core/llm_service.py

import os
import google.generativeai as genai
import redis
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models
import chromadb
from chromadb.utils import embedding_functions

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

# === Setup Chroma ===
chroma_client = chromadb.HttpClient(host="localhost", port=8001)

# Load the collection (should already exist after ingestion)
collection = chroma_client.get_or_create_collection(
    name="species_data",
    embedding_function=embedding_functions.DefaultEmbeddingFunction()
)

# ------------------------
# Hypothesis Generator
# -----------------------

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


# ------------------------
# Conversational AI (Hybrid DB + RAG)
# ------------------------
def generate_chat_response(user_input: str, db: Session, context: str = "") -> str:
    """
    Generate an answer using BOTH Postgres (DB) and Chroma (RAG).
    """

    # --- Step 1: Retrieve semantic docs from Chroma ---
    try:
        results = collection.query(query_texts=[user_input], n_results=5)
        retrieved_docs = results.get("documents", [[]])[0]
        rag_context = "\n".join(retrieved_docs) if retrieved_docs else "No related documents found."
    except Exception as e:
        print(f"Error querying Chroma: {e}")
        rag_context = "No related documents available."

    # --- Step 2: Retrieve structured data from DB ---
    db_context = ""
    try:
        if "species" in user_input.lower():
            species_list = db.query(models.Species).limit(10).all()
            db_context = "Observed species: " + ", ".join([s.scientific_name for s in species_list])
        elif "sighting" in user_input.lower() or "vizag" in user_input.lower():
            sightings = db.query(models.Sighting).limit(10).all()
            db_context = f"Sample sightings: {len(sightings)} records (showing 10)."
        else:
            db_context = "No specific DB query matched."
    except Exception as e:
        print(f"Error querying DB: {e}")
        db_context = "Failed to fetch live data."

    # --- Step 3: Merge into a prompt ---
    prompt = f"""
    You are a helpful marine biology research assistant.

    --- User Question ---
    {user_input}

    --- Live Database Facts ---
    {db_context}

    --- Retrieved Knowledge (RAG) ---
    {rag_context}

    --- Instructions ---
    1. Use both DB facts and retrieved knowledge to answer.
    2. If DB has numbers/stats, include them.
    3. If RAG has descriptions, use them.
    4. Be clear, concise, and scientific.
    """

    # --- Step 4: Call Gemini ---
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return "Sorry, I couldn't generate a response at this time."