"""
Seed script — creates default users with correct bcrypt hashes.
Run AFTER importing schema.sql:  python seed.py
"""
import bcrypt
from db import get_connection

USERS = [
    ('admin', 'admin123', 'Admin User', 'admin'),
    ('officer1', 'officer123', 'Field Officer 1', 'field_officer'),
]

def seed():
    conn = get_connection()
    with conn.cursor() as cursor:
        for username, password, full_name, role in USERS:
            hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
            cursor.execute('''
                INSERT INTO users (username, password_hash, full_name, role)
                VALUES (%s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash)
            ''', (username, hashed, full_name, role))
            print(f"  ✓ User '{username}' seeded")
    conn.close()
    print("Seeding complete.")

if __name__ == '__main__':
    seed()
