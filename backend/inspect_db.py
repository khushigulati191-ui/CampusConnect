#!/usr/bin/env python3
"""
CampusConnect - Developer Database Inspector CLI

Run this script to inspect tables, schema, row counts, and data rows directly
inside 'backend/campus_connect.db'.

Usage:
    python backend/inspect_db.py
    python backend/inspect_db.py users
    python backend/inspect_db.py complaints
    python backend/inspect_db.py lost_and_found
    python backend/inspect_db.py affiliated_colleges
"""

import os
import sys
import sqlite3
import json

DB_PATH = os.path.join(os.path.dirname(__file__), "campus_connect.db")


def inspect():
    if not os.path.exists(DB_PATH):
        print(f"[!] Database file not found at: {DB_PATH}")
        print("Run the backend or call database.init_db() first.")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    tables = [row["name"] for row in cursor.fetchall()]

    filter_table = sys.argv[1].strip() if len(sys.argv) > 1 else None

    print("=" * 70)
    print(" CampusConnect SQLite Database Inspector")
    print(f" File: {DB_PATH}")
    print("=" * 70)

    for table in tables:
        if filter_table and table.lower() != filter_table.lower():
            continue

        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]

        cursor.execute(f"PRAGMA table_info({table})")
        cols = cursor.fetchall()

        print(f"\n[TABLE] {table.upper()} ({count} records)")
        col_summary = ", ".join([f"{c['name']} ({c['type']})" for c in cols])
        print(f" Columns: {col_summary}")
        print("-" * 70)

        cursor.execute(f"SELECT * FROM {table} LIMIT 10")
        rows = cursor.fetchall()
        if not rows:
            print("  (Empty table)")
        else:
            for i, row in enumerate(rows, start=1):
                d = dict(row)
                # Pretty print json if timeline
                if "timeline" in d and d["timeline"]:
                    try:
                        d["timeline"] = f"[{len(json.loads(d['timeline']))} audit events]"
                    except Exception:
                        pass
                print(f"  Row {i}: {d}")

    print("\n" + "=" * 70)
    print("Tip: Run `python backend/inspect_db.py <table>` to filter by table.")
    print("=" * 70)
    conn.close()


if __name__ == "__main__":
    inspect()
