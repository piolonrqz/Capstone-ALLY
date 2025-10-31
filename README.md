# ALLY – Digital Legal Engagement Platform

![Project Status](https://img.shields.io/badge/Status-Prototype-blue)
![License](https://img.shields.io/badge/License-Educational%20Use-orange)

ALLY is a digital platform designed to streamline and secure the process of finding legal assistance and managing initial legal interactions. It connects clients with legal professionals, facilitates preliminary consultations, and organizes virtual legal processes, aiming to make legal services more accessible, efficient, and secure.

Built with a modern technology stack, ALLY leverages **Spring Boot** for a robust backend and **Kotlin** for native Android mobile support, providing a seamless experience for users on the go.

---

## ✨ Features

ALLY offers a suite of features designed to improve the legal engagement process:

* **🧠 Client-Lawyer Matching:** An intelligent system that uses AI to connect clients with the most suitable lawyers based on specialization, location, and availability. Lawyers benefit from a dedicated dashboard to manage their profiles and appointments.
* **🗂 Virtual Legal Process Organization:** Provides a secure, centralized repository for document uploads and management, significantly reducing reliance on physical paperwork and improving accessibility.
* **🤖 AI-Powered Legal Assistant (RAG):** An advanced chatbot that answers legal questions by retrieving relevant information from a database of Philippine Supreme Court cases. Uses fine-tuned Gemini models and vector search to provide accurate, citation-backed legal information in real-time.
* **💬 On-the-Spot Online Consultations:** A temporary, real-time chat system for clients to ask quick legal queries and receive immediate preliminary advice. Designed with privacy in mind, messages are not stored long-term.
* **📈 Case Tracking and Updates:** Keeps clients informed with automated email notifications on case progress. A unique case tracking ID allows clients to independently check their case status on the platform.
* **📚 Educational Resources:** Offers a wealth of legal guides, FAQs, and document templates accessible offline, empowering clients with basic legal knowledge.
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

### 3. RAG Setup (ALLY Legal Assistant):

**Navigate to the RAG directory:**
```bash
cd Ally-FinetuneRAG
```

**Create and activate Python virtual environment:**
```bash
python -m venv venv

.\venv\Scripts\Activate.ps1
```

**Install Python dependencies:**
```bash
pip install -r requirements.txt
```

**Configure environment variables** - Create `.env` file:
```env
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_ENDPOINT_ID=your-endpoint-id
GOOGLE_REGION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
QDRANT_PATH=./vector-db
```

**Place your Google Cloud service account key** as `service-account-key.json`

**Run one-time setup to build vector database:**
```bash
python scripts/1_process_csv.py
python scripts/2_index_vectordb.py
```

**Start the ALLY FastAPI server:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### 4. Frontend Setup (Vite + React):

**Navigate to the frontend directory:**
```bash
cd ally-frontend
```

**Install dependencies:**
```bash
npm install
```

**Configure API endpoint** (if needed) in your config file

**Start the development server:**
```bash
npm run dev
```
**Open your browser at** `http://localhost:5173`

---

## 🛠️ Tech Stack

* **Backend**: Spring Boot
* **Frontend**: ReactJS (Vite)
* **RAG**: Python (FastAPI)
* **Database**: MySQL (backend), SQLite (RAG)
* **AI Model**: Google Gemini Flash 2.0 - Lite (Finetuned - VertexAI)
* **ML Embeddings**: [BAAI/bge-large-en-v1.5](https://huggingface.co/BAAI/bge-large-en-v1.5) and [sentence-transformers](https://huggingface.co/sentence-transformers)


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

## Acknowledgments

- Philippine Supreme Court for case data: [elibrary](https://elibrary.judiciary.gov.ph/thebookshelf/)
- Google Vertex AI for model infrastructure
- [BAAI/bge-large-en-v1.5](https://huggingface.co/BAAI/bge-large-en-v1.5) and [sentence-transformers](https://huggingface.co/sentence-transformers) for embeddings 

---

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
---

## ⚖️ License

This project is currently intended for educational and prototyping purposes. The specific licensing terms will be determined based on institutional and legal review upon potential further development or deployment.


⚠️Disclaimer: **This is legal information, not legal advice.** ALLY provides general information about Philippine law based on Supreme Court cases. For specific legal situations, consult a licensed Philippine lawyer.

---

## 📫 Contact

For any inquiries or feedback, please contact the project team via their respective GitHub profiles listed above.
