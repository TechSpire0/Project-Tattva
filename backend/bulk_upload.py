#backend/bulk_upload.py

import pandas as pd
from app.database import SessionLocal
from app.models import Species, Sighting
from geoalchemy2.shape import from_shape
from shapely.geometry import Point
import logging
from sqlalchemy.exc import IntegrityError

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def upload_csv_to_db(filepath: str):
    """
    Reads a comma-separated CSV file from GBIF, cleans it, and uploads the sighting data
    into the PostgreSQL database according to the defined models.
    """
    db = SessionLocal()
    try:
        logger.info(f"Reading data from {filepath}...")
        df = pd.read_csv(filepath, sep=',', on_bad_lines='skip', low_memory=False)

        logger.info("Cleaning and transforming data...")

        # Rename columns to match model expectations
        df = df.rename(columns={
            'scientificName': 'scientific_name',
            'decimalLatitude': 'latitude',
            'decimalLongitude': 'longitude',
            'eventDate': 'sighting_date',
            'sst': 'sea_surface_temp_c',
            'sss': 'salinity_psu',
            'chlorophyll': 'chlorophyll_mg_m3'  # optional, if present
        })

        # Ensure required columns are present, fill missing ones with None
        required_cols = ['scientific_name', 'latitude', 'longitude', 'sighting_date']
        optional_cols = ['sea_surface_temp_c', 'salinity_psu', 'chlorophyll_mg_m3']
        for col in required_cols + optional_cols:
            if col not in df.columns:
                df[col] = None

        # Drop rows with missing essential data
        df = df.dropna(subset=['scientific_name', 'latitude', 'longitude', 'sighting_date'])

        # Convert sighting_date to datetime
        df['sighting_date'] = pd.to_datetime(df['sighting_date'], errors='coerce')
        df = df.dropna(subset=['sighting_date'])

        logger.info(f"Processing {len(df)} valid records.")

        # Load existing species for faster lookup
        existing_species = {s.scientific_name: s.id for s in db.query(Species).all()}
        new_sightings = []

        for _, row in df.iterrows():
            lat, lon = row['latitude'], row['longitude']
            if not (-90 <= lat <= 90 and -180 <= lon <= 180):
                continue

            species_id = existing_species.get(row['scientific_name'])
            if not species_id:
                # Create a new species record if it doesn't exist
                new_species = Species(scientific_name=row['scientific_name'])
                db.add(new_species)
                db.flush()
                species_id = new_species.id
                existing_species[row['scientific_name']] = species_id

            sighting = Sighting(
                species_id=species_id,
                location=from_shape(Point(lon, lat), srid=4326),
                sighting_date=row['sighting_date'],
                sea_surface_temp_c=row.get('sea_surface_temp_c'),
                salinity_psu=row.get('salinity_psu'),
                chlorophyll_mg_m3=row.get('chlorophyll_mg_m3')
            )
            new_sightings.append(sighting)

        if new_sightings:
            logger.info(f"Inserting {len(new_sightings)} sightings into the database...")
            BATCH_SIZE = 1000
            for i in range(0, len(new_sightings), BATCH_SIZE):
                batch = new_sightings[i:i+BATCH_SIZE]
                db.bulk_save_objects(batch)
                db.commit()
            logger.info("Upload complete.")
        else:
            logger.warning("No sightings to insert.")

    except Exception as e:
        logger.error(f"An error occurred: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    GBIF_DATA_FILE = r"D:\Hackathons\SIH - 1\TATTVA\local_data\postgres_data\data.csv"  # Path to the uploaded file
    upload_csv_to_db(GBIF_DATA_FILE)