# CampusConnect Backend

FastAPI backend with SQLite database and Data Structures (FIFO Queue & Binary Min-Heap Priority Queue) for the CampusConnect Smart Helpdesk system.

---

## 🚀 Quick Start

### 1. Navigate to the backend directory
```bash
cd /Users/khushigulati/CampusConnect/backend
```

### 2. Create and activate a Python virtual environment
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the development server
```bash
uvicorn main:app --reload --port 8000
```

The server will start at: **`http://localhost:8000`**

---

## 🧪 Interactive API Documentation

Once the server is running, open your browser to:
- **Swagger UI Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check:** [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 🔌 API Endpoints for Frontend

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status |
| `GET` | `/api/complaints` | Returns list of all complaints |
| `GET` | `/api/complaints/{id}` | Returns single complaint by ID |
| `POST` | `/api/complaints` | Submits a new complaint & generates ID |
| `PATCH` | `/api/complaints/{id}/status` | Updates complaint status (`Pending` / `In Progress` / `Resolved`) |
| `GET` | `/api/queue/fifo` | Active complaints ordered by FIFO Queue |
| `GET` | `/api/queue/priority` | Active complaints ordered by Priority Queue |

---

## 🗄️ Database & Seed Data
- Database file: `campus_connect.db` (SQLite) is created automatically on first run.
- On first start, realistic campus complaints (Wi-Fi, Electricity, Sanitation, Classrooms) are automatically seeded so your dashboard and queue immediately display live data.
