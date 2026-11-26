"""
CampusConnect Backend API
FastAPI service connecting SQLite database and custom Data Structures to the React frontend.
"""

from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import database
from data_structures import FIFOQueue, PriorityQueue


# ---------------------------------------------------------------------------
# Lifespan: Initialize DB and seeds on startup
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    database.init_db()
    yield


app = FastAPI(
    title="CampusConnect API",
    description="Smart Campus Helpdesk & Complaint Management System API",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS Configuration: Crucial for seamless frontend-backend communication
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*",  # Allow all during local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------
class ComplaintCreate(BaseModel):
    studentName: str = Field(..., min_length=1, description="Student's full name")
    rollNo: str = Field(..., min_length=1, description="College Roll / ID Number")
    department: str = Field(..., min_length=1, description="Department name")
    category: str = Field(..., min_length=1, description="Issue category")
    title: str = Field(..., min_length=1, description="Summary title of the complaint")
    description: Optional[str] = Field("", description="Detailed description (optional)")
    location: str = Field(..., min_length=1, description="Location where issue occurred")


class StatusUpdate(BaseModel):
    status: str = Field(..., description="New status: 'In Progress', 'Needs Review', or 'Resolved'")


class LostFoundCreate(BaseModel):
    type: str = Field("Lost", description="'Lost' or 'Found'")
    title: str = Field(..., min_length=1, description="Item name / title")
    category: str = Field("Other", description="Item category (Electronics, Documents, etc.)")
    description: Optional[str] = Field("", description="Detailed description and identifiable marks")
    location: str = Field(..., min_length=1, description="Where the item was lost or found")
    itemDate: Optional[str] = Field("", description="Date when lost or found")
    contactName: str = Field(..., min_length=1, description="Name of the person reporting")
    contactInfo: str = Field(..., min_length=1, description="Phone, email or room number")
    rollNo: Optional[str] = Field("", description="Student roll number")


class LostFoundStatusUpdate(BaseModel):
    status: str = Field(..., description="Status: 'Open' or 'Claimed'")


# ---------------------------------------------------------------------------
# API Routes
# ---------------------------------------------------------------------------
@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint to verify backend connectivity."""
    return {"status": "ok", "service": "CampusConnect Backend API"}


@app.get("/api/complaints", tags=["Complaints"])
def list_complaints():
    """Returns all complaints ordered chronologically."""
    return database.get_all_complaints()


@app.get("/api/complaints/{complaint_id}", tags=["Complaints"])
def get_complaint(complaint_id: str):
    """Fetches a single complaint by its ID (e.g., CMP-2026-0001)."""
    complaint = database.get_complaint_by_id(complaint_id)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID '{complaint_id}' was not found.",
        )
    return complaint


@app.post("/api/complaints", status_code=status.HTTP_201_CREATED, tags=["Complaints"])
def create_complaint(payload: ComplaintCreate):
    """Submits a new complaint, assigns a CMP ID, and queues it."""
    created = database.create_complaint(payload.model_dump())
    return created


@app.patch("/api/complaints/{complaint_id}/status", tags=["Complaints"])
def update_status(complaint_id: str, payload: StatusUpdate):
    """Updates complaint lifecycle status and appends to the audit timeline."""
    valid_statuses = {"In Progress", "Needs Review", "Resolved", "Pending"}
    if payload.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{payload.status}'. Must be one of: {', '.join(valid_statuses)}",
        )

    updated = database.update_complaint_status(complaint_id, payload.status)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID '{complaint_id}' was not found.",
        )
    return updated


# ---------------------------------------------------------------------------
# Data Structure Endpoints (FIFO & Priority Queue)
# ---------------------------------------------------------------------------
@app.get("/api/queue/fifo", tags=["Queues"])
def get_fifo_queue():
    """
    Returns unresolved complaints loaded into a FIFO Queue in order of arrival.
    """
    complaints = database.get_all_complaints()
    fifo = FIFOQueue()
    for c in complaints:
        if c["status"] != "Resolved":
            fifo.enqueue(c)
    return {
        "size": fifo.size(),
        "front": fifo.peek(),
        "items": fifo.to_list(),
    }


@app.get("/api/queue/priority", tags=["Queues"])
def get_priority_queue():
    """
    Returns unresolved complaints organized in a Min-Heap Priority Queue.
    Priority order: Wi-Fi/Electricity -> High/Critical, Sanitation/Classroom -> Medium/Low.
    """
    complaints = database.get_all_complaints()
    pq = PriorityQueue()
    # Categorical severity heuristic
    severity_map = {
        "Electricity": "Critical",
        "Wi-Fi": "High",
        "Sanitation": "Medium",
        "Classroom": "Medium",
        "Hostel": "Medium",
    }
    for c in complaints:
        if c["status"] != "Resolved":
            severity = severity_map.get(c.get("category"), "Low")
            pq.push(c, severity=severity)

    return {
        "size": pq.size(),
        "highestPriority": pq.peek(),
        "items": pq.to_list(),
    }


# ---------------------------------------------------------------------------
# Lost & Found Endpoints
# ---------------------------------------------------------------------------
@app.get("/api/lost-and-found", tags=["Lost & Found"])
def list_lost_found():
    """Returns all lost and found items."""
    return database.get_all_lost_found()


@app.post("/api/lost-and-found", status_code=status.HTTP_201_CREATED, tags=["Lost & Found"])
def report_lost_found(payload: LostFoundCreate):
    """Submits a new lost or found item report."""
    created = database.create_lost_found(payload.model_dump())
    return created


@app.patch("/api/lost-and-found/{item_id}/status", tags=["Lost & Found"])
def update_lost_found_status(item_id: str, payload: LostFoundStatusUpdate):
    """Updates status of a lost & found item (e.g., 'Claimed')."""
    updated = database.update_lost_found_status(item_id, payload.status)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with ID '{item_id}' was not found.",
        )
    return updated


# ---------------------------------------------------------------------------
# Affiliated Colleges Endpoints
# ---------------------------------------------------------------------------
@app.get("/api/colleges", tags=["Colleges"])
def list_affiliated_colleges():
    """Returns all authorized affiliated colleges."""
    return database.get_all_affiliated_colleges()


@app.get("/api/colleges/{code}", tags=["Colleges"])
def get_college(code: str):
    """Fetches affiliated college details by its code (e.g. 'MSIT')."""
    college = database.get_college_by_code(code)
    if not college:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"College '{code}' is not currently affiliated.",
        )
    return college


# ---------------------------------------------------------------------------
# Developer & Users Endpoints
# ---------------------------------------------------------------------------
@app.get("/api/users", tags=["Users"])
def list_users():
    """Returns all users registered in the system (Riya Sharma, Dr. Rajesh Verma, etc.)."""
    return database.get_all_users()


@app.get("/api/dev/db-overview", tags=["Developer"])
def get_dev_database_overview():
    """
    Developer overview: returns all tables, columns, row counts, and health status
    of the local SQLite database.
    """
    return database.get_database_overview()



