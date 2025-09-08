# main.py
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from minio import Minio
import uuid
import logging
from pydantic import BaseModel

# --- Local imports ---
from app import models, schemas
from app.database import SessionLocal, engine, get_db
from app.core.minio_client import get_minio_client
from app.ml.classifier import otolith_classifier
from app.core import analysis_service, llm_service

# Configure logging
logging.basicConfig(level=logging.INFO)

# Create all tables
models.Base.metadata.create_all(bind=engine)

# Initialize FastAPI
app = FastAPI(
    title="Tattva API",
    description="Backend for SIH 2025 AI-Driven Marine Data Platform",
    version="1.0.0",
    docs_url=None
)

# --- Swagger ---
from fastapi.openapi.docs import get_swagger_ui_html

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title
    )

# --- CORS ---
origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Root ---
@app.get("/", include_in_schema=False)
async def root():
    return {"message": "TATTVA is running!"}

# --- Species ---
@app.get("/api/species", response_model=List[schemas.Species], tags=["Species"])
async def get_all_species(db: Session = Depends(get_db)):
    return db.query(models.Species).all()

# --- Sightings ---
@app.get("/api/sightings_sample", response_model=List[schemas.Sighting], tags=["Sightings"])
async def get_sightings_sample(db: Session = Depends(get_db), limit: int = 50):
    query = (
        db.query(
            models.Sighting,
            func.ST_Y(models.Sighting.location).label("latitude"),
            func.ST_X(models.Sighting.location).label("longitude")
        )
        .filter(models.Sighting.location.isnot(None))
        .order_by(func.random())
        .limit(limit)
        .all()
    )
    response_data = []
    for s, lat, lon in query:
        response_data.append({
            "sighting_id": f"CMLRE-SIGHT-{s.id}",
            "latitude": float(lat),
            "longitude": float(lon),
            "sighting_date": s.sighting_date,
            "sea_surface_temp_c": float(s.sea_surface_temp_c) if s.sea_surface_temp_c else None,
            "salinity_psu": float(s.salinity_psu) if s.salinity_psu else None,
            "chlorophyll_mg_m3": float(s.chlorophyll_mg_m3) if s.chlorophyll_mg_m3 else None,
            "species": s.species,
        })
    return response_data

@app.get("/api/sightings", response_model=List[schemas.Sighting], tags=["Sightings"])
async def get_sightings_data(db: Session = Depends(get_db), skip: int = 0, limit: int = 500):
    try:
        query_results = (
            db.query(
                models.Sighting.id,
                models.Sighting.sighting_date,
                models.Sighting.sea_surface_temp_c,
                models.Sighting.salinity_psu,
                models.Sighting.chlorophyll_mg_m3,
                models.Species.id.label("species_id"),
                models.Species.scientific_name,
                models.Species.common_name,
                models.Species.description,
                models.Species.habitat,
                func.ST_Y(models.Sighting.location).label("latitude"),
                func.ST_X(models.Sighting.location).label("longitude")
            )
            .outerjoin(models.Species, models.Sighting.species_id == models.Species.id)
            .offset(skip)
            .limit(limit)
            .all()
        )

        response_data = []
        for row in query_results:
            species_data = {
                "id": row.species_id or 0,
                "scientific_name": row.scientific_name or "Unknown",
                "common_name": row.common_name or "Unknown",
                "description": row.description or "",
                "habitat": row.habitat or ""
            }
            response_data.append({
                "sighting_id": f"CMLRE-SIGHT-{row.id}",
                "latitude": float(row.latitude) if row.latitude is not None else 0.0,
                "longitude": float(row.longitude) if row.longitude is not None else 0.0,
                "sighting_date": row.sighting_date,
                "sea_surface_temp_c": float(row.sea_surface_temp_c) if row.sea_surface_temp_c else None,
                "salinity_psu": float(row.salinity_psu) if row.salinity_psu else None,
                "chlorophyll_mg_m3": float(row.chlorophyll_mg_m3) if row.chlorophyll_mg_m3 else None,
                "species": species_data
            })

        return response_data

    except Exception as e:
        logging.error(f"Error fetching sightings: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

# --- Classify Otolith ---
@app.post("/api/classify_otolith", tags=["AI Models"])
async def classify_otolith_image(db: Session = Depends(get_db),
                                 minio: Minio = Depends(get_minio_client),
                                 file: UploadFile = File(...)):
    try:
        contents = await file.read()
        prediction_results = otolith_classifier.predict(contents)
        file_extension = file.filename.split('.')[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        object_name = f"{prediction_results['predicted_species'].replace(' ', '_')}/{unique_filename}"
        file.file.seek(0)
        file_size = len(contents)
        minio.put_object("otoliths", object_name, file.file, file_size, content_type=file.content_type)
        return prediction_results
    except Exception as e:
        logging.error(f"Error in classify_otolith_image: {e}", exc_info=True)
        return {"error": str(e)}

# --- Hypotheses ---
@app.get("/api/hypotheses", response_model=dict, tags=["X-Factor"])
async def get_ai_hypotheses(db: Session = Depends(get_db)):
    correlation_finding = analysis_service.find_strongest_correlation(db)
    if correlation_finding.get("species_id"):
        species = db.query(models.Species).filter(models.Species.id == correlation_finding["species_id"]).first()
        if species:
            correlation_finding["species_name"] = species.common_name
    hypothesis_text = llm_service.generate_hypothesis_from_finding(correlation_finding)
    return {"hypothesis": hypothesis_text, "source_finding": correlation_finding}

# --- Conversational AI ---
class ChatRequest(BaseModel):
    user_input: str
    context: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str

@app.post("/api/chat", response_model=ChatResponse, tags=["Conversational AI"])
async def chat_endpoint(request: ChatRequest):
    logging.info(f"Received chat request: {request.user_input}")
    try:
        response_text = llm_service.generate_chat_response(
            user_input=request.user_input,
            context=request.context or ""
        )
        logging.info(f"Generated response: {response_text}")
        return ChatResponse(reply=response_text)
    except Exception as e:
        logging.error(f"Error generating chat response: {e}", exc_info=True)
        return ChatResponse(reply="Sorry, I couldn't generate a response at this time.")
