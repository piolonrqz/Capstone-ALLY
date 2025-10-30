"""
ALLY - Vector Database Indexing Script
FREE VERSION - Uses Sentence Transformers (no API costs)
"""

import json
from pathlib import Path
from typing import List, Dict
from tqdm import tqdm
import time

# Vector database
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

# FREE Embeddings - Sentence Transformers
from sentence_transformers import SentenceTransformer


class VectorDatabaseIndexer:
    """Index legal documents into Qdrant vector database - FREE VERSION"""
    
    def __init__(
        self, 
        collection_name: str = "ph_supreme_court_cases",
        embedding_model: str = "BAAI/bge-large-en-v1.5",  # Best free legal model
        qdrant_path: str = "./vector-db"
    ):
        self.collection_name = collection_name
        
        # Initialize Qdrant (local storage)
        print("🔌 Connecting to Qdrant...")
        self.qdrant_client = QdrantClient(path=qdrant_path)
        
        # Initialize FREE embedding model
        print(f"🤖 Loading embedding model: {embedding_model}")
        print("   (This will download ~1GB on first run, then cached forever)")
        
        self.embedding_model = SentenceTransformer(embedding_model)
        self.embedding_dim = self.embedding_model.get_sentence_embedding_dimension()
        
        print(f"✅ Model loaded! Dimension: {self.embedding_dim}\n")
    
    def create_collection(self):
        """Create Qdrant collection if it doesn't exist"""
        collections = self.qdrant_client.get_collections().collections
        collection_names = [c.name for c in collections]
        
        if self.collection_name in collection_names:
            print(f"⚠️  Collection '{self.collection_name}' already exists")
            response = input("Delete and recreate? (yes/no): ")
            if response.lower() == 'yes':
                self.qdrant_client.delete_collection(self.collection_name)
                print("🗑️  Deleted existing collection")
            else:
                print("📌 Using existing collection")
                return
        
        # Create new collection
        self.qdrant_client.create_collection(
            collection_name=self.collection_name,
            vectors_config=VectorParams(
                size=self.embedding_dim,
                distance=Distance.COSINE
            )
        )
        print(f"✅ Created collection '{self.collection_name}'")
    
    def generate_embeddings(self, texts: List[str], batch_size: int = 32) -> List[List[float]]:
        """
        Generate embeddings for texts using FREE local model
        """
        embeddings = []
        
        print("🧮 Generating embeddings (this may take a few minutes)...")
        
        for i in tqdm(range(0, len(texts), batch_size), desc="Processing batches"):
            batch = texts[i:i + batch_size]
            
            # Generate embeddings locally
            batch_embeddings = self.embedding_model.encode(
                batch,
                normalize_embeddings=True,
                show_progress_bar=False,
                convert_to_numpy=True
            ).tolist()
            
            embeddings.extend(batch_embeddings)
        
        return embeddings
    
    def load_chunks(self, chunks_file: str) -> List[Dict]:
        """Load processed chunks from JSONL file"""
        chunks = []
        with open(chunks_file, 'r', encoding='utf-8') as f:
            for line in f:
                chunks.append(json.loads(line))
        print(f"📂 Loaded {len(chunks)} chunks from {chunks_file}")
        return chunks
    
    def index_chunks(self, chunks: List[Dict], batch_size: int = 100):
        """Index chunks into vector database"""
        print(f"\n🔄 Indexing {len(chunks)} chunks...")
        
        # Extract texts for embedding
        texts = [chunk['text'] for chunk in chunks]
        
        # Generate embeddings
        embeddings = self.generate_embeddings(texts, batch_size=32)
        
        # Prepare points for Qdrant
        points = []
        for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            point = PointStruct(
                id=idx,
                vector=embedding,
                payload={
                    'chunk_id': chunk['chunk_id'],
                    'case_id': chunk['case_id'],
                    'case_number': chunk['case_number'],
                    'case_title': chunk['case_title'],
                    'chunk_type': chunk['chunk_type'],
                    'text': chunk['text'],
                    'metadata': chunk['metadata']
                }
            )
            points.append(point)
        
        # Upload to Qdrant in batches
        print("☁️  Uploading to vector database...")
        for i in tqdm(range(0, len(points), batch_size), desc="Uploading batches"):
            batch = points[i:i + batch_size]
            self.qdrant_client.upsert(
                collection_name=self.collection_name,
                points=batch
            )
        
        print(f"✅ Successfully indexed {len(points)} chunks!")
    
    def test_search(self, query: str, limit: int = 5):
        """Test the vector database with a sample query"""
        print(f"\n🔍 Testing search with query: '{query}'")
        
        # Generate query embedding
        query_vector = self.embedding_model.encode(
            [query],
            normalize_embeddings=True
        )[0].tolist()
        
        # Search
        results = self.qdrant_client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            limit=limit
        )
        
        print(f"\n📊 Top {limit} results:\n")
        for i, result in enumerate(results, 1):
            print(f"{i}. Score: {result.score:.3f}")
            print(f"   Case: {result.payload['case_title']}")
            print(f"   Number: {result.payload['case_number']}")
            print(f"   Type: {result.payload['chunk_type']}")
            print(f"   Text preview: {result.payload['text'][:150]}...")
            print()
    
    def get_collection_info(self):
        """Display information about the collection"""
        info = self.qdrant_client.get_collection(self.collection_name)
        print(f"\n📊 Collection Info:")
        print(f"   Name: {self.collection_name}")
        print(f"   Vectors: {info.points_count}")
        print(f"   Dimension: {info.config.params.vectors.size}")
        print(f"   Distance: {info.config.params.vectors.distance}")


