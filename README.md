# CampusConnect: Smart Campus Facility & Grievance Management System

CampusConnect is a campus facility helpdesk, grievance management, and lost & found system connecting students with campus authorities.

## 🎯 Key Capabilities
- **Lifecycle Grievance Resolution**:
  1. Student submits a complaint &rarr; automatically registered as **`In Progress`** (*Under Investigation*).
  2. Campus maintenance reviews and fixes the issue on site.
  3. Authority clicks **"Fix Completed &rarr; Demand Student Review"** &rarr; moves to **`Needs Review`**.
  4. Student receives a notification, inspects the physical repair, and clicks **"Confirm Fixed & Close Complaint"** &rarr; moves to **`Resolved`**.
- **Campus Lost & Found Desk**: Report lost or found possessions, search categories, and verify claims.
- **Affiliated College System**: SQLite-backed institution directory pre-seeded with **Maharaja Surajmal Institute of Technology (MSIT)** (`Janakpuri, New Delhi`).
- **Dual-Role Testing**: Instant 1-click developer authentication for **Riya Sharma** (Student) and **Dr. Rajesh Verma** (Chief Grievance Officer & Dean).

---

## 🗄️ Database Architecture & Developer Inspection

### Why is `campus_connect.db` not visible on GitHub?
By software engineering standard best practices, SQLite binary database files (`*.db`, `*.sqlite3`) are included in `.gitignore`. Here is why:
1. **Binary Format**: SQLite databases are compiled binary files. Git cannot compute line-by-line diffs for binary files, which would quickly bloat the repository history.
2. **Local Runtime State**: When you test the app locally, rows are added, updated, and deleted. Committing a dynamic database creates merge conflicts whenever another developer pushes changes.
3. **Reproducibility**: Instead of committing binary databases, projects track the **text SQL schema** ([`backend/schema.sql`](backend/schema.sql)) so anyone can inspect the tables on GitHub.

### How can a developer inspect the tables, schemas & records?
1. **View the Schema on GitHub**: Open [`backend/schema.sql`](backend/schema.sql) directly in GitHub to see all table definitions (`users`, `complaints`, `lost_and_found`, `affiliated_colleges`) and seed data.
2. **Built-in CLI Inspector**: Run the developer database inspection tool:
   ```bash
   # Inspect all tables and rows
   python backend/inspect_db.py

   # Inspect specific tables
   python backend/inspect_db.py users
   python backend/inspect_db.py complaints
   python backend/inspect_db.py lost_and_found
   ```
3. **Interactive Swagger / OpenAPI UI**: Start the backend and open `http://localhost:8000/docs`:
   - `GET /api/dev/db-overview` &rarr; Returns tables, columns, and row counts.
   - `GET /api/users` &rarr; Lists registered students & staff.
   - `GET /api/colleges` &rarr; Lists affiliated institutions.
4. **GUI Viewers**: You can open `backend/campus_connect.db` directly with **DB Browser for SQLite** or the **VS Code SQLite Viewer** extension.

---

## 📁 Repository Structure
```text
CampusConnect/
├── backend/
│   ├── campus_connect.db     # Local SQLite database (ignored by git)
│   ├── database.py           # SQLite connection, CRUD & lifecycle logic
│   ├── inspect_db.py         # Developer CLI tool to view database tables
│   ├── main.py               # FastAPI REST API endpoints
│   ├── schema.sql            # Version-controlled schema & seed data
│   └── dsa/                  # Custom Queue (FIFO) & Priority Queue (Heap)
├── frontend/
│   ├── src/
│   │   ├── components/       # UI components, layout, Topbar & Sidebar
│   │   ├── context/          # AuthContext & ComplaintsContext
│   │   ├── pages/            # Dashboard, Review, Lost & Found, Admin, Colleges
│   │   └── services/         # API client & local mock sync
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🚀 Running the Project Locally

### Backend (FastAPI + SQLite)
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt  # fastapi, uvicorn
uvicorn main:app --reload --port 8000
```
API Documentation: `http://localhost:8000/docs`

### Frontend (React + Vite + Tailwind CSS)
```bash
cd frontend
npm install
npm run dev
```
Web App: `http://localhost:5173`

