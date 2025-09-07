import chromadb
from chromadb.utils import embedding_functions
from app.database import SessionLocal
from app.models import Species
import logging

# --- Configuration ---
CHROMA_HOST = "localhost"       # Chroma server host
CHROMA_PORT = 8001              # Chroma server port
COLLECTION_NAME = "species_data"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def ingest_data():
    """
    Connects to PostgreSQL, generates embeddings for species data,
    and stores them in a ChromaDB collection via HTTP.
    """
    try:
        # Initialize the ChromaDB HTTP client
        chroma_client = chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)
        logger.info(f"Connected to ChromaDB server at {CHROMA_HOST}:{CHROMA_PORT}")

        # Initialize the embedding function
        sentence_transformer_ef = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name=EMBEDDING_MODEL
        )
        logger.info(f"Embedding model '{EMBEDDING_MODEL}' loaded.")

        # Get or create the collection
        collection = chroma_client.get_or_create_collection(
            name=COLLECTION_NAME,
            embedding_function=sentence_transformer_ef
        )
        logger.info(f"ChromaDB collection '{COLLECTION_NAME}' is ready.")

        # Connect to PostgreSQL and fetch species data
        db = SessionLocal()
        species_list = db.query(Species).all()
        db.close()
        logger.info(f"Fetched {len(species_list)} species records from PostgreSQL.")

        documents, metadatas, ids = [], [], []
        for species in species_list:
            documents.append(
                f"Species Name: {species.common_name}. "
                f"Scientific Name: {species.scientific_name}. "
                f"Description: {species.description} "
                f"Habitat: {species.habitat}"
            )
            metadatas.append({
                "species_id": species.id,
                "scientific_name": species.scientific_name
            })
            ids.append(f"species_{species.id}")

        # Add the data to the ChromaDB collection
        collection.add(documents=documents, metadatas=metadatas, ids=ids)
        logger.info(f"Successfully ingested {len(documents)} documents into ChromaDB.")

    except Exception as e:
        logger.error(f"An error occurred during data ingestion: {e}", exc_info=True)

if __name__ == "__main__":
    ingest_data()