# ===== EMBEDDING MODEL OPTIONS =====
EMBEDDING_MODELS = {
    'small': 'all-MiniLM-L6-v2',           # 384 dim, fast, good
    'medium': 'all-mpnet-base-v2',          # 768 dim, better quality
    'large': 'BAAI/bge-large-en-v1.5',     # 1024 dim, best for legal
    'multilingual': 'paraphrase-multilingual-mpnet-base-v2'  # For Filipino + English
}


# ===== MAIN EXECUTION =====
if __name__ == "__main__":
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║       ALLY - Vector Database Indexing Script              ║
    ╚═══════════════════════════════════════════════════════════╝
    """)
    
    # ===== CONFIGURATION =====
    CHUNKS_FILE = "processed-for-rag/chunks.jsonl"
    COLLECTION_NAME = "ph_supreme_court_cases"
    
    # Choose embedding model
    # Options: 'small', 'medium', 'large' (recommended), 'multilingual'
    MODEL_SIZE = 'large'  # Best balance of quality and speed
    
    print(f"Selected model: {EMBEDDING_MODELS[MODEL_SIZE]}")
    print(f"💰 Cost: $0.00 forever!\n")
    
    # Initialize indexer
    indexer = VectorDatabaseIndexer(
        collection_name=COLLECTION_NAME,
        embedding_model=EMBEDDING_MODELS[MODEL_SIZE]
    )
    
    # Create collection
    indexer.create_collection()
    
    # Load and index chunks
    try:
        chunks = indexer.load_chunks(CHUNKS_FILE)
        
        print(f"\n⏱️  Estimated time: {len(chunks) * 0.01:.1f} minutes")
        print("(First run downloads model, subsequent runs are faster)\n")
        
        start_time = time.time()
        indexer.index_chunks(chunks, batch_size=100)
        elapsed = time.time() - start_time
        
        print(f"⏱️  Completed in {elapsed/60:.1f} minutes")
        
        # Show collection info
        indexer.get_collection_info()
        
        # Test search
        print("\n" + "="*60)
        test_queries = [
            "Can I sue my landlord for illegal eviction?",
            "What are tenant rights in the Philippines?",
            "How to file a case in court?"
        ]
        
        for query in test_queries:
            indexer.test_search(query, limit=3)
            print("="*60)
        
        print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║                    ✅ SUCCESS!                           ║
    ╠═══════════════════════════════════════════════════════════╣
    ║  Vector database is ready for RAG queries!                ║
    ╠═══════════════════════════════════════════════════════════╣
    ║  Next step:                                               ║
    ║  Run the RAG query script to start answering legal        ║
    ║  questions!                                               ║
    ╚═══════════════════════════════════════════════════════════╝
        """)
        
    except FileNotFoundError:
        print(f"\n❌ Error: {CHUNKS_FILE} not found")
        print("Please run the data processing script first:")
        print("  python csv_to_vectordb_prep.py")
    except Exception as e:
        print(f"\n❌ Error during indexing: {e}")
        import traceback
        traceback.print_exc()