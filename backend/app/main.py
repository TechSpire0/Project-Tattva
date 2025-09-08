from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

# --- Local Imports ---
from . import schemas, models
from .database import SessionLocal, engine, get_db
from .core.llm_service import generate_chat_response
from .ml.classifier import otolith_classifier
from .core.minio_client import get_minio_client
from minio import Minio
import uuid

# --- Logging ---
logging.basicConfig(level=logging.INFO)

# --- Create Tables ---
models.Base.metadata.create_all(bind=engine)

# --- FastAPI App ---
app = FastAPI(
    title="Tattva API",
    description="The backend service for the SIH 2025 AI-Driven Marine Data Platform.",
    version="1.0.0",
    docs_url="/docs"
)

# --- CORS Middleware ---
origins = [
    "http://localhost:3000",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==============================================================================

# API ENDPOINTS

@app.get("/", include_in_schema=False)
async def root():
    return {"message": "TATTVA is running!"}

@app.get("/api/species", response_model=List[schemas.Species], tags=["Species"])
async def get_all_species(db: Session = Depends(get_db)):
    """
    Retrieves a list of all marine species from the PostgreSQL database.
    """
    return db.query(models.Species).all()


@app.get("/api/sightings_sample", response_model=List[schemas.Sighting], tags=["Sightings"])
async def get_sightings_sample(db: Session = Depends(get_db), limit: int = 50):
    """
    Return a sample of sightings to display on map quickly.
    """
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
async def get_sightings_data(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 500
):
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
                "sea_surface_temp_c": float(row.sea_surface_temp_c) if row.sea_surface_temp_c is not None else None,
                "salinity_psu": float(row.salinity_psu) if row.salinity_psu is not None else None,
                "chlorophyll_mg_m3": float(row.chlorophyll_mg_m3) if row.chlorophyll_mg_m3 is not None else None,
                "species": species_data
            })

        return response_data

    except Exception as e:
        logging.error(f"Error fetching sightings: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.post("/api/classify_otolith", tags=["AI Models"])
async def classify_otolith_image(
    db: Session = Depends(get_db),
    minio: Minio = Depends(get_minio_client),
    file: UploadFile = File(...)
):
    try:
        contents = await file.read()
        
        # 1. Test the classifier
        prediction_results = otolith_classifier.predict(contents)
        
        # 2. Prepare file for MinIO
        file_extension = file.filename.split('.')[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        object_name = f"{prediction_results['predicted_species'].replace(' ', '_')}/{unique_filename}"

        file.file.seek(0)
        file_size = len(contents)

        # 3. Upload to MinIO
        minio.put_object(
            "otoliths",
            object_name,
            file.file,
            file_size,
            content_type=file.content_type
        )

        return prediction_results

    except Exception as e:
        # This will print the full error to your console and return it in JSON
        print("Error in classify_otolith_image:", str(e))
        return {"error": str(e)}


@app.get("/api/hypotheses", response_model=dict, tags=["X-Factor"])
async def get_ai_hypotheses(db: Session = Depends(get_db)):
    """
    Analyzes the entire database to find the strongest statistical correlation
    and uses a Generative AI model to formulate a natural language hypothesis.
    """
    correlation_finding = analysis_service.find_strongest_correlation(db)

    if correlation_finding.get("species_id"):
        species = db.query(models.Species).filter(models.Species.id == correlation_finding["species_id"]).first()
        if species:
            correlation_finding["species_name"] = species.common_name

    hypothesis_text = llm_service.generate_hypothesis_from_finding(correlation_finding)

    return {
        "hypothesis": hypothesis_text,
        "source_finding": correlation_finding
    }

class ChatRequest(BaseModel):
    user_input: str
    context: Optional[str] = ""

class ChatResponse(BaseModel):
    reply: str

@app.get("/")
async def root():
    return {"message": "TATTVA backend running!"}

@app.post("/api/chat", response_model=ChatResponse, tags=["Conversational AI"])
async def chat_endpoint(request: ChatRequest):
    """
    Generate a conversational response using Gemini LLM.
    """
    try:
        # Logging input
        logging.info(f"Received chat request: {request.user_input}")
        response_text = generate_chat_response(
            user_input=request.user_input,
            context=request.context or ""
        )
        logging.info(f"Generated response: {response_text}")
        return {"reply": response_text}
    except Exception as e:
        logging.error(f"Error generating chat response: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")