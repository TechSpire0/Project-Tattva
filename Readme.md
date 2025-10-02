# 🌊 TATTVA

**Transformative AI for Taxonomic, Temporal & Visual Analytics**
_An AI-driven marine biodiversity research platform (SIH 2025 project)_

---

## 📖 Overview

**TATTVA** is a full-stack AI-powered platform designed for marine researchers to analyze, visualize, and gain insights into biodiversity data.
It combines **geospatial visualization, machine learning, LLM-based conversational AI, and eDNA analysis** into one integrated system.

---

## ✨ Features

### 🗺️ Interactive Dashboard

- Dynamic **map of 78k+ marine species sightings** (PostGIS + React Leaflet).
- 📊 **Charts** for temporal trends, environmental factors, and species distribution.
- 🔍 AI-generated **hypotheses** from statistical correlations.

### 💬 Conversational AI Assistant

- Built on **Google Gemini + ChromaDB (RAG)**.
- Answers **oceanographic & biodiversity questions**, grounded in the sightings database.
- Supports **Markdown responses** for citations, lists, and tables.

### 🐟 Otolith Classifier

- Upload **otolith (fish earbone) images**.
- AI predicts the species + confidence score.
- Images backed up in **MinIO**.

### 🧬 eDNA Sequence Matching

- Upload or paste **FASTA (.fasta / .fa) sequences**.
- Matches sequences with database records.
- Supports sequence ingestion & species-level matching.

### 🗂️ Data Upload Module

- Upload new **CSV datasets (species sightings, environment data)**.
- Upload **FASTA eDNA datasets**.
- Automatically validates, parses, stores in **Postgres + MinIO**, and updates indexes.

---

## 🏷️ Architecture

**Backend**

- FastAPI (Python)
- PostgreSQL + PostGIS
- MinIO (object storage)
- ChromaDB (vector DB for RAG)
- Google Gemini (LLM API)
- BioPython + Pandas (eDNA & CSV parsing)

**Frontend**

- React + Vite + Tailwind
- React Leaflet (map)
- Plotly (charts)
- React Markdown (chat rendering)

---

## 📂 Project Structure

```
TATTVA/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI entry
│   │   ├── models.py              # SQLAlchemy models
│   │   ├── schemas.py             # Pydantic schemas
│   │   ├── core/
│   │   │   ├── llm_service.py     # Gemini + RAG
│   │   │   ├── analysis_service.py # Correlation insights
│   │   │   ├── minio_client.py    # MinIO integration
│   │   └── ml/
│   │       └── classifier.py      # Otolith ML model
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/         # Map, charts, insights
│   │   │   └── layouts/           # Header, About, Home
│   │   ├── features/
│   │   │   ├── conversation/      # Chat
│   │   │   └── dataUpload/        # FileUploader
│   │   ├── pages/                 # Page-level components
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ConversationalAIPage.jsx
│   │   │   ├── OtolithClassifierPage.jsx
│   │   │   ├── DataUploadPage.jsx
│   │   │   └── About.jsx
│   │   └── App.jsx
│   └── package.json
│
└── README.md
```

---

## ⚙️ Setup

### 1. Clone Repository

```bash
git clone https://github.com/<your-username>/tattva.git
cd tattva
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate    # Linux/Mac
venv\Scripts\activate       # Windows

pip install -r requirements.txt
```

#### Configure `.env`

```ini
DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/marinedb

REDIS_HOST=localhost
REDIS_PORT=6379

MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=otoliths

GEMINI_API_KEY=your_api_key_here

CHROMA_HOST=localhost
CHROMA_PORT=8001
CHROMA_PATH=local_data/chroma_data
```

#### Run Backend

```bash
uvicorn app.main:app --reload
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Run ChromaDB

```bash
chroma run --host localhost --port 8001 --path "local_data/chroma_data"
```

---

## 🚀 Usage

- **Dashboard** → Explore map, charts, correlations, insights.
- **Conversational AI** → Ask queries like:

  - _“What fishes were seen near Kochi in 2023?”_
  - _“What salinity conditions do dolphins prefer?”_

- **Otolith Classifier** → Upload otolith images.
- **eDNA Module** → Upload FASTA files & run sequence matching.
- **Data Upload** → Ingest new CSV or FASTA datasets.

---

## 🔮 Roadmap

- ✅ Dashboard + Charts + AI Hypotheses
- ✅ Conversational AI (Gemini + RAG)
- ✅ Otolith Classifier (ML)
- ✅ Data Upload (CSV + eDNA ingestion)
- 🚧 Collaborative Workspace (annotations, comments)
- 🚧 Authentication & role-based access
- 🚧 Export insights as reports

---

## 👥 Team

Developed for **Smart India Hackathon 2025** by **Team TATTVA (TechSpire)**.
