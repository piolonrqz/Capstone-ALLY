# Ally-FinetuneRAG

RAG (Retrieval-Augmented Generation) feature for the ALLY Legal Assistant chatbot. This is a submodule of the main Spring Boot + Vite React project.

## Prerequisites
- Python 3.11+
- pip

## Installation

### 1. Create and activate virtual environment

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

## Configuration

Create a `.env` file in the Ally-FinetuneRAG folder:

```env
GOOGLE_PROJECT_ID="..."
GOOGLE_ENDPOINT_ID="..."
GOOGLE_REGION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
QDRANT_PATH=./vector-db
```

Place the `service-account-key.json` in the project root.

## Project Structure

```
Ally-FinetuneRAG/
├── ally-dataset/              # Source CSV documents
├── processed-for-rag/         # Processed chunks and metadata
│   ├── chunks.json
│   ├── metadata.json
│   └── processing_metadata.json
├── scripts/
│   ├── 1_process_csv.py       # Process CSV data into chunks
│   ├── 2_index_vectordb.py    # Build Qdrant vector database
│   ├── 3_query_system.py      # Interactive query system
│   └── 4_ingest_data.py       # Ingest data into vector DB
├── vector-db/                 # Qdrant SQLite database
│   └── collection/
│       └── ph_supreme_court_cases/
│           └── storage.sqlite
├── .env                       # Environment variables
├── geminitest.py              # Test Gemini integration
├── main.py                    # FastAPI server for production
└── requirements.txt           # Python dependencies
```

## Usage

### One-Time Setup (Run Once)

#### 1. Process CSV data
```bash
python scripts/1_process_csv.py
```
Processes cases from `ally-dataset/` into chunks stored in `processed-for-rag/`.

#### 2. Build vector database
```bash
python scripts/2_index_vectordb.py
```
Creates the Qdrant vector database in `vector-db/` using sentence-transformers embeddings.

#### 3. Ingest processed data into vector database
```bash
python scripts/3_ingest_data.py
```
Uploads or syncs additional processed documents into the Qdrant vector store without rebuilding it entirely.
Useful for incremental updates (e.g., adding new court cases, laws, or datasets).

### Testing & Development

#### 4. Test query system (Interactive Mode)
```bash
python scripts/4_query_system.py
```
Opens an interactive terminal to test queries against the RAG system.

#### 5. Test Gemini integration
```bash
python geminitest.py
```
Tests connection to Vertex AI fine-tuned model.

### Production (Integration with Main App)

#### Run FastAPI server
```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

The main Spring Boot application will communicate with this API endpoint.

**API Endpoints:**
- `POST /api/query` - Query the legal assistant
- `GET /api/health` - Health check

## Integration with Main Project

This RAG system is called by the main Spring Boot backend:

```
React Frontend (Vite)
       ↓
Spring Boot (Port 8080)
       ↓
Ally-FinetuneRAG FastAPI (Port 8001)
       ↓
Vector DB + Vertex AI Model
```

The Spring Boot `ALLYService` makes HTTP requests to `http://localhost:8001/api/query`.

## Troubleshooting

### Vector DB errors
- Confirm `vector-db/` folder exists (run script 2 or 3)
- Check Qdrant database is not corrupted

### Model connection errors
- Verify `.env` has correct Vertex AI credentials
- Check service account has Vertex AI User role
- Ensure `service-account-key.json` exists and is valid

### Slow indexing
- Batch size can be adjusted in `2_index_vectordb.py` `3_ingest_data.py`
- Embedding model is cached after first run

### Memory issues
- Embedding model requires ~2GB RAM (CLOSE OTHER APPLICATIONS)
- Reduce batch size in scripts if needed

## Model Information

- **Embeddings**: [BAAI/bge-large-en-v1.5](https://huggingface.co/BAAI/bge-large-en-v1.5)
- **Generation**: Fine-tuned Gemini on Vertex AI
- **Vector DB**: Qdrant (local SQLite)

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
