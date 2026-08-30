# 🚀 AGENTIC CAREER OS (ACOS)
### *Autonomous Multi-Agent Career Intelligence, Opportunity Discovery & Interview Engine*

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

---

## 🎯 Executive Overview

**Agentic Career OS (ACOS)** is an enterprise-grade, autonomous multi-agent operating system engineered to orchestrate and accelerate high-value software engineering transitions (**₹18L – ₹40L+ LPA**). 

Built specifically around **GenAI, Agentic AI, and Distributed Systems**, ACOS eliminates manual overhead through autonomous background agents that discover live opportunities, evaluate candidate-to-JD alignment, generate ATS-clean tailored resumes, monitor incoming recruiter emails via live Gmail IMAP/SMTP SSL, and run pressure-tested AI technical mock interviews.

---

## 👤 Verified Candidate Foundation

* **Candidate Name**: Chenna Kesava Reddy Bhomireddy Gari
* **Email**: [`kesavac913@gmail.com`](mailto:kesavac913@gmail.com)
* **LinkedIn**: [linkedin.com/in/chenna00](https://www.linkedin.com/in/chenna00/)
* **GitHub Profile**: [github.com/KesavaAI](https://github.com/KesavaAI)
* **Target Compensation**: ₹18+ LPA | **Current**: ~₹3.5 LPA (TCS)
* **Core Stack**: Python, LangGraph, Azure OpenAI, RAG, FastAPI, PostgreSQL, Vector Databases (Qdrant, ChromaDB, Pinecone), Docker.

### 🌟 Verified Production Repositories & Experience:
1. **TCS Enterprise Agentic Data Intelligence**: Multi-agent natural language analytics engine with AST validation using SQLGlot and human-in-the-loop safeguards.
2. [`modus-ai-intelligence-graph`](https://github.com/KesavaAI/modus-ai-intelligence-graph): Stateful agentic graph system using LangGraph and hybrid retrieval.
3. [`VecturaBI`](https://github.com/KesavaAI/VecturaBI): Autonomous semantic BI analytics platform with deterministic SQL guards.
4. [`rag-azure-nasa`](https://github.com/KesavaAI/rag-azure-nasa): High-accuracy Azure OpenAI RAG pipeline evaluated via Ragas framework.
5. [`End-to-End-AI-Voice-Assistance-Pipeline`](https://github.com/KesavaAI/End-to-End-AI-Voice-Assistance-Pipeline): Real-time streaming voice agent with low-latency LLM synthesis.

---

## 🏗️ System Architecture

```
                                  AGENTIC CAREER OS ARCHITECTURE
                                  
 ┌─────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                       REACT 18 SPA                                          │
 │  (Job Discovery • Applications • Tailored Resumes • Mock Interviews • Spaced Recall • CRM)   │
 └──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                                │ REST API / CORS
                                                ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                   FASTAPI CORE BACKEND                                      │
 │                                                                                             │
 │   ┌───────────────────────┐   ┌────────────────────────┐   ┌────────────────────────────┐  │
 │   │ Job Discovery Agent   │   │  Resume Tailoring Engine│   │  Live Gmail Sync (IMAP/SSL)│  │
 │   └──────────┬────────────┘   └───────────┬────────────┘   └─────────────┬──────────────┘  │
 │              │                            │                              │                  │
 │   ┌──────────▼────────────┐   ┌───────────▼────────────┐   ┌─────────────▼──────────────┐  │
 │   │  Candidate Matcher    │   │  ATS Audit Simulator   │   │ Direct SMTP Recruiter Send │  │
 │   └──────────┬────────────┘   └───────────┬────────────┘   └─────────────┬──────────────┘  │
 │              │                            │                              │                  │
 │   ┌──────────▼────────────┐   ┌───────────▼────────────┐   ┌─────────────▼──────────────┐  │
 │   │ Mock Interview Engine │   │ Spaced Repetition (0-30│   │ Immutable Audit Logger     │  │
 │   └───────────────────────┘   └────────────────────────┘   └────────────────────────────┘  │
 └──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                                │ SQLAlchemy ORM (psycopg2)
                                                ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────────┐
 │                              SUPABASE CLOUD POSTGRESQL (22 Tables)                          │
 │     (jobs, applications, recruiters, profiles, resumes, interviews, learning_topics, etc.)   │
 └─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 How to Run the Application Across All Operating Systems

### 1. 🪟 Windows (PowerShell)

#### Terminal 1 — Backend (FastAPI):
```powershell
cd backend
..\.venv\Scripts\Activate.ps1
python run.py
```

#### Terminal 2 — Frontend (Vite):
```powershell
cd frontend
npm run dev
```

---

### 2. 🪟 Windows (Command Prompt - CMD)

#### Terminal 1 — Backend (FastAPI):
```cmd
cd backend
..\.venv\Scripts\activate.bat
python run.py
```

#### Terminal 2 — Frontend (Vite):
```cmd
cd frontend
npm run dev
```

#### ⚡ 1-Click Windows Batch Launcher:
```cmd
start_all.bat
```

---

### 3. 🐧 Linux (Ubuntu / Debian / Arch / Fedora)

#### Terminal 1 — Backend (FastAPI):
```bash
cd backend
source ../.venv/bin/activate
python3 run.py
```

#### Terminal 2 — Frontend (Vite):
```bash
cd frontend
npm run dev
```

---

### 4. 🍎 macOS (Terminal / iTerm2)

#### Terminal 1 — Backend (FastAPI):
```zsh
cd backend
source ../.venv/bin/activate
python3 run.py
```

#### Terminal 2 — Frontend (Vite):
```zsh
cd frontend
npm run dev
```

---

### 5. 🛠️ VS Code (All Platforms)

1. Open the project folder in VS Code.
2. Press **`F5`** (or go to **Run & Debug** `Ctrl + Shift + D`).
3. Select **`▶️ Launch Agentic Career OS (Full Stack)`** $\rightarrow$ Click **Play**.

---

## 🌐 Application URLs

* **Frontend Web Dashboard**: [`http://localhost:3000`](http://localhost:3000) *(or [`http://localhost:5173`](http://localhost:5173))*
* **Backend API & Swagger Docs**: [`http://127.0.0.1:8000/docs`](http://127.0.0.1:8000/docs)
* **Supabase Cloud Database**: [`https://supabase.com/dashboard/project/notxtsfxwzreelccveoo`](https://supabase.com/dashboard/project/notxtsfxwzreelccveoo)

---

## ⚡ Core Autonomous Modules

### 1. 🤖 Autonomous Job Discovery Agent
* Automatically scans real tech job feeds and developer portals for live **GenAI, Agentic AI, LangGraph, RAG, and FastAPI** roles.
* Calculates candidate match scores ($\ge 85\%$) against your verified TCS metrics.
* Stages real opportunities directly into your Supabase PostgreSQL cloud database.

### 2. 📝 ATS Simulator & Dual-Format Resume Synthesis
* **Recruiter Visual Format**: Markdown layout emphasizing verified TCS metrics and open-source project links.
* **ATS-Clean Text Format**: Single-column standard structure optimized for Workday, Greenhouse, and Lever parsers.
* Keyword density analyzer scoring overall ATS compatibility ($\ge 90\%$).

### 3. 📬 Live Gmail Inbox Sync & Recruiter CRM
* Real-time IMAP/SMTP SSL connection to `kesavac913@gmail.com`.
* Scans incoming emails, identifies interview invites, HackerRank/Codility links, and recruiter responses, and logs them into the CRM.
* 1-Click **"Send Direct Email"** action to reach out to recruiters directly from the platform.

### 4. ⚡ AI Technical Mock Interviewer (with Pressure Mode)
* Interactive simulated interview rounds for **GenAI Architecture**, **System Design**, and **Python Concurrency**.
* **Pressure Mode**: Challenges the candidate with aggressive technical counter-questions on rate limiting, AST SQL injection guardrails, LangGraph loop limits, and token budgets.

### 5. 🧠 Day 0–30 Spaced Repetition Learning Engine
* Tracks critical technical topics (*LangGraph State Machines, Hybrid Search RAG, SQLGlot, FastAPI Concurrency*).
* Automatically schedules recall check-ins on Day 1, 3, 7, 14, and 30 based on user confidence ratings (**GREEN / YELLOW / RED**).

---

## ⚙️ Environment Configuration (`.env`)

```ini
# Database Connection (Supabase Cloud PostgreSQL)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.notxtsfxwzreelccveoo.supabase.co:5432/postgres

# Application Security
SECRET_KEY=agentic-career-os-super-secret-key-kesava-2026
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Candidate & Career Parameters
TARGET_MIN_CTC_LPA=18.0
CURRENT_CTC_LPA=3.5
EXPERIENCE_YEARS=1.6

# Live Email Integration
GMAIL_USER=kesavac913@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
```

---

## 🧪 Automated Testing & Verification

Run the automated test suite testing all 11 end-to-end pipelines:

#### Windows PowerShell:
```powershell
cd backend
..\.venv\Scripts\python.exe -m pytest -v tests
```

#### Linux / macOS:
```bash
cd backend
source ../.venv/bin/activate
pytest -v tests
```

---

## 📜 License & Ownership
Engineered by **Chenna Kesava Reddy Bhomireddy Gari** ([@KesavaAI](https://github.com/KesavaAI)). Built for high-performance agentic career execution.
