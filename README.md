# CampusConnect: Smart Campus Helpdesk & Complaint Management System

CampusConnect is a web-based campus facility helpdesk and complaint management system designed to streamline student issue reporting and administrative triage.

## 🎯 Project Highlights
- **Real-World Problem**: Centralized reporting for Wi-Fi, electricity, sanitation, classroom equipment, and infrastructure issues.
- **Data Structures in Action**:
  - **Queue (FIFO)**: Ingests incoming student complaints strictly in chronological arrival order.
  - **Priority Queue (Binary Min-Heap)**: Dispatches complaints based on urgency/severity level (Critical, High, Medium, Low) with arrival-time tie-breaking.
- **Tech Stack**:
  - **Frontend**: React.js with Vite & custom CSS
  - **Backend**: Python with FastAPI
  - **Database**: SQLite3

## 📁 Repository Structure
```text
CampusConnect/
├── backend/          # FastAPI application & custom Data Structures
├── frontend/         # React + Vite frontend
├── .gitignore
└── README.md
```
