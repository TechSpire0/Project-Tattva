from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import date

class Species(BaseModel):
    id: int
    scientific_name: str
    common_name: Optional[str] = None
    description: Optional[str] = None
    habitat: Optional[str] = None

    model_config = ConfigDict(
        from_attributes=True,
        extra="ignore",
        ser_json_exclude_none=True  
    )

class Sighting(BaseModel):
    sighting_id: str
    latitude: float
    longitude: float
    sighting_date: date
    sea_surface_temp_c: Optional[float] = None
    salinity_psu: Optional[float] = None
    chlorophyll_mg_m3: Optional[float] = None
    species: Species
    model_config = ConfigDict(from_attributes=True,extra="ignore", ser_json_exclude_none=True)

class PaginatedSpeciesResponse(BaseModel):
    count: int
    results: List[Species]
    model_config = ConfigDict(from_attributes=True)


class EdnaMatchRequest(BaseModel):
    sequence: str

class EdnaMatchResponse(BaseModel):
    success: bool
    matched: bool
    header: str | None = None