"""
CampusConnect - Database Layer (SQLite)

This module handles:
1. Connecting to SQLite ('campus_connect.db').
2. Creating 'complaints', 'lost_and_found', and 'affiliated_colleges' tables.
3. Reading, inserting, and updating records across student & authority workflows.
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
    """Creates tables if they do not already exist, and seeds MSIT as the primary affiliated college."""
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
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS lost_and_found (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            location TEXT NOT NULL,
            item_date TEXT NOT NULL,
            contact_name TEXT NOT NULL,
            contact_info TEXT NOT NULL,
            roll_no TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS affiliated_colleges (
            id TEXT PRIMARY KEY,
            code TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            short_name TEXT NOT NULL,
            city TEXT NOT NULL,
            state TEXT NOT NULL,
            domain TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            roll_no TEXT,
            emp_id TEXT,
            department TEXT NOT NULL,
            designation TEXT,
            class_year TEXT,
            password_hash TEXT,
            college_code TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )
    conn.commit()

    # Migrate missing columns if not present in existing table
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(users)")
    user_cols = [c[1] for c in cursor.fetchall()]
    if "phone" not in user_cols:
        cursor.execute("ALTER TABLE users ADD COLUMN phone TEXT")
    if "class_year" not in user_cols:
        cursor.execute("ALTER TABLE users ADD COLUMN class_year TEXT")
    if "password_hash" not in user_cols:
        cursor.execute("ALTER TABLE users ADD COLUMN password_hash TEXT")
        conn.commit()

    # Update phone numbers for default seeded personas if missing
    cursor.execute("UPDATE users SET phone = '+91 98765 43210' WHERE id = 'USR-STU-01' AND (phone IS NULL OR phone = '')")
    cursor.execute("UPDATE users SET phone = '+91 98111 22334' WHERE id = 'USR-ADM-01' AND (phone IS NULL OR phone = '')")
    conn.commit()

    # Seed MSIT as the test case affiliated college if empty
    cursor.execute("SELECT COUNT(*) FROM affiliated_colleges")
    if cursor.fetchone()[0] == 0:
        now = datetime.now(timezone.utc).isoformat()
        cursor.execute(
            """
            INSERT INTO affiliated_colleges (
                id, code, name, short_name, city, state, domain, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "COL-MSIT-01",
                "MSIT",
                "Maharaja Surajmal Institute of Technology",
                "MSIT",
                "Janakpuri, New Delhi",
                "Delhi",
                "msit.in",
                "Active",
                now,
            ),
        )
        conn.commit()

    # Seed developer & sample users if empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        now = datetime.now(timezone.utc).isoformat()
        users_seed = [
            (
                "USR-STU-01",
                "Riya Sharma",
                "student",
                "riya.sharma@campusconnect.edu",
                "+91 98765 43210",
                "22CS1042",
                None,
                "Computer Science",
                "B.Tech Student",
                "B.Tech CSE - 3rd Year",
                None,
                "MSIT",
                now,
            ),
            (
                "USR-ADM-01",
                "Dr. Rajesh Verma",
                "admin",
                "dean.admin@msit.in",
                "+91 98111 22334",
                None,
                "MSIT-ADM-042",
                "Campus Administration",
                "Chief Grievance Officer & Dean",
                None,
                None,
                "MSIT",
                now,
            ),
        ]
        cursor.executemany(
            """
            INSERT INTO users (
                id, name, role, email, phone, roll_no, emp_id, department, designation, class_year, password_hash, college_code, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            users_seed,
        )
        conn.commit()

    conn.close()


# ---------------------------------------------------------------------------
# Complaints Helpers & Queries
# ---------------------------------------------------------------------------

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

    initial_timeline = [
        {
            "status": "In Progress",
            "at": now,
            "note": "Complaint registered in MSIT CampusConnect portal. Sent to campus authority for investigation.",
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
            data.get("description", "").strip(),
            data["location"].strip(),
            "In Progress",
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
        "In Progress": "Under investigation & maintenance work by campus authority.",
        "Needs Review": "Work completed by campus authority. Review requested from student to verify and close.",
        "Resolved": "Verified and closed by student.",
        "Pending": "Complaint placed on hold / queued.",
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


# ---------------------------------------------------------------------------
# Lost & Found Helpers & Queries
# ---------------------------------------------------------------------------

def lost_found_row_to_dict(row: sqlite3.Row) -> dict:
    """Formats a lost_and_found DB row into camelCase JSON for the frontend."""
    return {
        "id": row["id"],
        "type": row["type"],               # 'Lost' or 'Found'
        "title": row["title"],
        "category": row["category"],
        "description": row["description"],
        "location": row["location"],
        "itemDate": row["item_date"],
        "contactName": row["contact_name"],
        "contactInfo": row["contact_info"],
        "rollNo": row["roll_no"],
        "status": row["status"],           # 'Open' or 'Claimed'
        "createdAt": row["created_at"],
    }


def generate_lost_found_id(cursor) -> str:
    """Generates LF-YYYY-0001, LF-YYYY-0002, etc."""
    year = datetime.now(timezone.utc).year
    cursor.execute("SELECT id FROM lost_and_found WHERE id LIKE ?", (f"LF-{year}-%",))
    rows = cursor.fetchall()
    numbers = []
    for r in rows:
        parts = r["id"].split("-")
        if len(parts) == 3 and parts[2].isdigit():
            numbers.append(int(parts[2]))
    next_num = max(numbers, default=0) + 1
    return f"LF-{year}-{str(next_num).zfill(4)}"


def get_all_lost_found() -> list:
    """Returns all lost and found items ordered with newest first."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM lost_and_found ORDER BY datetime(created_at) DESC")
    rows = cursor.fetchall()
    conn.close()
    return [lost_found_row_to_dict(r) for r in rows]


