# app/core/embedding_service.py
import google.generativeai as genai

embed_model = "models/embedding-001"

def get_embedding(text: str) -> list[float]:
    result = genai.embed_content(model=embed_model, content=text)
    return result["embedding"]
