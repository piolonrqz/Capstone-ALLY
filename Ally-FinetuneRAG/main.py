from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS for Spring Boot to call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models once at startup
model = SentenceTransformer('BAAI/bge-large-en-v1.5')
qdrant = QdrantClient(path=os.getenv("QDRANT_PATH", "./vector-db"))

COLLECTION_NAME = "legal_cases"

class SearchRequest(BaseModel):
    query: str
    top_k: int = 3

@app.post("/search")
async def search_cases(request: SearchRequest):
    try:
        # Check if collection exists
        try:
            qdrant.get_collection(COLLECTION_NAME)
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Collection '{COLLECTION_NAME}' not found. Please run ingest_data.py first."
            )
        
        query_embedding = model.encode(request.query).tolist()
        
        results = qdrant.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_embedding,
            limit=request.top_k
        )
        
        cases = []
        for result in results:
            cases.append({
                "title": result.payload.get("title", "Unknown Case"),
                "score": round(result.score * 100, 1),
                "content": result.payload.get("content", ""),
                "citation": result.payload.get("citation", ""),
                "section": result.payload.get("section", "")
            })
        
        return {
            "cases": cases,
            "count": len(cases),
            "query": request.query
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    try:
        collection_info = qdrant.get_collection(COLLECTION_NAME)
        return {
            "status": "healthy", 
            "model": "BAAI/bge-large-en-v1.5",
            "collection": COLLECTION_NAME,
            "points_count": collection_info.points_count
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "message": "Run ingest_data.py to create the collection"
        }

@app.get("/collections")
async def list_collections():
    """List all collections in Qdrant"""
    try:
        collections = qdrant.get_collections()
        return {"collections": [c.name for c in collections.collections]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))