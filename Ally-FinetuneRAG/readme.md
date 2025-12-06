# Ally-FinetuneRAG

RAG (Retrieval-Augmented Generation) and Context Classification feature for the ALLY Legal Assistant chatbot. This is a submodule of the main ALLY project.

## Features

- **RAG System**: Semantic search through Philippine Supreme Court cases
- **Gemini Base Model**: Gemini for classifying legal-specific responses routing queries (Context Classification)
- **Vector Database**: Pinecone (production) / Qdrant (local testing)
- **Embeddings**: BAAI/bge-large-en-v1.5 (1024 dimensions)

## Prerequisites
- Python 3.11+
- pip
- at least 2GB RAM free (for embeddings model)
- Pinecone (for cloud vector database)
- Google Cloud Platform Account (for Vertex AI)

## Installation

### 1. Create and activate virtual environment

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Linux:**
```bash
python -m venv venv
source venv/bin/activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

## Configuration

Create a `.env` file in the Ally-FinetuneRAG folder:
```env
# Vertex AI Fine-tuned Model Configuration
GOOGLE_PROJECT_ID=your-project-id-here
GOOGLE_ENDPOINT_ID=your-endpoint-id-here
GOOGLE_REGION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json

# Pinecone Cloud Vector Database (PRODUCTION)
PINECONE_API_KEY=your-pinecone-api-key-here
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=ally-supreme-court-cases

