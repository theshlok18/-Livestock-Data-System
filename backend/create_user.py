"""
Utility script to create users with hashed passwords.
Run: python create_user.py
"""
import bcrypt
from db import get_connection

def create_user(username, password, full_name, role='field_officer'):
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    conn = get_connection()
    with conn.cursor() as cursor:
        cursor.execute(
            'INSERT INTO users (username, password_hash, full_name, role) VALUES (%s, %s, %s, %s)',
            (username, hashed, full_name, role)
        )
    conn.close()
    print(f"User '{username}' created successfully.")

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

if __name__ == '__main__':
    # Generate hash for 'admin123'
    h = hash_password('admin123')
    print(f"Hash for 'admin123': {h}")
    print("\nUpdate schema.sql with this hash, or run:")
    print("  create_user('admin', 'admin123', 'Admin User', 'admin')")
