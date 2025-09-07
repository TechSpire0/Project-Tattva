# 1. Import necessary libraries: 'os' for environment variables and 'Minio' for the client.
import os
from minio import Minio

# 2. Load MinIO configuration from environment variables.
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "localhost:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ROOT_USER", "minio_access")
MINIO_SECRET_KEY = os.getenv("MINIO_ROOT_PASSWORD", "minio_secret")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "otoliths")

# 3. Create a Minio client instance. This object will be used to interact with the server.
minio_client = Minio(
    MINIO_ENDPOINT,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=False  # Set to False because we are running in a local Docker network.
)

def get_minio_client():
    """
    Dependency function to provide the Minio client and ensure the bucket exists.
    """
    # 4. Check if the designated bucket exists on the MinIO server.
    found = minio_client.bucket_exists(MINIO_BUCKET)
    if not found:
        # 5. If the bucket does not exist, create it.
        minio_client.make_bucket(MINIO_BUCKET)
    
    # 6. Return the client instance.
    return minio_client