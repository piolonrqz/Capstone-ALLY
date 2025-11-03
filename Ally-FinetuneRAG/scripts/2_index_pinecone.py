"""
Index Philippine Supreme Court cases into Pinecone
OPTIONAL RUN ONLY: Testing RAG with Pinecone vector database
Run once to upload all vectors to Pinecone cloud
"""


from pinecone import Pinecone, ServerlessSpec
from sentence_transformers import SentenceTransformer
import json
import os
from tqdm import tqdm
from dotenv import load_dotenv

load_dotenv()

# Configuration
PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
PINECONE_INDEX_NAME = os.getenv('PINECONE_INDEX_NAME', 'ally-supreme-court-cases')
CHUNKS_FILE = "./processed-for-rag/chunks.jsonl"

print("="*60)
print("📤 PINECONE INDEXING - ONE-TIME SETUP")
print("="*60)

# Load embedding model
print("\n🤖 Loading embedding model...")
model = SentenceTransformer('BAAI/bge-large-en-v1.5')
print("   ✅ Model loaded (1024 dimensions)")

# Initialize Pinecone
print("\n🔌 Connecting to Pinecone...")
if not PINECONE_API_KEY:
    print("❌ Error: PINECONE_API_KEY not found in .env")
    exit(1)

pc = Pinecone(api_key=PINECONE_API_KEY)

# Check if index exists
print(f"   Checking for index: {PINECONE_INDEX_NAME}")
existing_indexes = pc.list_indexes().names()

if PINECONE_INDEX_NAME not in existing_indexes:
    print(f"❌ Error: Index '{PINECONE_INDEX_NAME}' not found!")
    print("\nCreate it in Pinecone Console:")
    print("  1. Go to https://app.pinecone.io")
    print("  2. Click 'Create Index'")
    print(f"  3. Name: {PINECONE_INDEX_NAME}")
    print("  4. Dimensions: 1024")
    print("  5. Metric: cosine")
    print("  6. Region: us-east-1 (or closest)")
    exit(1)

index = pc.Index(PINECONE_INDEX_NAME)
print(f"   ✅ Connected to index: {PINECONE_INDEX_NAME}")

# Load chunks
print(f"\n📂 Loading chunks from {CHUNKS_FILE}...")
if not os.path.exists(CHUNKS_FILE):
    print(f"❌ Error: {CHUNKS_FILE} not found!")
    print("Run scripts/1_process_csv.py first")
    exit(1)

chunks = []
with open(CHUNKS_FILE, "r", encoding="utf-8") as f:
    for line in f:
        chunks.append(json.loads(line))

print(f"   ✅ Loaded {len(chunks)} chunks")

# Generate embeddings and upload
print(f"\n⬆️  Uploading vectors to Pinecone...")
print("   This may take 10-30 minutes...")

batch_size = 100
vectors_to_upsert = []

for idx, chunk in enumerate(tqdm(chunks, desc="Processing")):
    # Create embedding from case_title + text
    text_to_embed = f"{chunk.get('case_title', '')} {chunk.get('text', '')}"
    embedding = model.encode(text_to_embed, normalize_embeddings=True).tolist()
    
    # Create vector ID
    vector_id = f"{chunk.get('chunk_id', idx)}"
    
    # Prepare metadata (Pinecone limits metadata size)
    metadata = {
        'case_number': chunk.get('case_number', ''),
        'case_title': chunk.get('case_title', 'Unknown Case'),
        'chunk_type': chunk.get('chunk_type', ''),
        'text': chunk.get('text', '')[:1000],  # Limit text length for metadata
        'category': chunk.get('metadata', {}).get('category', ''),
        'source_year': chunk.get('metadata', {}).get('source_year', ''),
        'case_id': chunk.get('case_id', '')
    }
    
    # Add to batch
    vectors_to_upsert.append({
        'id': vector_id,
        'values': embedding,
        'metadata': metadata
    })
    
    # Upload batch
    if len(vectors_to_upsert) >= batch_size:
        index.upsert(vectors=vectors_to_upsert)
        vectors_to_upsert = []

# Upload remaining vectors
if vectors_to_upsert:
    index.upsert(vectors=vectors_to_upsert)

print("\n✅ Upload complete!")

# Verify
stats = index.describe_index_stats()
print(f"\n📊 Index Statistics:")
print(f"   Total vectors: {stats.total_vector_count}")
print(f"   Dimensions: {stats.dimension}")
print(f"   Index fullness: {stats.index_fullness * 100:.2f}%")

print("\n" + "="*60)
print("PINECONE INDEXING COMPLETE!")
print("="*60)
print("\nNext steps:")
print("  1. Start the FastAPI server: uvicorn main:app --reload")
print("  2. Test: curl http://localhost:8001/api/health")
print("="*60)