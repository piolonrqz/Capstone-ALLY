"""
ALLY FastAPI Server - Pinecone Version
Replaces Qdrant with Pinecone cloud vector database

Run with: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
import os
from dotenv import load_dotenv

# Vertex AI for fine-tuned model
from vertexai.preview.generative_models import GenerativeModel
import vertexai

load_dotenv()

app = FastAPI(
    title="ALLY Legal Assistant API",
    description="RAG-based Philippine Legal Information System (Pinecone)",
    version="3.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class SearchRequest(BaseModel):
    query: str
    top_k: int = 3

class QueryRequest(BaseModel):
    question: str
    limit: int = 5
    score_threshold: float = 0.7

class SourceInfo(BaseModel):
    case_number: str
    case_title: str
    chunk_type: str
    score: str
    category: str

class QueryResponse(BaseModel):
    answer: str
    sources: List[SourceInfo]
    confidence: float
    query: str
    warning: Optional[str] = None

# Global variables for models
embedding_model = None
pinecone_index = None
gemini_model = None

@app.on_event("startup")
async def startup_event():
    """Initialize models on startup"""
    global embedding_model, pinecone_index, gemini_model
    
    print("🚀 Starting ALLY System (Pinecone)...")
    
    # Load embedding model
    print("   🤖 Loading embedding model...")
    embedding_model = SentenceTransformer('BAAI/bge-large-en-v1.5')
    print("   ✅ Embedding model loaded")
    
    # Initialize Pinecone
    print("   🔌 Connecting to Pinecone...")
    api_key = os.getenv('PINECONE_API_KEY')
    index_name = os.getenv('PINECONE_INDEX_NAME', 'ally-supreme-court-cases')
    
    if not api_key:
        print("   ⚠️  PINECONE_API_KEY not found in .env")
        return
    
    try:
        pc = Pinecone(api_key=api_key)
        pinecone_index = pc.Index(index_name)
        print(f"   ✅ Connected to Pinecone index: {index_name}")
    except Exception as e:
        print(f"   ❌ Pinecone connection failed: {e}")
        return
    
    # Initialize Vertex AI
    print("   🧠 Connecting to Vertex AI...")
    try:
        project_id = os.getenv('GOOGLE_PROJECT_ID')
        location = os.getenv('GOOGLE_REGION', 'us-central1')
        endpoint_id = os.getenv('GOOGLE_ENDPOINT_ID')
        credentials_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
        
        if all([project_id, endpoint_id, credentials_path]):
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials_path
            vertexai.init(project=project_id, location=location)
            gemini_model = GenerativeModel(
                f"projects/{project_id}/locations/{location}/endpoints/{endpoint_id}"
            )
            print(f"   ✅ Vertex AI model loaded")
        else:
            print("   ⚠️  Vertex AI config incomplete, using embeddings only")
    except Exception as e:
        print(f"   ⚠️  Vertex AI initialization failed: {e}")
    
    print("✅ ALLY Ready!\n")

# Legacy endpoint (for backward compatibility)
@app.post("/search")
async def search_cases(request: SearchRequest):
    """Search cases using Pinecone (legacy endpoint)"""
    try:
        if not pinecone_index:
            raise HTTPException(
                status_code=503,
                detail="Pinecone not initialized. Check your .env configuration."
            )
        
        # Generate embedding
        query_embedding = embedding_model.encode(
            request.query,
            normalize_embeddings=True
        ).tolist()
        
        # Search Pinecone
        results = pinecone_index.query(
            vector=query_embedding,
            top_k=request.top_k,
            include_metadata=True
        )
        
        # Format results
        cases = []
        for match in results['matches']:
            metadata = match['metadata']
            cases.append({
                "title": metadata.get("case_title", "Unknown Case"),
                "score": round(match['score'] * 100, 1),
                "content": metadata.get("text", ""),
                "citation": metadata.get("case_number", ""),
                "section": metadata.get("chunk_type", "")
            })
        
        return {
            "cases": cases,
            "count": len(cases),
            "query": request.query
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# New RAG endpoint
@app.post("/api/query", response_model=QueryResponse)
async def query_ally(request: QueryRequest):
    """Full RAG query with Vertex AI generation"""
    try:
        if not pinecone_index:
            raise HTTPException(
                status_code=503,
                detail="Pinecone not initialized"
            )
        
        if not request.question or len(request.question.strip()) < 5:
            raise HTTPException(
                status_code=400,
                detail="Question too short"
            )
        
        # Generate embedding
        query_embedding = embedding_model.encode(
            request.question,
            normalize_embeddings=True
        ).tolist()
        
        # Search Pinecone
        results = pinecone_index.query(
            vector=query_embedding,
            top_k=request.limit,
            include_metadata=True
        )
        
        # Filter by score threshold
        relevant_results = [
            match for match in results['matches']
            if match['score'] >= request.score_threshold
        ]
        
        if not relevant_results:
            return QueryResponse(
                answer="I couldn't find relevant cases. Try rephrasing your question.",
                sources=[],
                confidence=0.0,
                query=request.question
            )
        
        # Format context
        context_parts = []
        sources = []
        
        for idx, match in enumerate(relevant_results, 1):
            metadata = match['metadata']
            context_parts.append(f"""
            [CASE {idx}] - Relevance: {match['score']:.1%}
            Case Number: {metadata.get('case_number', 'Unknown')}
            Title: {metadata.get('case_title', 'Unknown')}
            Section: {metadata.get('chunk_type', 'Unknown').upper()}

            {metadata.get('text', '')}
            {"─" * 60}
            """)
            
            sources.append(SourceInfo(
                case_number=metadata.get('case_number', ''),
                case_title=metadata.get('case_title', ''),
                chunk_type=metadata.get('chunk_type', ''),
                score=f"{match['score']:.1%}",
                category=metadata.get('category', '')
            ))
        
        context = "\n".join(context_parts)
        
        # Generate answer if Gemini available
        if gemini_model:
            prompt = f"""You are ALLY, a Philippine legal information assistant.

