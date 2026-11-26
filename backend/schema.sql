-- =============================================================================
-- CampusConnect Database Schema & Seed Data (SQLite)
--
-- This file defines the relational database architecture for CampusConnect.
-- Since binary SQLite files (*.db) are ignored by git (.gitignore) to prevent
-- repository bloat and merge conflicts, this file serves as the version-controlled
-- reference schema visible on GitHub.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table 1: users
-- Represents students, faculty, and campus grievance/maintenance authorities.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,              -- 'student' or 'admin'
    email TEXT UNIQUE NOT NULL,
    roll_no TEXT,                    -- Student roll number (e.g. 22CS1042)
    emp_id TEXT,                     -- Authority employee ID (e.g. MSIT-ADM-042)
    department TEXT NOT NULL,        -- e.g. Computer Science, Campus Administration
    designation TEXT,                -- e.g. B.Tech Student, Chief Grievance Officer
    college_code TEXT NOT NULL,      -- e.g. MSIT
    created_at TEXT NOT NULL
);

-- Seed default developer testing users
INSERT OR IGNORE INTO users (
    id, name, role, email, roll_no, emp_id, department, designation, college_code, created_at
) VALUES 
(
    'USR-STU-01',
    'Riya Sharma',
    'student',
    'riya.sharma@campusconnect.edu',
    '22CS1042',
    NULL,
    'Computer Science',
    'B.Tech Student (3rd Year)',
    'MSIT',
    '2026-11-25T10:00:00Z'
),
(
    'USR-ADM-01',
    'Dr. Rajesh Verma',
    'admin',
    'dean.admin@msit.in',
    NULL,
    'MSIT-ADM-042',
    'Campus Administration',
    'Chief Grievance Officer & Dean',
    'MSIT',
    '2026-11-25T10:00:00Z'
);

-- -----------------------------------------------------------------------------
-- Table 2: affiliated_colleges
-- Registry of institutions permitted to use CampusConnect.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS affiliated_colleges (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,       -- e.g. MSIT
    name TEXT NOT NULL,              -- Maharaja Surajmal Institute of Technology
    short_name TEXT NOT NULL,        -- MSIT
    city TEXT NOT NULL,              -- Janakpuri, New Delhi
    state TEXT NOT NULL,             -- Delhi
    domain TEXT NOT NULL,            -- msit.in
    status TEXT NOT NULL,            -- 'Active'
    created_at TEXT NOT NULL
);

-- Seed test case affiliated institution (MSIT)
INSERT OR IGNORE INTO affiliated_colleges (
    id, code, name, short_name, city, state, domain, status, created_at
) VALUES (
    'COL-MSIT-01',
    'MSIT',
    'Maharaja Surajmal Institute of Technology',
    'MSIT',
    'Janakpuri, New Delhi',
    'Delhi',
    'msit.in',
    'Active',
    '2026-11-25T10:00:00Z'
);

-- -----------------------------------------------------------------------------
-- Table 3: complaints
-- Student facility grievances following the review lifecycle:
-- 'In Progress' -> 'Needs Review' (demanded by admin) -> 'Resolved' (confirmed & closed by student)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaints (
    id TEXT PRIMARY KEY,             -- e.g. CMP-2026-0001
    student_name TEXT NOT NULL,
    roll_no TEXT NOT NULL,
    department TEXT NOT NULL,
    category TEXT NOT NULL,          -- Wi-Fi, Electricity, Sanitation, Classroom, etc.
    title TEXT NOT NULL,
    description TEXT,                -- Optional detailed description
    location TEXT NOT NULL,          -- Room number, building, floor
    status TEXT NOT NULL,            -- 'In Progress', 'Needs Review', 'Resolved'
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    timeline TEXT NOT NULL           -- JSON audit trail of all lifecycle events
);

-- -----------------------------------------------------------------------------
-- Table 4: lost_and_found
-- Campus lost and found registry with verification and claim lifecycle.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lost_and_found (
    id TEXT PRIMARY KEY,             -- e.g. LF-2026-0001
    type TEXT NOT NULL,              -- 'Lost' or 'Found'
    title TEXT NOT NULL,
    category TEXT NOT NULL,          -- Electronics, College ID, Wallets, etc.
    description TEXT,
    location TEXT NOT NULL,
    item_date TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_info TEXT NOT NULL,
    roll_no TEXT NOT NULL,
    status TEXT NOT NULL,            -- 'Open', 'Needs Review', 'Claimed'
    created_at TEXT NOT NULL
);