def get_lost_found_by_id(item_id: str):
    """Finds a lost & found item by its ID."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM lost_and_found WHERE id = ?", (item_id.strip().upper(),))
    row = cursor.fetchone()
    conn.close()
    return lost_found_row_to_dict(row) if row else None


def create_lost_found(data: dict) -> dict:
    """Inserts a new lost or found item into SQLite."""
    conn = get_db()
    cursor = conn.cursor()

    item_id = generate_lost_found_id(cursor)
    now = datetime.now(timezone.utc).isoformat()

    cursor.execute(
        """
        INSERT INTO lost_and_found (
            id, type, title, category, description, location, item_date, contact_name, contact_info, roll_no, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            item_id,
            data.get("type", "Lost").capitalize(),
            data["title"].strip(),
            data.get("category", "Other").strip(),
            data.get("description", "").strip(),
            data.get("location", "").strip(),
            data.get("itemDate", now[:10]).strip(),
            data.get("contactName", "Student").strip(),
            data.get("contactInfo", "").strip(),
            data.get("rollNo", "").strip().upper(),
            data.get("status", "Open"),
            now,
        ),
    )
    conn.commit()
    conn.close()

    return get_lost_found_by_id(item_id)


def update_lost_found_status(item_id: str, new_status: str):
    """Updates status of a lost & found item (e.g., 'Claimed' or 'Open')."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM lost_and_found WHERE id = ?", (item_id.strip().upper(),))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None

    cursor.execute(
        """
        UPDATE lost_and_found
        SET status = ?
        WHERE id = ?
        """,
        (new_status, item_id.strip().upper()),
    )
    conn.commit()
    conn.close()

    return get_lost_found_by_id(item_id)


# ---------------------------------------------------------------------------
# Affiliated Colleges Helpers & Queries
# ---------------------------------------------------------------------------

def college_row_to_dict(row: sqlite3.Row) -> dict:
    """Formats an affiliated_colleges DB row into camelCase JSON."""
    return {
        "id": row["id"],
        "code": row["code"],
        "name": row["name"],
        "shortName": row["short_name"],
        "city": row["city"],
        "state": row["state"],
        "domain": row["domain"],
        "status": row["status"],
        "createdAt": row["created_at"],
    }


def get_all_affiliated_colleges() -> list:
    """Returns all authorized affiliated colleges."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM affiliated_colleges WHERE status = 'Active' ORDER BY name ASC")
    rows = cursor.fetchall()
    conn.close()
    return [college_row_to_dict(r) for r in rows]


