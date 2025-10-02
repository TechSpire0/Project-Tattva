# main.py
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from minio import Minio
import uuid
import logging
from pydantic import BaseModel
import pandas as pd
from app.models import EdnaSequence
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from Bio import SeqIO
from difflib import SequenceMatcher
import tempfile

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
    title="Tattva Backend",
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
@app.get("/api/species", tags=["Species"])
async def get_all_species(db: Session = Depends(get_db)):
    species = db.query(models.Species).all()
    return [schemas.Species.model_validate(s).model_dump(exclude_none=True) for s in species]


# --- Sightings ---
@app.get("/api/sightings", tags=["Sightings"])
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

        # Bounding box filter if provided
        if all(v is not None for v in (min_lat, min_lon, max_lat, max_lon)):
            if not (-90 <= min_lat <= 90 and -90 <= max_lat <= 90 and
                    -180 <= min_lon <= 180 and -180 <= max_lon <= 180):
                raise HTTPException(status_code=400, detail="Invalid bbox coordinates")
            if min_lat > max_lat or min_lon > max_lon:
                raise HTTPException(status_code=400, detail="Invalid bbox: min values must be <= max values")

            envelope = func.ST_MakeEnvelope(min_lon, min_lat, max_lon, max_lat, 4326)
            query = query.filter(func.ST_Intersects(models.Sighting.location, envelope))

        # Latest first
        query = query.order_by(models.Sighting.sighting_date.desc())
        query_results = query.limit(limit).all()

        response_data = []
        for row in query_results:
            if row.latitude is None or row.longitude is None:
                continue

            # Build species data with only non-null fields
            species = schemas.Species.model_validate({
                "id": row.species_id,
                "scientific_name": row.scientific_name,
                "common_name": row.common_name,
                "description": row.description,
                "habitat": row.habitat
            })

            # Build sighting data
            sighting = schemas.Sighting.model_validate({
                "sighting_id": f"CMLRE-SIGHT-{row.id}",
                "latitude": float(row.latitude),
                "longitude": float(row.longitude),
                "sighting_date": row.sighting_date,
                "sea_surface_temp_c": row.sea_surface_temp_c,
                "salinity_psu": row.salinity_psu,
                "chlorophyll_mg_m3": row.chlorophyll_mg_m3,
                "species": species
            })

            # Dump while excluding nulls
            response_data.append(sighting.model_dump(exclude_none=True))

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
            db=db,   
            context=request.context or ""
        )
        logging.info(f"Generated response: {response_text}")
        return ChatResponse(reply=response_text)
    except Exception as e:
        logging.error(f"Error generating chat response: {e}", exc_info=True)
        return ChatResponse(reply="Sorry, I couldn't generate a response at this time.")


@app.post("/api/upload/csv", tags=["Upload"])
async def upload_combined_csv(
    db: Session = Depends(get_db),
    minio: Minio = Depends(get_minio_client),
    file: UploadFile = File(...),
):
    if not file.filename.endswith(".csv") and not file.filename.endswith(".tsv"):
        raise HTTPException(status_code=400, detail="Only CSV/TSV files supported")

    try:
        # Save to tmpfile for both Pandas + MinIO
        tmpfile = tempfile.NamedTemporaryFile(delete=False, suffix=".csv")
        contents = await file.read()
        tmpfile.write(contents)
        tmpfile.close()

        # Upload original file to MinIO for backup
        unique_name = f"uploads/{uuid.uuid4()}-{file.filename}"
        minio.put_object("sightings", unique_name, open(tmpfile.name, "rb"), len(contents), content_type="text/csv")

        # Parse with Pandas
        df = pd.read_csv(tmpfile.name, sep=None, engine="python")
        df.columns = [c.strip().lower() for c in df.columns]

        inserted_species = 0
        inserted_sightings = 0

        for _, row in df.iterrows():

            print({
                "scientificName": row.get("scientificname"),
                "taxonRank": row.get("taxonrank"),
                "eventDate": row.get("eventdate")
            })
            # --- Clean rank ---
            rank = str(row.get("taxonrank", "")).strip().lower()
            if rank != "species":
                continue

            # --- Flexible date parsing ---
            try:
                sighting_date = pd.to_datetime(str(row.get("eventdate")), dayfirst=True).date()
            except Exception:
                logging.warning(f"Skipping row with bad date: {row.get('eventdate')}")
                continue

            # Ensure species exists
            species = db.query(models.Species).filter_by(scientific_name=row["scientificname"]).first()
            if not species:
                species = models.Species(
                    scientific_name=row["scientificname"],
                    common_name=None,
                    description=None,
                    habitat=None,
                )
                db.add(species)
                db.flush()
                inserted_species += 1

            # Insert sighting
            sighting = models.Sighting(
                species_id=species.id,
                sighting_date=sighting_date,
                sea_surface_temp_c=row.get("sst"),
                salinity_psu=row.get("sss"),
                location=f"SRID=4326;POINT({row['decimallongitude']} {row['decimallatitude']})",
            )
            db.add(sighting)
            inserted_sightings += 1

        db.commit()

        return {
            "success": True,
            "species_added": inserted_species,
            "sightings_added": inserted_sightings,
            "minio_path": unique_name,
        }

    except Exception as e:
        logging.error(f"Error uploading CSV: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/upload/edna", tags=["eDNA"])
async def upload_edna_file(
    db: Session = Depends(get_db),
    minio: Minio = Depends(get_minio_client),
    file: UploadFile = File(...),
):
    if not (file.filename.endswith(".fasta") or file.filename.endswith(".fa")):
        raise HTTPException(status_code=400, detail="Only .fasta/.fa files supported")

    try:
        # Save temp file
        tmpfile = tempfile.NamedTemporaryFile(delete=False, suffix=".fasta")
        contents = await file.read()
        tmpfile.write(contents)
        tmpfile.close()

        # Upload raw file to MinIO
        unique_name = f"edna/{uuid.uuid4()}-{file.filename}"
        minio.put_object("edna", unique_name, open(tmpfile.name, "rb"), len(contents), content_type="text/plain")

        # Parse FASTA
        inserted = 0
        for record in SeqIO.parse(tmpfile.name, "fasta"):
            header = record.description
            seq = str(record.seq)

            # Try to extract species name if header contains "species="
            species_name = None
            if "species=" in header:
                try:
                    species_name = header.split("species=")[1].split()[0]
                except Exception:
                    pass

            metadata = {"id": record.id, "description": record.description}

            new_seq = EdnaSequence(
                header=header,
                sequence=seq,
                species_name=species_name,
                metadata=metadata,
            )
            db.add(new_seq)
            inserted += 1

        db.commit()
        return {"success": True, "inserted": inserted, "minio_path": unique_name}

    except Exception as e:
        logging.error(f"Error uploading eDNA: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/edna/match", response_model=schemas.EdnaMatchResponse, tags=["eDNA"])
def match_edna_sequence(request: schemas.EdnaMatchRequest, db: Session = Depends(get_db)):
    try:
        match = db.query(EdnaSequence).filter(EdnaSequence.sequence == request.sequence).first()

        if match:
            return schemas.EdnaMatchResponse(
                success=True,
                matched=True,
                header=match.header
            )
        else:
            return schemas.EdnaMatchResponse(success=True, matched=False)
    except Exception as e:
        import logging
        logging.error(f"Error matching eDNA: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))