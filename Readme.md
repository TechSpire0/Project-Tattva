# 🌊 Project TATTVA

**Transformative AI for Taxonomic, Temporal & Visual Analytics**

Project TATTVA is an intelligent, full-stack web application designed to unify, analyze, and visualize marine biodiversity data for CMLRE. By leveraging predictive and generative AI, the platform accelerates scientific discovery and environmental research.

This repository contains the complete codebase, including the React frontend and Python-based multi-service backend architecture.

---

## 🚀 Local Development Setup Guide

Follow the steps below to set up the TATTVA development environment on your **Windows 11** machine.

### ✅ 1. Prerequisites

Ensure the following software is installed and configured:

- ✅ **Git** – For version control
- ✅ **Python 3.11** – Added to your system PATH
- ✅ **Node.js** – Latest LTS version recommended
- ✅ **PostgreSQL 15+** – Relational database
- ✅ **pgAdmin 4** – GUI for PostgreSQL
- ✅ **MinIO Server** – Object storage (`minio.exe`)
- ✅ **Ubuntu on WSL 2** – For running Redis server

---

### ✅ 2. Initial Setup

#### Clone the Repository

```bash
git clone <your_new_repo_url>
cd TATTVA
```

#### Set Up the Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

#### Set Up the Frontend

```bash
cd ..\frontend
npm install
```

#### Configure Environment Variables

1. Copy the example environment file:

   ```bash
   cd backend
   copy .env.example .env
   ```

2. Edit `.env` to include your:

   - PostgreSQL password
   - Google Gemini API key

---

### ✅ 3. Manual Database Preparation

#### Start PostgreSQL

Make sure the PostgreSQL service is running.

#### Create the Database

1. Open **pgAdmin 4** and connect to your local PostgreSQL server.
2. Right-click **Databases** → **Create > Database...**
3. Name it `marinedb`.

#### Enable PostGIS Extension

1. In pgAdmin, select `marinedb`.
2. Open **Query Tool**.
3. Run:

   ```sql
   CREATE EXTENSION postgis;
   ```

#### Create Tables and Seed Data

```bash
cd backend
.\venv\Scripts\activate
alembic upgrade head
python seed.py
```

> ⚙ **Note**: You will run `ingest_vectors.py` after starting ChromaDB in the next section.

---

### ✅ 4. Launching the Application

You need to open **five terminals** and run the services in parallel. These terminals must remain open while the application is running.

---

#### 📒 Terminal 1 – Redis (Ubuntu WSL)

```bash
sudo service redis-server start
```

---

#### 📒 Terminal 2 – MinIO (Windows CMD)

```bash
cd path\to\minio
minio.exe server "D:\path\to\local_data\minio_data" --console-address ":9001"
```

---

#### 📒 Terminal 3 – ChromaDB (Windows CMD)

```bash
cd TATTVA
.\backend\venv\Scripts\activate
python -m chroma run --host localhost --port 8001 --path "local_data\chroma_data"
```

---

#### 📒 Terminal 4 – Backend (Windows CMD)

```bash
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload
```

---

#### 📒 Terminal 5 – Frontend (Windows CMD)

```bash
cd frontend
npm start
```

---

### ✅ 5. Final Data Ingestion

Once all services are running, open a new terminal and run the following:

```bash
cd backend
.\venv\Scripts\activate
python ingest_vectors.py
```

---

## 🌐 Accessing the Application

Open your browser and visit:

[http://localhost:3000](http://localhost:3000)

The TATTVA platform is now fully operational and ready for exploration!

---

## 📂 Directory Structure

```
TATTVA/
├── backend/          # Python services, APIs, and database logic
├── frontend/         # React-based user interface
├── local_data/       # Storage for MinIO and ChromaDB
├── README.md        # This documentation
```

---

## 🔧 Tech Stack

- **Frontend** – React, Node.js
- **Backend** – Python, FastAPI, Uvicorn
- **Database** – PostgreSQL with PostGIS
- **Cache** – Redis
- **Vector Store** – ChromaDB
- **Object Storage** – MinIO
- **AI Integration** – Google Gemini API

---

## 📃 Features

✔ Unifies marine biodiversity datasets
✔ Enables spatial queries using PostGIS
✔ Provides object storage for images and large files
✔ Supports vector embeddings with ChromaDB
✔ Incorporates AI-assisted research tools
✔ Built with scalability and modularity in mind

---

## 📥 Next Steps

- Expand dataset integration pipelines
- Enhance AI models for predictive analytics
- Improve frontend UI for data visualization
- Collaborate with researchers and marine scientists
- Optimize deployment workflows

---

## 📔 License

This project is released under the **MIT License**. Contributions are welcome!

---

## 📨 Contact

For any issues, suggestions, or contributions, feel free to reach out to the development team.

---
