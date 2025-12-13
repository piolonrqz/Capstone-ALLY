"""
ALLY FastAPI Server - Gemini Classification
Run with: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

Instruction for Google Cloud Platform RAG Deployment
 gcloud run deploy ally \
 --source . \   
 --region us-central1 \   
 --allow-unauthenticated \   
 --cpu-boost \   
 --memory 4Gi \  
 --timeout 300 \
 --service-account ally-646@majestic-disk-480605-n9.iam.gserviceaccount.com \  
 --set-env-vars="PINECONE_API_KEY=pcsk_6cvypC_Jh3e45dQgHSrbJK3uNFV5Xguch5xesv3xebtp1kEunK535Pap1rcbDvpEGJrVeu,GOOGLE_PROJECT_ID=majestic-disk-480605-n9,GOOGLE_REGION=us-central1"
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
from typing import List, Optional
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
import os
from dotenv import load_dotenv
import re

# Vertex AI for classification AND answer generation
from vertexai.preview.generative_models import GenerativeModel
import vertexai

load_dotenv()

app = FastAPI(
    title="ALLY Legal Assistant API",
    description="RAG with Gemini Classification",
    version="7.0.0"
)

@app.get("/ping")
async def ping():
    """Immediate ping response"""
    return {"ping": "pong"}

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# REQUEST/RESPONSE MODELS
# ==========================================
class SearchRequest(BaseModel):
    query: str
    top_k: int = 3

class ValidationRequest(BaseModel):
    query: str

class ValidationResponse(BaseModel):
    is_valid: bool
    rejection_reason: Optional[str] = None
    confidence: Optional[float] = None
    method: str
    details: Optional[dict] = None

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
    rejected: bool = False
    rejection_stage: Optional[str] = None
    rejection_reason: Optional[str] = None

# ==========================================
# GLOBAL VARIABLES
# ==========================================
embedding_model = None
pinecone_index = None
gemini_flash_model = None  # For classification (fast + cheap)

# ==========================================
# GEMINI CLASSIFIER
# ==========================================
def classify_with_gemini(query: str) -> tuple[bool, str, str, float]:
    """
    Use Gemini Flash to classify queries
    Fast, cheap, and accurate
    
    Returns:
        (is_valid, category, reason, confidence)
    """
    if gemini_flash_model is None:
        # Fallback if Gemini not available
        return True, "fallback", "Gemini not available", 0.5
    
    prompt = f"""You are a classifier for a Philippine legal assistant chatbot named ALLY.

Classify this user query into ONE category:

QUERY: "{query}"

Be warm and encouraging in your responses. Remember:
- If it's legal → help them
- If it's a greeting → be friendly
- If it's off-topic → politely redirect with personality

CATEGORIES:
1. LEGAL - Questions about Philippine law, court cases, legal rights, lawsuits, crimes, contracts, legal procedures
2. GREETING - Simple greetings like "hi", "hello", "how are you", "good morning"
3. META - Questions about the chatbot itself (who are you, what can you do, who created you, what is ALLY)
4. COOKING - Recipes, food preparation, cooking instructions
5. WEATHER - Weather forecasts, temperature, climate
6. ENTERTAINMENT - Movies, music, games (unless about copyright/legal aspects)
7. TECHNOLOGY - Programming, coding, tech troubleshooting (unless about cyber law)
8. MEDICAL - Health symptoms, medical advice (unless about malpractice)
9. OTHER - General knowledge, math, travel, shopping

RESPONSE FORMAT (respond ONLY with this):
CATEGORY: [category name]
CONFIDENCE: [0.0-1.0]
REASON: [brief explanation]

Examples:
- "Can I sue my landlord?" → LEGAL
- "I was scammed" → LEGAL (victim needs legal help)
- "Hello" → GREETING
- "What is ALLY?" → META
- "Recipe for adobo" → COOKING
- "What planet is closest to sun?" → OTHER

