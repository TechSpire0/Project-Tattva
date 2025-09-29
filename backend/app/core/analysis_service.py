import os
import json
import math
import logging
from sqlalchemy.sql import text
from sqlalchemy.orm import Session
import redis
from typing import Optional, Dict, Any
from sqlalchemy import select, func



logger = logging.getLogger(__name__)

# ---------------- Redis Setup ----------------
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_TTL_SECONDS = int(os.getenv("HYPOTHESIS_CACHE_TTL", 600))  # 10 min default

try:
    redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
    _ = redis_client.ping()
    logger.info("Connected to Redis for caching")
except Exception:
    redis_client = None
    logger.info("Redis not available — caching disabled")


def _cache_get(key: str):
    if not redis_client:
        return None
    try:
        raw = redis_client.get(key)
        if raw:
            return json.loads(raw)
    except Exception as e:
        logger.warning("Redis GET failed: %s", e)
    return None


def _cache_set(key: str, value: dict, ttl: int = REDIS_TTL_SECONDS):
    if not redis_client:
        return
    try:
        redis_client.setex(key, ttl, json.dumps(value))
    except Exception as e:
        logger.warning("Redis SET failed: %s", e)


# ---------------- Core SQL Logic ----------------
def _run_sql_correlation(db: Session, min_count: int) -> dict:
    """
    Run one SQL pass to compute strongest correlation above min_count.
    Returns dict {correlation, variable, species_id}.
    """
    sql = text("""
    WITH stats AS (
      SELECT
        COUNT(*)::float AS N,
        AVG(sea_surface_temp_c)::double precision AS mean_sst,
        STDDEV_POP(sea_surface_temp_c)::double precision AS std_sst,
        AVG(salinity_psu)::double precision AS mean_sal,
        STDDEV_POP(salinity_psu)::double precision AS std_sal,
        AVG(chlorophyll_mg_m3)::double precision AS mean_chl,
        STDDEV_POP(chlorophyll_mg_m3)::double precision AS std_chl
      FROM sightings
      WHERE sea_surface_temp_c IS NOT NULL OR salinity_psu IS NOT NULL OR chlorophyll_mg_m3 IS NOT NULL
    ),
    per_species AS (
      SELECT species_id::int as species_id,
             COUNT(*)::float AS cnt,
             SUM(sea_surface_temp_c) FILTER (WHERE sea_surface_temp_c IS NOT NULL) AS sum_sst,
             SUM(salinity_psu) FILTER (WHERE salinity_psu IS NOT NULL) AS sum_sal,
             SUM(chlorophyll_mg_m3) FILTER (WHERE chlorophyll_mg_m3 IS NOT NULL) AS sum_chl
      FROM sightings
      GROUP BY species_id
    )
    SELECT
      per_species.species_id,
      per_species.cnt,
      CASE
        WHEN stats.std_sst IS NULL OR stats.std_sst = 0 OR per_species.cnt = 0 OR per_species.cnt = stats.N THEN NULL
        ELSE (per_species.sum_sst / stats.N - stats.mean_sst * (per_species.cnt / stats.N)) / (stats.std_sst * sqrt((per_species.cnt / stats.N) * (1 - per_species.cnt / stats.N)))
      END AS corr_sst,
      CASE
        WHEN stats.std_sal IS NULL OR stats.std_sal = 0 OR per_species.cnt = 0 OR per_species.cnt = stats.N THEN NULL
        ELSE (per_species.sum_sal / stats.N - stats.mean_sal * (per_species.cnt / stats.N)) / (stats.std_sal * sqrt((per_species.cnt / stats.N) * (1 - per_species.cnt / stats.N)))
      END AS corr_sal,
      CASE
        WHEN stats.std_chl IS NULL OR stats.std_chl = 0 OR per_species.cnt = 0 OR per_species.cnt = stats.N THEN NULL
        ELSE (per_species.sum_chl / stats.N - stats.mean_chl * (per_species.cnt / stats.N)) / (stats.std_chl * sqrt((per_species.cnt / stats.N) * (1 - per_species.cnt / stats.N)))
      END AS corr_chl
    FROM per_species CROSS JOIN stats
    WHERE per_species.cnt >= :min_count
    ORDER BY GREATEST(
      COALESCE(ABS(
        CASE
          WHEN stats.std_sst IS NULL OR stats.std_sst = 0 OR per_species.cnt = 0 OR per_species.cnt = stats.N THEN NULL
          ELSE (per_species.sum_sst / stats.N - stats.mean_sst * (per_species.cnt / stats.N)) / (stats.std_sst * sqrt((per_species.cnt / stats.N) * (1 - per_species.cnt / stats.N)))
        END
      ), 0),
      COALESCE(ABS(
        CASE
          WHEN stats.std_sal IS NULL OR stats.std_sal = 0 OR per_species.cnt = 0 OR per_species.cnt = stats.N THEN NULL
          ELSE (per_species.sum_sal / stats.N - stats.mean_sal * (per_species.cnt / stats.N)) / (stats.std_sal * sqrt((per_species.cnt / stats.N) * (1 - per_species.cnt / stats.N)))
        END
      ), 0),
      COALESCE(ABS(
        CASE
          WHEN stats.std_chl IS NULL OR stats.std_chl = 0 OR per_species.cnt = 0 OR per_species.cnt = stats.N THEN NULL
          ELSE (per_species.sum_chl / stats.N - stats.mean_chl * (per_species.cnt / stats.N)) / (stats.std_chl * sqrt((per_species.cnt / stats.N) * (1 - per_species.cnt / stats.N)))
        END
      ), 0)
    ) DESC
    LIMIT 1;
    """)

    result = db.execute(sql, {"min_count": min_count})
    row = result.mappings().first()

    if not row:
        return {"correlation": 0.0, "variable": None, "species_id": None}

    # Choose best correlation
    candidates = {}
    if row.get("corr_sst") is not None:
        candidates["sea_surface_temp_c"] = float(row["corr_sst"])
    if row.get("corr_sal") is not None:
        candidates["salinity_psu"] = float(row["corr_sal"])
    if row.get("corr_chl") is not None:
        candidates["chlorophyll_mg_m3"] = float(row["corr_chl"])

    if not candidates:
        return {"correlation": 0.0, "variable": None, "species_id": None}

    best_var = max(candidates.keys(), key=lambda k: abs(candidates[k]))
    best_corr = float(candidates[best_var])

    return {"correlation": best_corr, "variable": best_var, "species_id": int(row["species_id"])}


