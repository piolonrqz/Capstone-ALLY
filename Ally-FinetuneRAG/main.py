"""
ALLY FastAPI Server - Zero-Shot Classification (More Accurate)
Uses facebook/bart-large-mnli for robust classification without semantic similarity
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sentence_transformers import SentenceTransformer
from transformers import pipeline
from pinecone import Pinecone
import os
from dotenv import load_dotenv
import torch
import re

# Vertex AI for fine-tuned model
from vertexai.preview.generative_models import GenerativeModel
import vertexai

load_dotenv()

app = FastAPI(
    title="ALLY Legal Assistant API",
    description="RAG with Zero-Shot Legal Classification",
    version="5.0.0"
)

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
    threshold: Optional[float] = 0.50  # For zero-shot, 50% confidence threshold

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
gemini_model = None
zero_shot_classifier = None

# ==========================================
# GREETING/META DETECTION
# ==========================================
def is_greeting_or_meta_question(message: str) -> bool:
    """Check if message is a greeting or meta-question about ALLY"""
    if not message or not message.strip():
        return False
    
    lower = message.lower().strip()
    
    # Simple greetings (short messages only, <= 30 chars)
    if len(lower) <= 30:
        greetings = [
            "hi", "hello", "hey", "sup",
            "good morning", "good afternoon", "good evening",
            "how are you", "what's up", "whats up"
        ]
        
        for greeting in greetings:
            if re.match(f"^{greeting}\\s*[.!?]*$", lower):
                return True
    
    # Meta questions about ALLY
    if "ally" in lower:
        if any(word in lower for word in ["who", "what", "why", "how"]):
            return True
    
    # Questions about the bot itself
    if re.search(r"(who|what).*(you|your|this bot|this assistant)", lower, re.IGNORECASE):
        return True
    
    # Questions about creators/purpose
    if re.search(r"(your|the)\s+(name|creator|developer|team|purpose|project)", lower, re.IGNORECASE):
        return True
    
    # School project questions
    if any(word in lower for word in ["capstone", "thesis"]):
        return True
    
    if "school" in lower and "project" in lower:
        return True
    
    return False


# ==========================================
# ZERO-SHOT CLASSIFIER
# ==========================================
class ZeroShotLegalClassifier:
    """
    Uses pre-trained NLI model for classification
    Much more accurate than semantic similarity for edge cases
    """
    
    def __init__(self):
        print("   Loading zero-shot classifier...")
        self.classifier = pipeline(
            "zero-shot-classification",
            model="facebook/bart-large-mnli",
            device=0 if torch.cuda.is_available() else -1
        )
        print("   ✅ Zero-shot classifier loaded")
    
    def classify(self, query: str, threshold: float = 0.50) -> tuple[bool, float, dict]:
        """
        Classify using zero-shot learning
        
        Args:
            query: User question
            threshold: Confidence threshold (default 0.50 = 50%)
        
        Returns:
            (is_legal, confidence, details)
        """
        
        # Define candidate labels with detailed descriptions
        candidate_labels = [
            "Philippine legal matters, court cases, lawsuits, legal rights, and legal procedures",
            "Cooking, recipes, food preparation, and restaurants",
            "Weather, climate, and forecasts",
            "Entertainment, movies, music, and games",
            "Technology, programming, and computers",
            "Health, medical issues, and symptoms",
            "Travel, tourism, and vacation planning",
            "Mathematics, education, and homework",
            "General conversation and casual topics"
        ]
        
        result = self.classifier(
            query,
            candidate_labels,
            multi_label=False
        )
        
        top_label = result['labels'][0]
        top_score = result['scores'][0]
        
        # Check if top label is legal-related
        is_legal = "Philippine legal matters" in top_label
        
        # Confidence is the score of the top prediction
        confidence = top_score if is_legal else (1 - top_score)
        
        details = {
            "top_category": top_label,
            "top_score": round(top_score, 3),
            "all_scores": {
                label: round(score, 3) 
                for label, score in zip(result['labels'][:3], result['scores'][:3])
            },
            "threshold": threshold
        }
        
        # Decision based on threshold
        is_valid = is_legal and top_score >= threshold
        
        return is_valid, confidence, details


# ==========================================
# STARTUP EVENT
# ==========================================
@app.on_event("startup")
async def startup_event():
    """Initialize models on startup"""
    global embedding_model, pinecone_index, gemini_model, zero_shot_classifier
    
    print("🚀 Starting ALLY System (Zero-Shot Classification)...")
    
    # Load embedding model (still needed for RAG)
    print("   🤖 Loading embedding model...")
    embedding_model = SentenceTransformer('BAAI/bge-large-en-v1.5')
    print("   ✅ Embedding model loaded")
    
    # Initialize zero-shot classifier
    print("   🧠 Initializing zero-shot classifier...")
    try:
        zero_shot_classifier = ZeroShotLegalClassifier()
    except Exception as e:
        print(f"   ⚠️  Zero-shot classifier failed: {e}")
        zero_shot_classifier = None
    
    # Initialize Pinecone
    print("   🔌 Connecting to Pinecone...")
    api_key = os.getenv('PINECONE_API_KEY')
    index_name = os.getenv('PINECONE_INDEX_NAME', 'ally-supreme-court-cases')
    
    if not api_key:
        print("   ⚠️  PINECONE_API_KEY not found")
        return
    
    try:
        pc = Pinecone(api_key=api_key)
        pinecone_index = pc.Index(index_name)
        print(f"   ✅ Connected to Pinecone: {index_name}")
    except Exception as e:
        print(f"   ❌ Pinecone failed: {e}")
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
            print(f"   ✅ Vertex AI loaded")
        else:
            print("   ⚠️  Vertex AI config incomplete")
    except Exception as e:
        print(f"   ⚠️  Vertex AI failed: {e}")
    
    print("✅ ALLY Ready with Zero-Shot Classification!\n")


# ==========================================
# VALIDATION ENDPOINT
# ==========================================
@app.post("/api/validate", response_model=ValidationResponse)
async def validate_question(request: ValidationRequest):
    """
    Validate using zero-shot classification
    More accurate than semantic similarity
    """
    try:
        query = request.query
        
        print(f"\n🔍 Validating (Zero-Shot): {query}")
        
        # Check if greeting or meta question first
        if is_greeting_or_meta_question(query):
            print(f"   💬 Greeting/Meta detected - AUTO PASS")
            return ValidationResponse(
                is_valid=True,
                rejection_reason=None,
                confidence=1.0,
                method="greeting_meta",
                details={"type": "greeting_or_meta"}
            )
        
        # Use zero-shot classifier
        if zero_shot_classifier is None:
            print("   ⚠️  Zero-shot classifier not loaded - fallback pass")
            return ValidationResponse(
                is_valid=True,
                rejection_reason=None,
                confidence=0.5,
                method="fallback"
            )
        
        threshold = request.threshold or 0.50
        is_valid, confidence, details = zero_shot_classifier.classify(query, threshold)
        
        print(f"   📊 Category: {details['top_category']}")
        print(f"   📊 Score: {details['top_score']:.3f}")
        
        if not is_valid:
            print(f"   ❌ Rejected by zero-shot classifier")
            
            # Provide specific feedback based on detected category
            top_category = details['top_category']
            
            if "Cooking" in top_category or "recipes" in top_category:
                rejection_msg = (
                    "Your question appears to be about cooking or food preparation. "
                    "I specialize in Philippine legal matters, not culinary advice.\n\n"
                    "💡 If you have questions about food business permits, health regulations, "
                    "or restaurant-related legal issues, I can help with those!"
                )
            elif "Weather" in top_category:
                rejection_msg = (
                    "Your question is about weather or climate. "
                    "I specialize in Philippine legal matters.\n\n"
                    "💡 If you need legal information about disaster-related laws, "
                    "force majeure, or insurance claims, please ask specifically about those topics."
                )
            elif "Entertainment" in top_category:
                rejection_msg = (
                    "Your question appears to be about entertainment. "
                    "I specialize in Philippine legal matters.\n\n"
                    "💡 If you have questions about copyright, piracy laws, "
                    "or entertainment contracts, I can help with those legal aspects!"
                )
            elif "Technology" in top_category or "programming" in top_category:
                rejection_msg = (
                    "Your question appears to be about technology or programming. "
                    "I specialize in Philippine legal matters.\n\n"
                    "💡 If you need information about data privacy laws, "
                    "cybercrime, or tech-related legal issues, please ask specifically about those!"
                )
            elif "Health" in top_category or "medical" in top_category:
                rejection_msg = (
                    "Your question appears to be about health or medical issues. "
                    "I specialize in Philippine legal matters, not medical advice.\n\n"
                    "💡 If you have questions about medical malpractice, "
                    "healthcare rights, or health-related legal matters, I can help with those!"
                )
            else:
                rejection_msg = (
                    "Your question doesn't appear to be about Philippine law or legal matters. "
                    "I specialize in helping with:\n\n"
                    "• Legal rights and obligations\n"
                    "• Filing lawsuits and complaints\n"
                    "• Court procedures and cases\n"
                    "• Philippine laws and regulations\n"
                    "• Legal remedies and penalties\n\n"
                    "Please rephrase your question to focus on the legal aspects."
                )
            
            return ValidationResponse(
                is_valid=False,
                rejection_reason=rejection_msg,
                confidence=confidence,
                method="zero_shot",
                details=details
            )
        
        print(f"   ✅ Passed zero-shot classifier (confidence: {confidence:.3f})")
        
        return ValidationResponse(
            is_valid=True,
            rejection_reason=None,
            confidence=confidence,
            method="zero_shot",
            details=details
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
    """Search cases with zero-shot classification"""
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
        
        # Check if greeting/meta
        if is_greeting_or_meta_question(query):
            print(f"   💬 Greeting/Meta - skipping classification")
            return {
                "cases": [],
                "count": 0,
                "query": query,
                "rejected": False,
                "confidence": 1.0
            }
        
        # Zero-shot validation
        if zero_shot_classifier:
            is_valid, confidence, details = zero_shot_classifier.classify(query)
            
            if not is_valid:
                print(f"   ❌ Zero-shot rejected: {details['top_category']}")
                return {
                    "cases": [],
                    "count": 0,
                    "query": query,
                    "rejected": True,
                    "rejection_stage": "zero_shot_filter",
                    "rejection_reason": "Question not legal-related",
                    "confidence": confidence
                }
            
            print(f"   ✅ Zero-shot passed: {details['top_category']}")
        
        # Vector search
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
            "model": "BAAI/bge-large-en-v1.5",
            "vectors_count": stats.total_vector_count,
            "gemini_available": gemini_model is not None,
            "classifier": "facebook/bart-large-mnli (zero-shot)",
            "greeting_detection": "enabled",
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
        "version": "5.0.0",
        "classifier": "zero-shot (BART-large-NLI)",
        "features": ["zero-shot classification", "greeting detection", "context-aware rejection"]
    }


if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("ALLY Legal Assistant API")
    print("Version: 5.0.0 (Zero-Shot Classification)")
    print("="*60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)