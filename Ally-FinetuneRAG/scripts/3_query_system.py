"""
ALLY - Complete RAG Query System with Vertex AI Fine-tuned Model
File: scripts/4_loc_query_system.py (Pinecone Version)

Usage:
    python scripts/4_loc_query_system.py
"""

import os
from typing import List, Dict, Optional
from dataclasses import dataclass
import json
from dotenv import load_dotenv

# Vector database - PINECONE
from pinecone import Pinecone

# FREE Embeddings
from sentence_transformers import SentenceTransformer

# Vertex AI for fine-tuned model
from vertexai.preview.generative_models import GenerativeModel
import vertexai

# Load environment variables
load_dotenv()


@dataclass
class SearchResult:
    """Retrieved case chunk"""
    case_number: str
    case_title: str
    chunk_type: str
    text: str
    score: float
    category: str
    
    def to_dict(self):
        return {
            'case_number': self.case_number,
            'case_title': self.case_title,
            'chunk_type': self.chunk_type,
            'score': f"{self.score:.1%}",
            'category': self.category
        }


class ALLYAssistant:
    """ALLY - RAG-based Philippine Legal Information Assistant"""
    
    def __init__(
        self,
        index_name: str = None,
        embedding_model: str = "BAAI/bge-large-en-v1.5",
        use_finetuned: bool = False
    ):
        print("🚀 Initializing ALLY Legal Assistant...")
        
        # Load Pinecone vector database
        print("   📦 Connecting to Pinecone...")
        api_key = os.getenv('PINECONE_API_KEY')
        if index_name is None:
            index_name = os.getenv('PINECONE_INDEX_NAME', 'ally-supreme-court-cases')
        
        if not api_key:
            raise ValueError("PINECONE_API_KEY not found in .env file")
        
        pc = Pinecone(api_key=api_key)
        self.pinecone_index = pc.Index(index_name)
        print(f"   ✅ Connected to Pinecone index: {index_name}")
        
        # Load FREE embedding model
        print(f"   🤖 Loading embedding model (cached)...")
        self.embedding_model = SentenceTransformer(embedding_model)
        
        # Load Gemini model
        print("   🧠 Connecting to Gemini...")
        
        if use_finetuned:
            # Use Vertex AI fine-tuned model
            project_id = os.getenv('GOOGLE_PROJECT_ID')
            location = os.getenv('GOOGLE_REGION', 'us-central1')
            endpoint_id = os.getenv('GOOGLE_ENDPOINT_ID')
            credentials_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
            
            if not all([project_id, endpoint_id, credentials_path]):
                raise ValueError(
                    "Missing Vertex AI configuration. Check your .env file:\n"
                    "- GOOGLE_PROJECT_ID\n"
                    "- GOOGLE_ENDPOINT_ID\n"
                    "- GOOGLE_APPLICATION_CREDENTIALS"
                )
            
            # Set credentials
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials_path
            
            # Initialize Vertex AI
            vertexai.init(project=project_id, location=location)
            
            # Load fine-tuned model
            self.gemini_model = GenerativeModel(
                f"projects/{project_id}/locations/{location}/endpoints/{endpoint_id}"
            )
            self.use_vertex_ai = True
            print(f"   ✅ Using YOUR fine-tuned Vertex AI model (Endpoint: {endpoint_id})")
        else:
            # Use base Gemini from Google AI Studio
            import google.generativeai as genai
            genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
            self.gemini_model = genai.GenerativeModel('gemini-2.5-flash')
            self.use_vertex_ai = False
            print("   ⚠️  Using base Gemini (no fine-tuning)")
            print("   💡 To use fine-tuned model, set use_finetuned=True")
        
        print("✅ ALLY is ready!\n")
    
    def retrieve_cases(
        self,
        query: str,
        limit: int = 5,
        score_threshold: float = 0.7
    ) -> List[SearchResult]:
        """Retrieve relevant cases from Pinecone vector database"""
        
        # Generate query embedding (FREE!)
        query_vector = self.embedding_model.encode(
            [query],
            normalize_embeddings=True
        )[0].tolist()
        
        # Search Pinecone
        results = self.pinecone_index.query(
            vector=query_vector,
            top_k=limit,
            include_metadata=True
        )
        
        # Convert Pinecone results to SearchResult objects
        search_results = []
        for match in results['matches']:
            # Filter by score threshold
            if match['score'] >= score_threshold:
                metadata = match['metadata']
                search_results.append(SearchResult(
                    case_number=metadata.get('case_number', ''),
                    case_title=metadata.get('case_title', 'Unknown Case'),
                    chunk_type=metadata.get('chunk_type', ''),
                    text=metadata.get('text', ''),
                    score=match['score'],
                    category=metadata.get('category', '')
                ))
        
        return search_results
    
    def format_context(self, search_results: List[SearchResult]) -> str:
        """Format retrieved cases for prompt"""
        if not search_results:
            return "No relevant cases found in the database."
        
        context_parts = []
        for idx, result in enumerate(search_results, 1):
            context_parts.append(f"""
[CASE {idx}] - Relevance: {result.score:.1%}
Case Number: {result.case_number}
Title: {result.case_title}
Section: {result.chunk_type.upper()}
Category: {result.category}

{result.text}

{"─" * 60}
""")
        return "\n".join(context_parts)
    
    def create_prompt(self, query: str, context: str) -> str:
        """Create prompt for Gemini"""
        return f"""You are ALLY (Anonymous Legal Liaison for You), a Philippine legal information assistant.

CRITICAL INSTRUCTIONS:
1. Answer ONLY using the Supreme Court cases provided below
2. Cite specific cases using [Case 1], [Case 2] format for EVERY legal claim
3. If the provided cases don't answer the question, clearly state this
4. Use clear, simple language - avoid overly technical jargon
5. Never invent case information not in the provided text

PHILIPPINE SUPREME COURT CASES:
{context}

USER QUESTION:
{query}

Provide a comprehensive answer that:
- Directly answers the question
- Cites specific cases for each legal point made
- Explains the reasoning clearly
- Notes any conflicting interpretations if present
- Ends with the disclaimer

Format your response as:
1. Direct answer (2-3 sentences)
2. Legal basis with citations
3. Practical implications
4. Disclaimer: "⚠️ This is legal information, not legal advice. For your specific situation, consult a Philippine lawyer."

ANSWER:"""
    
    def generate_answer(self, prompt: str) -> str:
        """Generate answer using Gemini (base or fine-tuned)"""
        try:
            if self.use_vertex_ai:
                # Vertex AI model
                response = self.gemini_model.generate_content(prompt)
                return response.text
            else:
                # Google AI Studio model
                import google.generativeai as genai
                response = self.gemini_model.generate_content(
                    prompt,
                    generation_config=genai.GenerationConfig(
                        temperature=0.2,
                        top_p=0.8,
                        top_k=40,
                        max_output_tokens=1024,
                    )
                )
                return response.text
        except Exception as e:
            return f"❌ Error generating response: {e}"
    
    def calculate_confidence(
        self,
        search_results: List[SearchResult],
        answer: str
    ) -> float:
        """Calculate confidence score (0-1)"""
        if not search_results:
            return 0.0
        
        avg_score = sum(r.score for r in search_results) / len(search_results)
        citation_count = answer.count("[Case ")
        has_citations = citation_count > 0
        word_count = len(answer.split())
        length_score = min(word_count / 100, 1.0)
        
        confidence = (
            avg_score * 0.5 +
            (1.0 if has_citations else 0.0) * 0.3 +
            length_score * 0.2
        )
        
        return round(confidence, 2)
    
    def query(self, user_question: str, verbose: bool = True) -> Dict:
        """Main query method - THE COMPLETE RAG PIPELINE"""
        if verbose:
            print(f"❓ Question: {user_question}\n")
        
        # STEP 1: Retrieve relevant cases
        if verbose:
            print("🔍 Searching for relevant cases...")
        
        search_results = self.retrieve_cases(user_question, limit=5)
        
        if verbose:
            print(f"   Found {len(search_results)} relevant cases")
            for i, result in enumerate(search_results, 1):
                print(f"   {i}. {result.case_title} (score: {result.score:.1%})")
            print()
        
        if not search_results:
            return {
                'answer': "I couldn't find any relevant cases in the database to answer your question.",
                'sources': [],
                'confidence': 0.0,
                'query': user_question
            }
        
        # STEP 2-4: Format, prompt, generate
        context = self.format_context(search_results)
        prompt = self.create_prompt(user_question, context)
        
        if verbose:
            print("💭 Generating answer...")
        
        answer = self.generate_answer(prompt)
        confidence = self.calculate_confidence(search_results, answer)
        
        if verbose:
            print(f"✅ Confidence: {confidence:.0%}\n")
            print("─" * 60)
            print(answer)
            print("─" * 60)
        
        return {
            'answer': answer,
            'sources': [r.to_dict() for r in search_results],
            'confidence': confidence,
            'query': user_question,
            'warning': "⚠️ Low confidence." if confidence < 0.6 else None
        }
    
    def interactive_mode(self):
        """Run ALLY in interactive chat mode"""
        print("""
╔═══════════════════════════════════════════════════════════╗
║                    ALLY Legal Assistant                   ║
║          Anonymous Legal Liaison for You (v2.0)           ║
║                   Vector DB: Pinecone (Cloud)             ║
╠═══════════════════════════════════════════════════════════╣
║  Ask me about Philippine Supreme Court cases and law      ║
║  Type 'quit' or 'exit' to stop                            ║
╚═══════════════════════════════════════════════════════════╝
        """)
        
        while True:
            print("\n" + "="*60)
            user_input = input("You: ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'bye']:
                print("\n👋 Thank you for using ALLY. Stay informed!")
                break
            
            if not user_input:
                continue
            
            print()
            result = self.query(user_input, verbose=True)
            
            print("\n📚 Sources:")
            for i, source in enumerate(result['sources'], 1):
                print(f"   [{i}] {source['case_title']} ({source['case_number']})")
                print(f"       Relevance: {source['score']} | Section: {source['chunk_type']}")
            
            if result.get('warning'):
                print(f"\n{result['warning']}")


# ===== EXAMPLE USAGE =====
if __name__ == "__main__":
    # Option 1: Use fine-tuned Vertex AI model (RECOMMENDED)
    ally = ALLYAssistant(
        index_name="ally-supreme-court-cases",  # Optional, defaults to env var
        use_finetuned=True  # Set to True to use your fine-tuned model
    )
    
    # Option 2: Use base Gemini (for testing/comparison)
    # ally = ALLYAssistant(
    #     use_finetuned=False
    # )
    
    # Run in interactive mode
    ally.interactive_mode()