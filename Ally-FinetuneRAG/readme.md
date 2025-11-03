# Ally-FinetuneRAG

RAG (Retrieval-Augmented Generation) feature for the ALLY Legal Assistant chatbot. This is a submodule of the main Spring Boot + Vite React project.

## Prerequisites
- Python 3.11+
- pip
- at least 2GB RAM (for Qdrant - local vector database) (OPTIONAL)
- Pinecone (for cloud vector database)

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
│   └── 4_loc_query_system.py      # Query testing system (Qdrant)
├── processed-for-rag/         # Processed chunks and metadata
│   ├── chunks.jsonl           # Processed case chunks
│   └── processing_metadata.json
├── scripts/                   # PRODUCTION scripts (Pinecone)
│   ├── 1_process_csv.py       # Process CSV data into chunks
│   ├── 2_index_pinecone.py    # Upload vectors to Pinecone (ONE-TIME)
│   └── 3_query_system.py      # Query testing system (Pinecone)
├── vector-db/                 # Qdrant local database (optional, for local testing only)
│   └── collection/
│       └── legal_cases/
│           └── ph_supreme_court_cases/
│               └── storage.sqlite
├── venv/                      # Python virtual environment
├── .env                       # Environment variables
├── .gitignore
├── geminitest.py              # Test Gemini integration
├── main.py                    # FastAPI server
├── readme.md                  # This file
└── requirements.txt           # Python dependencies
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

#### 2. Upload vectors to Pinecone
```bash
python scripts/2_index_pinecone.py
```
Uploads all processed chunks as vectors to Pinecone cloud. **This only needs to be run ONCE** (or when adding new data).

**This will take 10-30 minutes** depending on dataset size.

#### 3. Test query system (Interactive Mode)
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
Tests connection to Vertex AI fine-tuned model.

### Production (Integration with Main App)

#### Run FastAPI server
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The main Spring Boot application will communicate with this API endpoint.

**API Endpoints:**
- `POST /api/query` - Query the legal assistant (RAG pipeline)
```json
  {
    "question": "What is the legal definition of libel?",
    "limit": 5,
    "score_threshold": 0.7
  }
```
- `POST /search` - Legacy search endpoint (returns raw cases)
- `GET /api/health` - Health check
- `GET /health` - Health check (alias)
- `GET /` - API info
- `GET /collections` - List Pinecone indexes

**Example curl request:**
```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question":"How do I report an Illegal Recruitment?"}'
```

## Integration with Main Project

This RAG system is called by the main Spring Boot backend:
```
React Frontend (Vite)
       ↓
Spring Boot (Port 8080)
       ↓
Ally-FinetuneRAG FastAPI (Port 8000)
       ↓
Pinecone Cloud Vector DB + Vertex AI Model
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
- Pinecone upload takes 5-10 minutes for full dataset
- Batch size can be adjusted in `2_index_pinecone.py` (default: 100)
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

## Model Information

- **Embeddings**: [BAAI/bge-large-en-v1.5](https://huggingface.co/BAAI/bge-large-en-v1.5) (1024 dimensions)
- **Generation**: Fine-tuned Gemini on Vertex AI
- **Vector DB (Production)**: Pinecone (cloud-hosted)
- **Vector DB (Local - Optional)**: Qdrant (SQLite-based)

## Development Notes

- **Production** uses Pinecone for scalability and reliability
- **Local testing** (optional) uses Qdrant to avoid consuming Pinecone credits during development
- Both systems use the same embedding model for consistency
- Scripts in `scripts/` are for production (Pinecone)
- Scripts in `localrun-scripts/` are optional, for local development (Qdrant)

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