Your classification:"""

    try:
        response = gemini_flash_model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.1,  # Low temperature for consistent classification
                "max_output_tokens": 150,
            }
        )
        
        text = response.text.strip()
        
        # Parse response
        category_match = re.search(r'CATEGORY:\s*(\w+)', text, re.IGNORECASE)
        confidence_match = re.search(r'CONFIDENCE:\s*([\d.]+)', text, re.IGNORECASE)
        reason_match = re.search(r'REASON:\s*(.+?)(?:\n|$)', text, re.IGNORECASE)
        
        category = category_match.group(1).upper() if category_match else "OTHER"
        confidence = float(confidence_match.group(1)) if confidence_match else 0.7
        reason = reason_match.group(1).strip() if reason_match else "Classification completed"
        
        # Determine if valid
        is_valid = category in ["LEGAL", "GREETING", "META"]
        
        return is_valid, category, reason, confidence
        
    except Exception as e:
        print(f"   ⚠️  Gemini classification error: {e}")
        # Fail open - allow through
        return True, "error", str(e), 0.5


# ==========================================
# STARTUP EVENT
# ==========================================
@app.on_event("startup")
async def startup_event():
    """Initialize models on startup"""
    global embedding_model, pinecone_index, gemini_flash_model
    
    print("🚀 Starting ALLY System (Gemini Classification)...")
    print(f"   📍 Environment: {'Render' if os.getenv('RENDER') else 'Local'}")
    
    # Load embedding model with error handling
    try:
        print("   🤖 Loading embedding model...")
        embedding_model = SentenceTransformer('BAAI/bge-large-en-v1.5')
        print("   ✅ Embedding model loaded")
    except Exception as e:
        print(f"   ❌ Embedding model failed: {e}")
        print("   ⚠️  Continuing without embeddings (search will fail)")
        embedding_model = None
    
    # Initialize Pinecone
    print("   🔌 Connecting to Pinecone...")
    api_key = os.getenv('PINECONE_API_KEY')
    index_name = os.getenv('PINECONE_INDEX_NAME', 'ally-supreme-court-cases')
    
    if not api_key:
        print("   ⚠️  PINECONE_API_KEY not found")
    else:
        try:
            pc = Pinecone(api_key=api_key)
            pinecone_index = pc.Index(index_name)
            print(f"   ✅ Connected to Pinecone: {index_name}")
        except Exception as e:
            print(f"   ❌ Pinecone failed: {e}")
            pinecone_index = None
    
    # Initialize Gemini Flash for classification
    print("   🧠 Connecting to Gemini Flash (classifier)...")
    try:
        project_id = os.getenv('GOOGLE_PROJECT_ID')
        location = os.getenv('GOOGLE_REGION', 'us-central1')
        
        # Check for service account JSON in environment variable (Render)
        service_account_json = os.getenv('GOOGLE_SERVICE_ACCOUNT_JSON')
        
        if project_id:
            if service_account_json:
                # RENDER: Use JSON from environment variable
                print("   📋 Using service account from environment variable (Render)")
                import json
                import tempfile
                
                with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as f:
                    f.write(service_account_json)
                    credentials_path = f.name
                
                os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials_path
            else:
                # LOCAL: Use file path from .env
                credentials_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS', './service-account-key.json')
                print(f"   📁 Using service account from file: {credentials_path}")
                
                if not os.path.exists(credentials_path):
                    print(f"   ⚠️  Service account file not found: {credentials_path}")
                    raise FileNotFoundError(f"Service account file not found: {credentials_path}")
                
                os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials_path
            
            # Initialize Vertex AI
            vertexai.init(project=project_id, location=location)
            
            # Use Gemini Flash for fast classification
            gemini_flash_model = GenerativeModel("gemini-2.5-flash")
            
            print(f"   ✅ Gemini Flash loaded (classifier)")
        else:
            print("   ⚠️  GOOGLE_PROJECT_ID not found")
            gemini_flash_model = None
    except Exception as e:
        print(f"   ⚠️  Gemini failed: {e}")
        import traceback
        traceback.print_exc()
        gemini_flash_model = None
    
    print("✅ ALLY Ready with Gemini Classification!\n")
    
# ==========================================
# VALIDATION ENDPOINT
# ==========================================
@app.post("/api/validate", response_model=ValidationResponse)
async def validate_question(request: ValidationRequest):
    """
    Validate using Gemini Flash
    Fast and accurate classification
    """
    try:
        query = request.query
        
        print(f"\n🔍 Validating (Gemini): {query}")
        
        # Classify with Gemini
        is_valid, category, reason, confidence = classify_with_gemini(query)
        
        print(f"   📊 Category: {category}")
        print(f"   📊 Confidence: {confidence:.3f}")
        print(f"   📝 Reason: {reason}")
        
        if not is_valid:
            print(f"   ❌ Rejected by Gemini classifier")
            
            # Context-aware rejection messages
            rejection_messages = {
                "COOKING": (
                    "I noticed you're asking about cooking or recipes. "
                    "I specialize in Philippine legal matters, not culinary advice.\n\n"
                    "💡 However, if you have questions about food business permits, "
                    "health regulations, or restaurant legal compliance, I can help with those!"
                ),
                "WEATHER": (
                    "I see you're asking about weather. "
                    "I specialize in Philippine legal matters.\n\n"
                    "💡 If you need legal information about natural disaster laws, "
                    "force majeure in contracts, or weather-related insurance claims, "
                    "I can help with those legal aspects!"
                ),
                "ENTERTAINMENT": (
                    "I noticed you're asking about entertainment. "
                    "I specialize in Philippine legal matters.\n\n"
                    "💡 If you have questions about copyright law, piracy, "
                    "entertainment contracts, or defamation, I can help with those legal topics!"
                ),
                "TECHNOLOGY": (
                    "I see you're asking about technology or programming. "
                    "I specialize in Philippine legal matters.\n\n"
                    "💡 If you need information about the Cybercrime Prevention Act, "
                    "Data Privacy Act, or tech-related legal issues, I can help with those!"
                ),
                "MEDICAL": (
                    "I noticed you're asking about health or medical topics. "
                    "I specialize in Philippine legal matters, not medical advice.\n\n"
                    "💡 If you have questions about medical malpractice, "
                    "patient rights, or healthcare-related legal matters, I can help!"
                ),
                "FINANCE": (
                    "It seems you're asking about business, money, or financial topics. "
                    "I specialize in Philippine legal matters, not investment or financial advice.\n\n"
                    "💡 But if you need help with the legal side—such as loan agreements, debt collection laws, "
                    "business registration, BIR requirements, consumer protection, or corporate compliance—"
                    "I can assist with those legal aspects!"
                ),
                "RELATIONSHIP": (
                    "It looks like you're asking for personal or relationship advice. "
                    "While I specialize in legal information, I can't provide emotional or psychological guidance.\n\n"
                    "💡 However, if your concern involves legal matters such as adultery, VAWC, child custody, "
                    "annulment, or property issues between partners, I can help explain the legal processes."
                ),
                "TRAVEL": (
                    "It seems you're asking about travel plans or tourism. "
                    "I specialize in Philippine legal matters, not general travel advice.\n\n"
                    "💡 If you have questions about immigration rules, visa requirements, airport regulations, "
                    "or travel-related legal issues, I can help explain those!"
                ),
                "SHOPPING": (
                    "It appears you're asking about shopping, product choices, or general consumer topics. "
                    "I specialize in legal matters.\n\n"
                    "💡 But if your situation involves consumer rights, online scam issues, refund disputes, "
                    "warranty laws, or DTI complaints, I can help with the legal side!"
                ),
                "SPORTS": (
                    "It looks like you're asking about sports or fitness. "
                    "I specialize in Philippine legal matters, not athletic guidance.\n\n"
                    "💡 But if the topic involves contracts, liabilities, injuries, or sports-related legal concerns, "
                    "I can guide you legally."
                ),
                "INAPPROPRIATE": (
                    "I noticed inappropriate or aggressive language in your message. "
                    "I'm here to provide helpful and respectful legal information.\n\n"
                    "💡 If you have a legal concern or need help understanding your rights, "
                    "I'm ready to assist."
                ),
                "OTHER": (
                    "Your question doesn't appear to be about law or legal matters. "
                    "I specialize in helping with:\n\n"
                    "• Legal rights and obligations\n"
                    "• Filing lawsuits and complaints\n"
                    "• Court procedures and cases\n"
                    "• Philippine laws and regulations\n"
                    "• Legal remedies and penalties\n\n"
                    "Feel free to ask me anything about legal matters!"
                )
            }
            
            rejection_msg = rejection_messages.get(category, rejection_messages["OTHER"])
            
            return ValidationResponse(
                is_valid=False,
                rejection_reason=rejection_msg,
                confidence=confidence,
                method="gemini",
                details={"category": category, "reason": reason}
            )
        
        print(f"   ✅ Passed Gemini classifier")
        
        return ValidationResponse(
            is_valid=True,
            rejection_reason=None,
            confidence=confidence,
            method="gemini",
            details={"category": category, "reason": reason}
        )
        
    except Exception as e:
        print(f"   ❌ Validation error: {str(e)}")
        # Fail open on error
        return ValidationResponse(
            is_valid=True,
            rejection_reason=None,
            confidence=0.5,
            method="error_fallback"
        )


# ==========================================
# SEARCH ENDPOINT
# ==========================================
@app.post("/search")
async def search_cases(request: SearchRequest):
    """Search cases with Gemini classification"""
    try:
        if not pinecone_index:
            return {
                "cases": [],
                "count": 0,
                "query": request.query,
                "rejected": True,
                "rejection_stage": "system_error",
                "rejection_reason": "Pinecone not initialized"
            }
        
        query = request.query
        
        # Gemini validation
        is_valid, category, reason, confidence = classify_with_gemini(query)
        
        if not is_valid:
            print(f"   ❌ Gemini rejected: {category}")
            return {
                "cases": [],
                "count": 0,
                "query": query,
                "rejected": True,
                "rejection_stage": "gemini_filter",
                "rejection_reason": reason,
                "confidence": confidence
            }
        
        print(f"   ✅ Gemini passed: {category}")
        
        # If greeting/meta, return empty (Spring Boot handles)
        if category in ['GREETING', 'META']:
            return {
                "cases": [],
                "count": 0,
                "query": query,
                "rejected": False,
                "confidence": confidence
            }
        
        # Vector search for legal questions
        query_embedding = embedding_model.encode(
            query,
            normalize_embeddings=True
        ).tolist()
        
        results = pinecone_index.query(
            vector=query_embedding,
            top_k=request.top_k,
            include_metadata=True
        )
        
        if not results['matches']:
            return {
                "cases": [],
                "count": 0,
                "query": query,
                "rejected": True,
                "rejection_stage": "no_results",
                "rejection_reason": "No cases found"
            }
        
        # Relevance check
        RELEVANCE_THRESHOLD = 0.54
        relevant_matches = [
            m for m in results['matches']
            if m['score'] >= RELEVANCE_THRESHOLD
        ]
        
        if not relevant_matches:
            best_score = max(m['score'] for m in results['matches'])
            return {
                "cases": [],
                "count": 0,
                "query": query,
                "rejected": True,
                "rejection_stage": "low_relevance",
                "rejection_reason": f"Best score {best_score:.1%} below threshold",
                "confidence": best_score
            }
        
        # Format cases
        cases = []
        for match in relevant_matches:
            metadata = match['metadata']
            cases.append({
                "title": metadata.get("case_title", "Unknown"),
                "score": round(match['score'] * 100, 1),
                "content": metadata.get("text", ""),
                "citation": metadata.get("case_number", ""),
                "section": metadata.get("chunk_type", "")
            })
        
        return {
            "cases": cases,
            "count": len(cases),
            "query": query,
            "rejected": False,
            "confidence": max(m['score'] for m in relevant_matches)
        }
        
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        return {
            "cases": [],
            "count": 0,
            "query": request.query,
            "rejected": True,
            "rejection_stage": "system_error",
            "rejection_reason": f"Error: {str(e)}"
        }


# ==========================================
# HEALTH CHECK
# ==========================================
@app.get("/health")
async def health_check():
    """Health check"""
    try:
        if not pinecone_index:
            return {
                "status": "unhealthy",
                "error": "Pinecone not initialized"
            }
        
        stats = pinecone_index.describe_index_stats()
        
        return {
            "status": "healthy",
            "vector_db": "pinecone",
            "embedding_model": "BAAI/bge-large-en-v1.5",
            "vectors_count": stats.total_vector_count,
            "classifier": "Gemini Flash 1.5",
            "classification_type": "LLM-based",
            "relevance_threshold": "54%"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


@app.get("/")
async def root():
    return {
        "message": "ALLY Legal Assistant API",
        "version": "7.0.0",
        "classifier": "Gemini Flash 1.5",
        "deployment": "Vercel-compatible",
        "features": ["LLM classification", "context-aware", "fast and cheap"]
    }


if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("ALLY Legal Assistant API")
    print("Version: 7.0.0 (Gemini Classification)")
    print("="*60 + "\n")
    
    port = int(os.environ.get("PORT", 8000))  # default to 8000 if PORT isn't set
    uvicorn.run(app, host="0.0.0.0", port=port)