# Qdrant Local Vector Database (LOCAL TESTING ONLY - Optional)
QDRANT_PATH=./vector-db
```

Place the `service-account-key.json` in the project root.

## Project Structure
```
Ally-FinetuneRAG/
├── ally-dataset/              # Source CSV documents
│   └── csv-dataset/           # Raw CSV files with court cases
├── localrun-scripts/          # OLD scripts for local testing with Qdrant (OPTIONAL)
│   ├── 1_loc_process_csv.py       # Process CSV data into chunks
│   ├── 2_loc_index_vectordb.py    # Build Qdrant vector database
│   ├── 3_loc_ingest_data.py       # Ingest data into vector DB
│   └── 4_loc_query_system.py      # Query testing system in terminal (Qdrant)
├── processed-for-rag/                       # Processed chunks and metadata
│   ├── chunks.jsonl                         # Processed case chunks
│   ├── pinecone_upload_checkpoint.jsonl     # Checkpoint for 2_index_pinecone.py
│   └── processing_metadata.json
├── scripts/                   # PRODUCTION scripts (Pinecone)
│   ├── 1_process_csv.py       # Process CSV data into chunks
│   ├── 2_index_pinecone.py    # Upload vectors to Pinecone (FIRST RUN ONLY)
│   ├── 3_update_pinecone.py   # Upload new case/chunks to Pinecone (INCREMENTAL UPDATE)
│   └── 4_query_system.py      # Query testing system in terminal (Pinecone)
├── vector-db/                 # Qdrant local database (OPTIONAL, for local testing only)
│   └── collection/
│       └── legal_cases/
│           └── ph_supreme_court_cases/
│               └── storage.sqlite
├── venv/                      # Python virtual environment
├── .env                       # Environment variables
├── .gitignore
├── geminitest.py              # Test Gemini integration
├── main.py                    # FastAPI server (RAG + Context Classifier)
├── service-account-key.json   # GCP Credentials
├── readme.md                  # This file
└── requirements.txt           # Python dependencies
└── Dockerfile                 # Dockerfile
```

## Usage

### Production Setup (Pinecone Cloud) - ONE-TIME SETUP (or if new case data are added)

#### 1. Process CSV data
```bash
python scripts/1_process_csv.py
```
Processes cases from `ally-dataset/csv-dataset/` into chunks stored in `processed-for-rag/chunks.jsonl`.

**Output:**
- `processed-for-rag/chunks.jsonl` - All case chunks with embeddings metadata
- `processed-for-rag/processing_metadata.json` - Processing statistics

**What it does:**
- Loads all CSV files from dataset folder
- Extracts case information (facts, decision, ruling, verdict)
- Categorizes cases (criminal, civil, labor, commercial, family, tax, administrative, land)
- Splits each case into semantic chunks

#### 2. Upload vectors to Pinecone (RUN ONLY ONCE, IF DB IS NOT YET ESTABLISHED)
```bash
python scripts/2_index_pinecone.py
```
Uploads all processed chunks as vectors to Pinecone cloud. **This only needs to be run ONCE** (if new database).
Feat: Auto-Resume, If internet fails or you press Ctrl+C, run the script again to resume exactly where you left off.

**THIS WILL TAKE HOURS** depending on dataset size.

**!! IMPORTANT NOTE !!**
- Prepare your device to run minimum 6 hours non-stop.
- Plug your laptop into a power source. Do not run on battery, as performance throttling may slow down the upload or the system might die mid-process.
- Close other applicationss to minimize overheating.

#### 3. Update Pinecone (If new chunks/data are added, RUN THIS)
```bash
python scripts/3_update_pinecone.py
```
Use this script when you've added new cases to the dataset and want to upload only the new chunks without re-uploading everything.
Note: Process CSV first to convert to chunks.

#### 4. Test query system (Terminal Run)
```bash
python scripts/3_query_system.py
```
Opens an interactive terminal to test queries against the RAG system using Pinecone.

**Example queries:**
- "What is the legal definition of murder in the Philippines?"
- "Can an employer terminate an employee without just cause?"
- "What are the requirements for annulment?"

### Testing & Development

#### Test Gemini integration
```bash
python geminitest.py
```
Tests connection to Gemini Model for context classification.

### Production (Integration with Main App)

#### Run FastAPI server
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The main Spring Boot application will communicate with this API endpoint.

**API Endpoints:**
- `GET /` - API info
- `GET /api/health` - Health check
- `POST /api/query` - Query the legal assistant (RAG pipeline)
  ```json
  {
    "question": "What is the legal definition of libel?",
    "limit": 5,
    "score_threshold": 0.7
  }
  ```
  
  **Response:**
  ```json
  {
    "answer": "Libel is defined as...",
    "sources": [
      {
        "case_number": "G.R. No. 123456",
        "case_title": "People v. Doe",
        "chunk_type": "ruling",
        "score": "87.5%",
        "category": "criminal"
      }
    ],
    "confidence": 0.85,
    "query": "What is the legal definition of libel?",
    "warning": null
  }
  ```


**Example curl request:**
```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question":"How do I report an Illegal Recruitment?"}'
```

## Context Classification with Gemini

The system uses Gemini to classify user queries and route them appropriately:

### Classification Categories

1. **Legal Query** - Requires RAG system
   - Questions about Philippine law
   - Supreme Court case inquiries
   - Legal procedures and definitions

2. **Greeting/Chitchat** - Simple response
   - Hello, hi, how are you
   - Thank you, goodbye
   - General conversation

3. **Out of Scope** - Redirect to appropriate resource
   - Medical advice
   - Financial planning
   - Technical support
   - Other non-legal topics

### How Classification Works

```python
# Example from geminitest.py
query = "Can an employer fire me without notice?"
classification = classify_query(query)

if classification == "legal":
    # Route to RAG system
    result = ally.query(query)
elif classification == "greeting":
    # Simple response
    return "Hello! How can I help with your legal question?"
else:
    # Out of scope
    return "I specialize in Philippine legal information..."
```

## Integration with Main Project

This RAG system is called by the main Spring Boot backend:
```
React Frontend (Vite)
       ↓
Spring Boot + Ally-Tuned AI Model(Port 8080)
       ↓
Ally-FinetuneRAG FastAPI (Port 8000)
       ↓
Pinecone Cloud Vector DB 
```

The Spring Boot `ALLYService` makes HTTP requests to `http://localhost:8000/api/query`.

---

## Local Testing (OPTIONAL)

For local development and testing without using Pinecone credits, you can optionally use the scripts in `localrun-scripts/` with Qdrant local database:

<details>
<summary><b>Click to expand local testing steps</b></summary>

### Local Setup with Qdrant (Optional)