INSTRUCTIONS:
1. Answer using the Supreme Court cases below
2. Cite cases using [Case 1], [Case 2] format
3. Use clear, simple language
4. Never invent information

CASES:
{context}

QUESTION: {request.question}

Provide:
1. Direct answer (2-3 sentences)
2. Legal basis with citations
3. Practical implications
4. Disclaimer: "⚠️ This is legal information, not legal advice. Consult a Philippine lawyer."

ANSWER:"""
            
            response = gemini_model.generate_content(prompt)
            answer = response.text
        else:
            # Fallback if no Gemini model
            answer = f"Based on {len(relevant_results)} relevant cases found, please review the sources below for information related to: {request.question}\n\n⚠️ This is legal information, not legal advice. Consult a Philippine lawyer."
        
        # Calculate confidence
        avg_score = sum(m['score'] for m in relevant_results) / len(relevant_results)
        has_citations = "[Case " in answer
        word_count = len(answer.split())
        confidence = round(
            avg_score * 0.5 + (1.0 if has_citations else 0.0) * 0.3 + min(word_count/100, 1.0) * 0.2,
            2
        )
        
        return QueryResponse(
            answer=answer,
            sources=sources,
            confidence=confidence,
            query=request.question,
            warning="⚠️ Low confidence." if confidence < 0.6 else None
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "ALLY Legal Assistant API (Pinecone)",
        "version": "3.0.0",
        "vector_db": "pinecone"
    }

@app.get("/api/health")
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        if not pinecone_index:
            return {
                "status": "unhealthy",
                "error": "Pinecone not initialized",
                "message": "Check PINECONE_API_KEY in .env"
            }
        
        stats = pinecone_index.describe_index_stats()
        
        return {
            "status": "healthy",
            "ally_loaded": True,
            "vector_db": "pinecone",
            "model": "BAAI/bge-large-en-v1.5",
            "vectors_count": stats.total_vector_count,
            "gemini_available": gemini_model is not None
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

@app.get("/collections")
async def list_collections():
    """List Pinecone indexes"""
    try:
        pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
        indexes = pc.list_indexes().names()
        return {"collections": indexes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)