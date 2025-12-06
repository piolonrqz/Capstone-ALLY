# ALLY – Digital Legal Engagement Platform  


![Project Status](https://img.shields.io/badge/Status-Prototype-blue)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-teal.svg)](https://fastapi.tiangolo.com/)

ALLY is a digital platform designed to streamline and secure the process of finding legal assistance and managing initial legal interactions. It connects clients with legal professionals, facilitates preliminary consultations, and organizes virtual legal processes, aiming to make legal services more accessible, efficient, and secure.

---

## ✨ Features

ALLY offers a suite of features designed to improve the legal engagement process:

* **🤖 AI-Powered Legal Assistant (RAG):** An advanced chatbot that answers legal questions by retrieving relevant information from cases of Philippine Supreme Court. Uses fine-tuned Gemini models, Pinecone cloud vector database, and semantic search to provide accurate, citation-backed legal information in real-time.
* **🗂 Virtual Legal Process Organization:** Provides a secure, centralized repository for document uploads and management, significantly reducing reliance on physical paperwork and improving accessibility.
* **💬 On-the-Spot Online Consultations:** A temporary, real-time chat system for clients to ask quick legal queries and receive immediate preliminary advice. Designed with privacy in mind, messages are not stored long-term.
* **📈 Case Tracking and Updates:** Keeps clients informed with automated email notifications on case progress. A unique case tracking ID allows clients to independently check their case status on the platform.
* **🔐 Security and Privacy:** Ensures the highest level of security with end-to-end encryption for all communications and data. Multi-factor authentication adds an extra layer of protection for user accounts.

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps:

### 1. Clone the repository:
```bash
git clone <repository_url>
```

### 2. Backend Setup (Spring Boot):
* Navigate to the backend directory.
* Install dependencies.
* Configure the database connection (MySQL).
* Run the Spring Boot application.

The Backend API Documentation will be available at `http://localhost:8080/swagger-ui/index.html`

### 3. RAG Setup (ALLY Legal Assistant):
* Navigate to the RAG directory.
* Create and activate Python virtual environment.
* Install Python dependencies (`pip install -r requirements.txt`).
* Configure environment variables (Create `.env` file).

**Start the ALLY FastAPI server:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The RAG API will be available at `http://localhost:8000`

For detailed RAG setup instructions, see [`Ally-FinetuneRAG/readme.md`](./Ally-FinetuneRAG/readme.md)

### 4. Frontend Setup (Vite + React):
* Navigate to the frontend directory. 
* Install dependencies (npm install).
* Configure API endpoint (if needed) in your config file

**Start the development server:**
```bash
npm run dev
```

**Open your browser at** `http://localhost:5173`

---

## 🏗️ Architecture

```
React Frontend (Vite - Port 5173)
       ↓
Spring Boot Backend (Port 8080)
       ↓
Ally-FinetuneRAG FastAPI (Port 8000)
       ↓
Pinecone Cloud Vector DB + Vertex AI Fine-tuned Model
```

The main Spring Boot backend communicates with the FastAPI RAG service for AI-powered legal assistance.

---

## 🛠️ Tech Stack

* **Backend**: Spring Boot (Java)
* **Frontend**: ReactJS (Vite)
* **RAG Service**: Python (FastAPI)
* **Database**: 
  * MySQL (backend application data)
  * Pinecone (cloud vector database for RAG)
  * Qdrant (optional - local vector database for testing)
* **AI Model**: Google Gemini Flash 2.0 - Lite (Fine-tuned via Vertex AI)
* **ML Embeddings**: [BAAI/bge-large-en-v1.5](https://huggingface.co/BAAI/bge-large-en-v1.5)
* **Context Classification**: Gemini Base Model for context classification and query routing
* **Vector Search**: Pinecone Cloud (Production), Qdrant (Local Testing - Optional)

---

## 📚 RAG System Details

The ALLY Legal Assistant uses Retrieval-Augmented Generation (RAG) to provide accurate legal information:

1. **Data Processing**: Philippine Supreme Court cases are processed from CSV files into semantic chunks
2. **Embedding Generation**: Each chunk is converted to a 1024-dimensional vector using BAAI/bge-large-en-v1.5
3. **Vector Storage**: Embeddings are stored in Pinecone cloud vector database for fast similarity search
4. **Query Processing**: User questions are embedded and matched against stored case vectors
5. **Response Generation**: Relevant cases are retrieved and passed to a fine-tuned Gemini model for natural language response

For detailed RAG setup instructions, see [`Ally-FinetuneRAG/readme.md`](./Ally-FinetuneRAG/readme.md)

---

## 👨‍💻 Project Team

| Profile | Name                    | Role | GitHub Username            |
|---------|-------------------------|------|----------------------------|
| <img src="https://avatars.githubusercontent.com/u/104577324?v=4" width="50"> | Vicci Louise Agramon | Backend Developer | [@Xansxxx3](https://github.com/Xansxxx3)  |
| <img src="https://avatars.githubusercontent.com/u/114855573?v=4" width="50"> | Piolo Frances Enriquez | Lead/Frontend Developer | [@piolonrqz](https://github.com/piolonrqz) |
| <img src="https://avatars.githubusercontent.com/u/112413548?v=4" width="50"> | Darwin Darryl Largoza | UI/UX Designer | [@Dadaisuk1](https://github.com/Dadaisuk1)  |
| <img src="https://avatars.githubusercontent.com/u/89176351?v=4" width="50">  | Nathan Rener Malagapo | Backend & RAG/AI Developer | [@sytrusz](https://github.com/sytrusz)     |
| <img src="https://avatars.githubusercontent.com/u/154393634?v=4" width="50"> | Jerjen Res Pangalay | Backend/Frontend Developer | [@jerjenres](https://github.com/jerjenres)  |

---

## 🙏 Acknowledgments

- Philippine Supreme Court for case data: [elibrary](https://elibrary.judiciary.gov.ph/thebookshelf/)
- Google Vertex AI for model infrastructure
- Pinecone for cloud vector database services
- [BAAI/bge-large-en-v1.5](https://huggingface.co/BAAI/bge-large-en-v1.5) and [sentence-transformers](https://huggingface.co/sentence-transformers) for embeddings 

---

## 📖 Citation

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
---

## ⚖️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Copyright (c) 2025 Team 23 - ALLY Development Team**  
All contributors retain equal rights to this codebase.

---

## ⚠️ Disclaimer

**This is legal information, not legal advice.** ALLY provides general information about Philippine law based on Supreme Court cases. For specific legal situations, consult a licensed Philippine lawyer.

---

## 📫 Contact

For any inquiries or feedback, please contact the project team via their respective GitHub profiles listed above.