def get_college_by_code(code: str):
    """Finds an affiliated college by code (e.g. 'MSIT')."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM affiliated_colleges WHERE UPPER(code) = ?", (code.strip().upper(),))
    row = cursor.fetchone()
    conn.close()
    return college_row_to_dict(row) if row else None


# ---------------------------------------------------------------------------
# Users Helpers & Queries
# ---------------------------------------------------------------------------

def user_row_to_dict(row: sqlite3.Row) -> dict:
    """Formats a users DB row into camelCase JSON."""
    keys = row.keys()
    return {
        "id": row["id"],
        "name": row["name"],
        "role": row["role"],
        "email": row["email"],
        "phone": row["phone"] if "phone" in keys else "",
        "rollNo": row["roll_no"],
        "empId": row["emp_id"],
        "department": row["department"],
        "designation": row["designation"],
        "classYear": row["class_year"] if "class_year" in keys else "",
        "collegeCode": row["college_code"],
        "createdAt": row["created_at"],
    }


def register_user(data: dict) -> dict:
    """
    Registers a new user. Returns the created user dict.
    Raises ValueError if phone/email/roll_no already exists.
    """
    import hashlib, os
    conn = get_db()
    cursor = conn.cursor()

    # Duplicate checks
    if data.get("email"):
        cursor.execute("SELECT id FROM users WHERE email = ?", (data["email"].strip(),))
        if cursor.fetchone():
            conn.close()
            raise ValueError("An account with this email already exists.")
    if data.get("phone"):
        last10 = data["phone"].strip()[-10:]
        cursor.execute("SELECT id FROM users WHERE phone LIKE ?", (f"%{last10}%",))
        if cursor.fetchone():
            conn.close()
            raise ValueError("An account with this mobile number already exists.")
    if data.get("rollNo") and data.get("role") == "student":
        cursor.execute("SELECT id FROM users WHERE roll_no = ? AND college_code = ?",
                       (data["rollNo"].strip().upper(), data["collegeCode"].strip()))
        if cursor.fetchone():
            conn.close()
            raise ValueError("An account with this Enrollment/Roll Number already exists for this college.")
    if data.get("empId") and data.get("role") == "admin":
        cursor.execute("SELECT id FROM users WHERE emp_id = ? AND college_code = ?",
                       (data["empId"].strip().upper(), data["collegeCode"].strip()))
        if cursor.fetchone():
            conn.close()
            raise ValueError("An account with this Employee ID already exists for this college.")

    now = datetime.now(timezone.utc).isoformat()
    # Generate a unique user ID
    prefix = "USR-STU" if data.get("role") == "student" else "USR-ADM"
    cursor.execute("SELECT COUNT(*) FROM users WHERE role = ?", (data["role"],))
    count = cursor.fetchone()[0] + 1
    user_id = f"{prefix}-{count:03d}"

    # Simple password hash (SHA-256 + salt for demo — use bcrypt in production)
    raw_password = data.get("password", "")
    salt = os.urandom(16).hex()
    pw_hash = hashlib.sha256(f"{salt}:{raw_password}".encode()).hexdigest() if raw_password else None
    pw_stored = f"{salt}:{pw_hash}" if pw_hash else None

    # Placeholder email for students who didn't provide one
    email_val = (data.get("email") or "").strip() or f"student.{user_id.lower().replace('-', '')}@campusconnect.local"

    cursor.execute(
        """
        INSERT INTO users (
            id, name, role, email, phone, roll_no, emp_id, department, designation,
            class_year, password_hash, college_code, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
            data["name"].strip(),
            data["role"],
            email_val,
            (data.get("phone") or "").strip() or None,
            (data.get("rollNo") or "").strip().upper() or None,
            (data.get("empId") or "").strip().upper() or None,
            data["department"].strip(),
            (data.get("designation") or "").strip() or None,
            (data.get("classYear") or "").strip() or None,
            pw_stored,
            data["collegeCode"].strip(),
            now,
        ),
    )
    conn.commit()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return user_row_to_dict(row)


def get_user_by_phone(phone: str):
    """Finds a user by mobile phone number."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE phone LIKE ?", (f"%{phone.strip()[-10:]}%",))
    row = cursor.fetchone()
    conn.close()
    return user_row_to_dict(row) if row else None


def get_all_users() -> list:
    """Returns all registered users in the database."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users ORDER BY role DESC, name ASC")
    rows = cursor.fetchall()
    conn.close()
    return [user_row_to_dict(r) for r in rows]


def get_user_by_id(user_id: str):
    """Finds a user by ID."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id.strip(),))
    row = cursor.fetchone()
    conn.close()
    return user_row_to_dict(row) if row else None


def get_database_overview() -> dict:
    """Returns database schema information, table names, and row counts for developers."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    tables = [row["name"] for row in cursor.fetchall()]

    overview = {}
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        cursor.execute(f"PRAGMA table_info({table})")
        columns = [{"name": c["name"], "type": c["type"]} for c in cursor.fetchall()]
        overview[table] = {
            "rowCount": count,
            "columns": columns,
        }

    conn.close()
    return {
        "database": "campus_connect.db",
        "tables": overview,
    }

