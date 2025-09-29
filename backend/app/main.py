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
import pandas as pd

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
origins = ["http://localhost:5173", "http://localhost:3000"]
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

@app.get("/api/sightings", response_model=List[schemas.Sighting], tags=["Sightings"])
async def get_sightings_data(
    db: Session = Depends(get_db),
    limit: int = 300,
    min_lat: Optional[float] = None,
    min_lon: Optional[float] = None,
    max_lat: Optional[float] = None,
    max_lon: Optional[float] = None,
):
    try:
        MAX_LIMIT = 5000
        if limit is None or limit <= 0:
            limit = 300
        if limit > MAX_LIMIT:
            limit = MAX_LIMIT

        query = db.query(
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
            func.ST_X(models.Sighting.location).label("longitude"),
        ).outerjoin(models.Species, models.Sighting.species_id == models.Species.id)

        # Only return rows that have a location
        query = query.filter(models.Sighting.location.isnot(None))

        # If frontend sends a bounding box, filter with PostGIS
        if all(v is not None for v in (min_lat, min_lon, max_lat, max_lon)):
            if not (-90 <= min_lat <= 90 and -90 <= max_lat <= 90 and -180 <= min_lon <= 180 and -180 <= max_lon <= 180):
                raise HTTPException(status_code=400, detail="Invalid bbox coordinates")
            if min_lat > max_lat or min_lon > max_lon:
                raise HTTPException(status_code=400, detail="Invalid bbox: min values must be <= max values")

            envelope = func.ST_MakeEnvelope(min_lon, min_lat, max_lon, max_lat, 4326)
            query = query.filter(func.ST_Intersects(models.Sighting.location, envelope))

        # Order by date (latest first) instead of random
        query = query.order_by(models.Sighting.sighting_date.desc())
        query_results = query.limit(limit).all()

        response_data = []
        for row in query_results:
            if row.latitude is None or row.longitude is None:
                continue
            species_data = {
                "id": row.species_id or 0,
                "scientific_name": row.scientific_name or "Unknown",
                "common_name": row.common_name or "Unknown",
                "description": row.description or "",
                "habitat": row.habitat or "",
            }
            response_data.append({
                "sighting_id": f"CMLRE-SIGHT-{row.id}",
                "latitude": float(row.latitude),
                "longitude": float(row.longitude),
                "sighting_date": row.sighting_date,
                "sea_surface_temp_c": float(row.sea_surface_temp_c) if row.sea_surface_temp_c else None,
                "salinity_psu": float(row.salinity_psu) if row.salinity_psu else None,
                "chlorophyll_mg_m3": float(row.chlorophyll_mg_m3) if row.chlorophyll_mg_m3 else None,
                "species": species_data,
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

CORRELATION_THRESHOLD = 0.1

# --- Hypotheses ---
@app.get("/api/hypotheses", response_model=dict, tags=["X-Factor"])
async def get_ai_hypotheses(db: Session = Depends(get_db)):
    correlation_finding = analysis_service.find_strongest_correlation(db)

    if not correlation_finding or correlation_finding.get("species_id") is None:
        return {
            "hypothesis": "No significant correlations found.",
            "source_finding": {
                "variable": correlation_finding.get("variable"),
                "species_id": correlation_finding.get("species_id"),
                "species_name": None,
            },
        }

    # Attach species name
    species = db.query(models.Species).filter(
        models.Species.id == correlation_finding["species_id"]
    ).first()
    if species:
        correlation_finding["species_name"] = species.common_name or species.scientific_name

    # Remove correlation before sending
    if "correlation" in correlation_finding:
        correlation_finding.pop("correlation")

    hypothesis_text = llm_service.generate_hypothesis_from_finding(correlation_finding)

    return {"hypothesis": hypothesis_text, "source_finding": correlation_finding}




# --- Conversational AI ---
class ChatRequest(BaseModel):
    user_input: str
    context: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str

@app.post("/api/chat", response_model=ChatResponse, tags=["Conversational AI"])
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    logging.info(f"Received chat request: {request.user_input}")
    try:
        response_text = llm_service.generate_chat_response(
            user_input=request.user_input,
            db=db,   # ✅ pass session
            context=request.context or ""
        )
        logging.info(f"Generated response: {response_text}")
        return ChatResponse(reply=response_text)
    except Exception as e:
        logging.error(f"Error generating chat response: {e}", exc_info=True)
        return ChatResponse(reply="Sorry, I couldn't generate a response at this time.")
