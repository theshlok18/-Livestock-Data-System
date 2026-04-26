"""
Initialize SQLite database with schema and seed data.
Run: python init_db.py
"""
import sqlite3
import bcrypt
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'livestock.db')

def init():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    c = conn.cursor()

    c.executescript('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            full_name TEXT,
            role TEXT DEFAULT 'field_officer',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS animals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tag_no TEXT NOT NULL UNIQUE,
            animal_type TEXT,
            breed TEXT,
            age TEXT,
            owner_name TEXT,
            village TEXT,
            contact TEXT,
            image_path TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS monthly_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tag_no TEXT NOT NULL,
            record_date TEXT NOT NULL,
            milk_per_day REAL,
            fat REAL,
            snf REAL,
            rate REAL,
            feeding TEXT,
            expenses REAL,
            health_status TEXT,
            vaccination TEXT,
            deworming TEXT,
            pregnancy_status TEXT,
            lactation_no INTEGER,
            dry_date TEXT,
            calving_date TEXT,
            calf_tag TEXT,
            calf_sex TEXT,
            body_weight REAL,
            body_condition_score TEXT,
            notes TEXT,
            is_draft INTEGER DEFAULT 0,
            created_by INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tag_no) REFERENCES animals(tag_no) ON DELETE CASCADE,
            FOREIGN KEY (created_by) REFERENCES users(id)
        );
    ''')

    # Seed users with fresh bcrypt hashes
    users = [
        ('admin',    'admin123',   'Admin User',      'admin'),
        ('officer1', 'officer123', 'Field Officer 1', 'field_officer'),
        ('shlok',    'shlok@0011', 'Shlok Sathe',     'field_officer'),
    ]
    for username, password, full_name, role in users:
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(rounds=12)).decode('utf-8')
        c.execute('''
            INSERT OR REPLACE INTO users (username, password_hash, full_name, role)
            VALUES (?, ?, ?, ?)
        ''', (username, hashed, full_name, role))
        print(f"  ✓ User '{username}' created")

    # Sample animals
    c.execute('''INSERT OR IGNORE INTO animals (tag_no, animal_type, breed, age, owner_name, village, contact)
                 VALUES (?,?,?,?,?,?,?)''',
              ('TAG001','Cow','HF Cross','4 Years','Ramesh Kumar','Nagpur Village','9876543210'))
    c.execute('''INSERT OR IGNORE INTO animals (tag_no, animal_type, breed, age, owner_name, village, contact)
                 VALUES (?,?,?,?,?,?,?)''',
              ('TAG002','Buffalo','Murrah','5 Years','Suresh Patil','Wardha','9123456789'))

    # Sample records
    c.execute('''INSERT OR IGNORE INTO monthly_records
        (tag_no,record_date,milk_per_day,fat,snf,rate,feeding,expenses,health_status,notes,is_draft,created_by)
        VALUES (?,?,?,?,?,?,?,?,?,?,0,1)''',
        ('TAG001','2026-03-01',12.5,4.2,8.5,35.0,'Green fodder + Concentrate',150.0,'Healthy','Normal lactation'))
    c.execute('''INSERT OR IGNORE INTO monthly_records
        (tag_no,record_date,milk_per_day,fat,snf,rate,feeding,expenses,health_status,notes,is_draft,created_by)
        VALUES (?,?,?,?,?,?,?,?,?,?,0,1)''',
        ('TAG001','2026-04-01',11.8,4.0,8.3,35.0,'Green fodder + Concentrate',150.0,'Healthy','Slight decrease'))

    conn.commit()
    conn.close()
    print(f"\nDatabase ready: {DB_PATH}")
    print("\nLogin credentials:")
    print("  admin    / admin123")
    print("  officer1 / officer123")
    print("  shlok    / shlok@0011")

if __name__ == '__main__':
    init()