#### 1. Process CSV (same as production)
```bash
python localrun-scripts/1_loc_process_csv.py
```

#### 2. Build local Qdrant vector database
```bash
python localrun-scripts/2_loc_index_vectordb.py
```
Creates local SQLite-based Qdrant database in `vector-db/`.

#### 3. Ingest data into local vector database
```bash
python localrun-scripts/3_loc_ingest_data.py
```
Uploads processed chunks to local Qdrant database. Useful for incremental updates.

#### 4. Test with local database
```bash
python localrun-scripts/4_loc_query_system.py
```
Interactive mode using local Qdrant database instead of Pinecone.

**Note:** Local testing is optional and primarily useful for development without consuming Pinecone API credits.

</details>

---

## Troubleshooting

### Pinecone connection errors
- Verify `PINECONE_API_KEY` is set correctly in `.env`
- Check Pinecone index exists with name `ally-supreme-court-cases`
- Ensure index dimensions match embedding model (1024)
- Verify index region is accessible

### Model connection errors
- Verify `.env` has correct Vertex AI credentials
- Check service account has Vertex AI User role
- Ensure `service-account-key.json` exists and is valid
- Test with `python geminitest.py`

### Slow indexing
- Pinecone upload takes hours (depending on size) for full dataset
- Batch size can be adjusted in `2_index_pinecone.py` (default: 250)
- Embedding model is cached after first run

### Memory issues
- Embedding model requires ~2GB RAM (CLOSE OTHER APPLICATIONS)
- Reduce batch size in scripts if needed
- Consider using a machine with more RAM for initial indexing

### "Index not found" error
- Make sure you created the Pinecone index manually first
- Index name in `.env` must match Pinecone console
- Wait a few seconds after creating index before uploading

### Local Qdrant errors (if using local testing)
- Confirm `vector-db/` folder exists (run `localrun-scripts/2_loc_index_vectordb.py`)
- Check Qdrant database is not corrupted
- Delete `vector-db/` and rebuild if needed

### Context classification issues
- Ensure `GOOGLE_PROJECT_ID` and `GOOGLE_ENDPOINT_ID` are set
- Verify service account has proper permissions
- Test with `python geminitest.py`


## Model Information

- **Embeddings**: [BAAI/bge-large-en-v1.5](https://huggingface.co/BAAI/bge-large-en-v1.5) (1024 dimensions)
- **Classification**: Gemini for context classification and query routing
- **Vector DB (Production)**: Pinecone (cloud-hosted)
- **Vector DB (Local - Optional)**: Qdrant (SQLite-based)

## Development Notes

- **Production** uses Pinecone for scalability and reliability
- **Local testing** (optional) uses Qdrant to avoid consuming Pinecone credits during development
- Both systems use the same embedding model for consistency
- Scripts in `scripts/` are for production (Pinecone)
- Scripts in `localrun-scripts/` are optional, for local development (Qdrant)
- Context classification routes queries before hitting the RAG system

## Architecture

### RAG Pipeline

```
User Query
    ↓
Context Classification (Gemini)
    ↓
[If Legal Query]
    ↓
Embedding Generation (BAAI/bge-large-en-v1.5)
    ↓
Vector Search (Pinecone)
    ↓
Context Formatting (Top 5 relevant cases)
    ↓
Prompt Engineering (System prompt + context + query)
    ↓
Response Generation (Fine-tuned Gemini from Springboot BACKEND)
    ↓
Confidence Calculation
    ↓
Response with Sources + Citations
```

### Context Classification

```
User Input
    ↓
Gemini Classifier
    ↓
├─ Legal Query → RAG Pipeline
├─ Greeting → Simple Response
└─ Out of Scope → Redirect Message
```

## Citation
```bibtex
@misc{bge_embedding,
      title={C-Pack: Packaged Resources To Advance General Chinese Embedding}, 
      author={Shitao Xiao and Zheng Liu and Peitian Zhang and Niklas Muennighoff},
      year={2023},
      eprint={2309.07597},
      archivePrefix={arXiv},
      primaryClass={cs.CL}
}
```

## License

Part of the ALLY Legal Assistant project. See main repository for license details.
