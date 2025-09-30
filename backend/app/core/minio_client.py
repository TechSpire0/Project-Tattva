import os
import logging
from minio import Minio
from minio.error import S3Error

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "localhost:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ROOT_USER", "vishal")
MINIO_SECRET_KEY = os.getenv("MINIO_ROOT_PASSWORD", "vishalvishal")
MINIO_SECURE = os.getenv("MINIO_SECURE", "false").lower() == "true"

# Buckets we always want available
REQUIRED_BUCKETS = ["sightings", "species", "otoliths", "edna"]

minio_client = Minio(
    MINIO_ENDPOINT,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=MINIO_SECURE,
)

def ensure_buckets_exist():
    """
    Ensure all required buckets exist in MinIO. Create them if missing.
    """
    for bucket in REQUIRED_BUCKETS:
        try:
            if not minio_client.bucket_exists(bucket):
                minio_client.make_bucket(bucket)
                logging.info(f"✅ Created missing MinIO bucket: {bucket}")
            else:
                logging.info(f"✔ MinIO bucket exists: {bucket}")
        except S3Error as e:
            logging.error(f"⚠️ Error ensuring bucket {bucket}: {e}")

def get_minio_client():
    """
    Dependency to provide the MinIO client.
    Ensures buckets exist before returning client.
    """
    ensure_buckets_exist()
    return minio_client
