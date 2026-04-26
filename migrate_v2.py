"""
Migration v2: add new fields to monthly_records.
Run: python migrate_v2.py
"""
import sqlite3, os

DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'livestock.db')
conn = sqlite3.connect(DB)

NEW_COLS = [
    ("mobile_no",          "TEXT"),
    ("aadhar_no",          "TEXT"),
    ("pregnancy_month",    "INTEGER"),
    ("milk_increase",      "TEXT"),
    ("milk_increase_value","REAL"),
    ("challenge_feeding",  "REAL"),
]

for col, typ in NEW_COLS:
    try:
        conn.execute(f"ALTER TABLE monthly_records ADD COLUMN {col} {typ}")
        print(f"  ✓ Added {col}")
    except Exception as e:
        if "duplicate column" in str(e).lower():
            print(f"  · {col} already exists")
        else:
            print(f"  ✗ {col}: {e}")

# Also add to animals table
ANIMAL_COLS = [
    ("mobile_no",  "TEXT"),
    ("aadhar_no",  "TEXT"),
]
for col, typ in ANIMAL_COLS:
    try:
        conn.execute(f"ALTER TABLE animals ADD COLUMN {col} {typ}")
        print(f"  ✓ Added animals.{col}")
    except Exception as e:
        if "duplicate column" in str(e).lower():
            print(f"  · animals.{col} already exists")
        else:
            print(f"  ✗ animals.{col}: {e}")

conn.commit()
conn.close()
print("Migration v2 complete.")
