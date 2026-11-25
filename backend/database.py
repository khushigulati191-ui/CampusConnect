"""
CampusConnect - Database Layer (SQLite)

This module handles:
1. Connecting to SQLite ('campus_connect.db').
2. Creating the 'complaints' table.
3. Reading, inserting, and updating complaints.
"""

import json
import os
import sqlite3
from datetime import datetime, timezone

DB_FILE = os.path.join(os.path.dirname(__file__), "campus_connect.db")


def get_db():
    """Returns a SQLite connection where columns can be accessed by name."""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Creates an empty 'complaints' table if it does not already exist."""
    conn = get_db()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS complaints (
            id TEXT PRIMARY KEY,
            student_name TEXT NOT NULL,
            roll_no TEXT NOT NULL,
            department TEXT NOT NULL,
            category TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            location TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            timeline TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def row_to_dict(row: sqlite3.Row) -> dict:
    """Formats database row into camelCase JSON for the frontend."""
    return {
        "id": row["id"],
        "studentName": row["student_name"],
        "rollNo": row["roll_no"],
        "department": row["department"],
        "category": row["category"],
        "title": row["title"],
        "description": row["description"],
        "location": row["location"],
        "status": row["status"],
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
        "timeline": json.loads(row["timeline"]) if row["timeline"] else [],
    }


def generate_id(cursor) -> str:
    """Generates CMP-YYYY-0001, CMP-YYYY-0002, etc."""
    year = datetime.now(timezone.utc).year
    cursor.execute("SELECT id FROM complaints WHERE id LIKE ?", (f"CMP-{year}-%",))
    rows = cursor.fetchall()
    numbers = []
    for r in rows:
        parts = r["id"].split("-")
        if len(parts) == 3 and parts[2].isdigit():
            numbers.append(int(parts[2]))
    next_num = max(numbers, default=0) + 1
    return f"CMP-{year}-{str(next_num).zfill(4)}"


def get_all_complaints() -> list:
    """Returns all complaints from database (empty list when new)."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM complaints ORDER BY datetime(created_at) ASC")
    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]


def get_complaint_by_id(complaint_id: str):
    """Finds a complaint by its ID (e.g. CMP-2026-0001)."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id.strip().upper(),))
    row = cursor.fetchone()
    conn.close()
    return row_to_dict(row) if row else None


def create_complaint(data: dict) -> dict:
    """Saves a newly submitted complaint to the database."""
    conn = get_db()
    cursor = conn.cursor()

    complaint_id = generate_id(cursor)
    now = datetime.now(timezone.utc).isoformat()

    # Initial timeline entry
    initial_timeline = [
        {
            "status": "Pending",
            "at": now,
            "note": "Complaint submitted and added to the queue.",
        }
    ]

    cursor.execute(
        """
        INSERT INTO complaints (
            id, student_name, roll_no, department, category, title, description, location, status, created_at, updated_at, timeline
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            complaint_id,
            data["studentName"].strip(),
            data["rollNo"].strip().upper(),
            data["department"].strip(),
            data["category"].strip(),
            data["title"].strip(),
            data["description"].strip(),
            data["location"].strip(),
            "Pending",
            now,
            now,
            json.dumps(initial_timeline),
        ),
    )
    conn.commit()
    conn.close()

    return get_complaint_by_id(complaint_id)


def update_complaint_status(complaint_id: str, new_status: str):
    """Updates complaint status and appends a new timeline event."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id.strip().upper(),))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None

    now = datetime.now(timezone.utc).isoformat()
    timeline = json.loads(row["timeline"]) if row["timeline"] else []

    status_notes = {
        "Pending": "Complaint moved back to the queue.",
        "In Progress": "Assigned to the maintenance team. Work has started.",
        "Resolved": "Issue fixed and verified by the facilities office.",
    }
    note = status_notes.get(new_status, f"Status updated to {new_status}.")
    timeline.append({"status": new_status, "at": now, "note": note})

    cursor.execute(
        """
        UPDATE complaints
        SET status = ?, updated_at = ?, timeline = ?
        WHERE id = ?
        """,
        (new_status, now, json.dumps(timeline), complaint_id.strip().upper()),
    )
    conn.commit()
    conn.close()

    return get_complaint_by_id(complaint_id)
