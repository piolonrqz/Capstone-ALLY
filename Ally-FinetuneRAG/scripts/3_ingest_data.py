from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer
import json
import os
from tqdm import tqdm

# Load model
print("Loading embedding model...")
model = SentenceTransformer('BAAI/bge-large-en-v1.5')

# Initialize Qdrant
print("Initializing Qdrant client...")
qdrant = QdrantClient(path=os.getenv("QDRANT_PATH", "./vector-db"))

# Collection name
COLLECTION_NAME = "legal_cases"

# Check if collection exists, if yes delete it
try:
    qdrant.get_collection(COLLECTION_NAME)
    print(f"Collection '{COLLECTION_NAME}' exists. Deleting...")
    qdrant.delete_collection(COLLECTION_NAME)
except Exception:
    print(f"Collection '{COLLECTION_NAME}' does not exist. Creating new...")

# Create collection
print("Creating collection...")
qdrant.create_collection(
    collection_name=COLLECTION_NAME,
    vectors_config=VectorParams(
        size=1024,  # BAAI/bge-large-en-v1.5 produces 1024-dimensional vectors
        distance=Distance.COSINE
    )
)

# Load and ingest data
print("Loading chunks from chunks.jsonl...")
chunks = []
with open(".\processed-for-rag\chunks.jsonl", "r", encoding="utf-8") as f:
    for line in f:
        chunks.append(json.loads(line))

print(f"Found {len(chunks)} chunks. Starting ingestion...")

# Prepare points for batch upload
points = []
for idx, chunk in enumerate(tqdm(chunks, desc="Encoding chunks")):
    # Create embedding from case_title and text
    text_to_embed = f"{chunk.get('case_title', '')} {chunk.get('text', '')}"
    embedding = model.encode(text_to_embed).tolist()
    
    # Create point with correct field mappings
    point = PointStruct(
        id=idx,
        vector=embedding,
        payload={
            "title": chunk.get("case_title", "Unknown Case"),
            "content": chunk.get("text", ""),
            "citation": chunk.get("case_number", ""),
            "section": chunk.get("chunk_type", ""),
            "chunk_id": chunk.get("chunk_id", idx),
            "case_id": chunk.get("case_id", ""),
            "category": chunk.get("metadata", {}).get("category", ""),
            "source_year": chunk.get("metadata", {}).get("source_year", "")
        }
    )
    points.append(point)
    
    # Upload in batches of 100
    if len(points) >= 100:
        qdrant.upsert(collection_name=COLLECTION_NAME, points=points)
        points = []

# Upload remaining points
if points:
    qdrant.upsert(collection_name=COLLECTION_NAME, points=points)

print(f"✅ Successfully ingested {len(chunks)} chunks into Qdrant!")

# Verify
collection_info = qdrant.get_collection(COLLECTION_NAME)
print(f"Collection info: {collection_info.points_count} points")