# ---------------- Public API ----------------
def find_strongest_correlation(db: Session, use_cache: bool = True) -> dict:
    cache_key = "tattva:correlation:latest"

    if use_cache:
        cached = _cache_get(cache_key)
        if cached:
            return cached

    # Retry strategy with decreasing min_count thresholds
    for min_count in [30, 20, 10, 5]:
        result = _run_sql_correlation(db, min_count)
        if result["correlation"] != 0.0:
            _cache_set(cache_key, result)
            return result

    # If still nothing meaningful
    fallback = {"correlation": 0.0, "variable": None, "species_id": None}
    _cache_set(cache_key, fallback)
    return fallback



def get_chat_context(
    db: Session,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    radius_km: float = 50.0,
    limit: int = 10
) -> Dict[str, Any]:
    """
    Build a small conversational context from DB:
      - top species within bounding box (or circle around lat/lon)
      - recent sightings summary (avg env vars)
      - the current X-factor finding (fast SQL-based)
    Returns a compact dict suitable for including into LLM prompt.
    """
    try:
        # 1) If lat/lon provided, create a small envelope (approx) using degrees (approx.)
        #    1 deg lat ~ 111 km, lon scale by cos(lat). This is fine for prompt context.
        bbox_filter = None
        if lat is not None and lon is not None:
            deg_lat = radius_km / 111.0
            deg_lon = radius_km / max(0.1, (111.0 * abs(func.coalesce(func.cos(func.radians(lat)), 1))))
            min_lat = lat - deg_lat
            max_lat = lat + deg_lat
            min_lon = lon - deg_lon
            max_lon = lon + deg_lon
            # Use ST_MakeEnvelope filter via raw SQL WHERE clause in subqueries below.

        # 2) Top species by count in the area (or global top if no coords)
        if lat is not None and lon is not None:
            # bounding envelope as text - use SQL for spatial filter
            bbox_sql = func.ST_MakeEnvelope(min_lon, min_lat, max_lon, max_lat, 4326)
            species_q = (
                db.query(models.Species.scientific_name, models.Species.common_name, func.count(models.Sighting.id).label("cnt"))
                .join(models.Sighting, models.Sighting.species_id == models.Species.id)
                .filter(func.ST_Intersects(models.Sighting.location, bbox_sql))
                .group_by(models.Species.id)
                .order_by(func.count(models.Sighting.id).desc())
                .limit(limit)
            )
        else:
            species_q = (
                db.query(models.Species.scientific_name, models.Species.common_name, func.count(models.Sighting.id).label("cnt"))
                .join(models.Sighting, models.Sighting.species_id == models.Species.id)
                .group_by(models.Species.id)
                .order_by(func.count(models.Sighting.id).desc())
                .limit(limit)
            )

        top_species = []
        for sname, cname, cnt in species_q:
            top_species.append({
                "scientific_name": sname,
                "common_name": cname,
                "count": int(cnt)
            })

        # 3) Recent environmental averages in the area
        env_query = db.query(
            func.avg(models.Sighting.sea_surface_temp_c).label("avg_sst"),
            func.avg(models.Sighting.salinity_psu).label("avg_sal"),
            func.avg(models.Sighting.chlorophyll_mg_m3).label("avg_chl"),
            func.count(models.Sighting.id).label("n")
        )
        if lat is not None and lon is not None:
            env_query = env_query.filter(func.ST_Intersects(models.Sighting.location, bbox_sql))
        env_row = env_query.one_or_none()
        env_summary = {
            "avg_sst": float(env_row.avg_sst) if env_row and env_row.avg_sst is not None else None,
            "avg_sal": float(env_row.avg_sal) if env_row and env_row.avg_sal is not None else None,
            "avg_chl": float(env_row.avg_chl) if env_row and env_row.avg_chl is not None else None,
            "count": int(env_row.n) if env_row and env_row.n is not None else 0
        }

        # 4) X-factor quick finding (reuse existing fast function; no heavy load)
        try:
            xf = find_strongest_correlation(db, use_cache=True)
        except Exception:
            xf = {"correlation": None, "variable": None, "species_id": None}

        # 5) Map species_id from xf to name if possible
        xf_species_name = None
        if xf.get("species_id") is not None:
            sp = db.query(models.Species).filter(models.Species.id == xf["species_id"]).first()
            if sp:
                xf_species_name = sp.common_name or sp.scientific_name

        context = {
            "top_species": top_species,
            "env_summary": env_summary,
            "x_factor": {
                "correlation": xf.get("correlation"),
                "variable": xf.get("variable"),
                "species_id": xf.get("species_id"),
                "species_name": xf_species_name
            }
        }
        return context

    except Exception as e:
        logger.exception("Failed building chat context: %s", e)
        # return minimal safe context
        return {
            "top_species": [],
            "env_summary": {"avg_sst": None, "avg_sal": None, "avg_chl": None, "count": 0},
            "x_factor": {"correlation": None, "variable": None, "species_id": None, "species_name": None}
        }
