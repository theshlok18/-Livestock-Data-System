"""
Migration: add feeding_data column to monthly_records.
Run once: python migrate_feeding.py
"""
import sqlite3, os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'livestock.db')

conn = sqlite3.connect(DB_PATH)
try:
    conn.execute("ALTER TABLE monthly_records ADD COLUMN feeding_data TEXT DEFAULT '[]'")
    conn.commit()
    print("✓ feeding_data column added")
except Exception as e:
    if 'duplicate column' in str(e).lower():
        print("✓ feeding_data column already exists")
    else:
        print(f"Error: {e}")
conn.close()
