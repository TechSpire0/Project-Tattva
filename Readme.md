# 🌊 TATTVA

**Transformative AI for Taxonomic, Temporal & Visual Analytics**
_An AI-driven marine biodiversity research platform (SIH 2025 project)_

---

## 📖 Overview

TATTVA is an AI-powered platform designed to help marine researchers analyze, visualize, and collaborate on biodiversity data in Indian waters.
It combines **geospatial visualization, machine learning, LLM-based conversational AI, and collaborative research tools** into a single platform.

---

## ✨ Features

- **Interactive Dashboard**

  - 🌍 Dynamic map with **78k+ species sightings** (PostGIS + React Leaflet).
  - 📊 Charts summarizing species distributions & environmental variables.
  - 💡 AI-generated hypotheses from correlations in the data.

- **Conversational AI Assistant**

  - 🤖 Built on **Google Gemini + ChromaDB (RAG)**.
  - Can answer **oceanography questions** + **queries grounded in the sightings database**.
  - Supports **Markdown responses** for clean formatting.

- **Otolith Classifier (ML Model)**

  - 🐟 Upload otolith (fish earbone) images.
  - AI predicts the fish species.
  - Images are stored in **MinIO** for backup.

- **Data Upload Module** (coming soon 🚧)

  - Upload new CSV datasets (sightings, species, environmental data).
  - Validates, stores in Postgres + MinIO.
  - Automatically updates RAG index for text metadata.

- **Collaborative Workspace** (coming soon 🚧)

  - Multi-user annotations on sightings.
  - Commenting & shared insights.
  - Researcher-specific workspaces.

---

## 🏗️ Architecture

**Backend:**

- FastAPI (Python)
- PostgreSQL + PostGIS (78k sightings)
- Redis (caching)
- MinIO (object storage)
- ChromaDB (vector DB for RAG)
- Google Gemini (LLM API)

**Frontend:**

- React + Vite + Tailwind
- React Leaflet (map)
- Plotly (charts)
- React Markdown (for chat + insights)

---

## 📂 Project Structure

```
TATTVA/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── models.py            # SQLAlchemy ORM models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── core/
│   │   │   ├── llm_service.py   # Gemini + RAG integration
│   │   │   ├── analysis_service.py # Correlation + insights
│   │   │   ├── minio_client.py  # MinIO integration
│   │   └── ml/
│   │       └── classifier.py    # Otolith ML model
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── MapWidget.jsx
│   │   │   │   ├── InsightsPanel.jsx
│   │   │   │   └── ChartWidget.jsx
│   │   │   └── layouts/
│   │   │       ├── Header.jsx
│   │   │       └── Sidebar.jsx
│   │   ├── features/conversation/
│   │   │   ├── chatInterface.jsx
│   │   │   └── chatService.js
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ConversationalAIPage.jsx
│   │   │   └── OtolithClassifierPage.jsx
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
source venv/bin/activate    # (Linux/Mac)
venv\Scripts\activate       # (Windows)

pip install -r requirements.txt
```

#### Configure environment variables (`.env`)

```ini
# Database
DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/marinedb

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# MinIO
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=otoliths

# Gemini API
GEMINI_API_KEY=your_api_key_here

# ChromaDB
CHROMA_HOST=localhost
CHROMA_PORT=8001
CHROMA_PATH=local_data/chroma_data
```

#### Run backend

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

- Visit **Dashboard** → View sightings map, charts, and AI insights.
- Visit **Conversational AI** → Ask questions like:

  - _“List out fishes seen in Vizag Bay in 2023”_
  - _“What environmental conditions do dolphins prefer?”_

- Visit **Otolith Classifier** → Upload an otolith image.

---

## 🔮 Roadmap

- ✅ Map, charts, AI hypotheses, chat, otolith classifier
- 🚧 Data Upload page (CSV ingestion + MinIO + DB update + RAG reindex)
- 🚧 Collaborative workspace (multi-user annotations + comments)
- 🚧 User authentication & role-based access

---

## 👥 Team

Developed for **Smart India Hackathon 2025** by Team TATTVA.

---

## 📜 License

MIT License – free to use and modify.

---
