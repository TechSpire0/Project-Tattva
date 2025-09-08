# 1. Import necessary components from SQLAlchemy and GeoAlchemy2.
from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP, Date, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
from .database import Base

class Species(Base):
    __tablename__ = "species"

    id = Column(Integer, primary_key=True)
    scientific_name = Column(String, unique=True, nullable=False)
    common_name = Column(String)
    description = Column(Text)
    habitat = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

class Sighting(Base):
    __tablename__ = "sightings"

    id = Column(Integer, primary_key=True)
    species_id = Column(Integer, ForeignKey("species.id"))
    location = Column(Geometry(geometry_type='POINT', srid=4326), nullable=False)
    sighting_date = Column(Date, nullable=False)
    sea_surface_temp_c = Column(Numeric(5, 2))
    salinity_psu = Column(Numeric(5, 2))
    chlorophyll_mg_m3 = Column(Numeric(7, 4))  # Added to match schemas.py
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    species = relationship("Species")


# 9. Define the Otolith class, mapping to the 'otoliths' table.
class Otolith(Base):
    __tablename__ = "otoliths"
    
    id = Column(Integer, primary_key=True)
    species_id = Column(Integer, ForeignKey("species.id"))
    minio_path = Column(String, unique=True, nullable=False)
    collection_date = Column(Date)
    age_estimation_years = Column(Integer)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())