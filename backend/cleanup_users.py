import sqlite3
conn = sqlite3.connect('livestock.db')
conn.execute("DELETE FROM users WHERE username IN ('admin', 'officer1')")
conn.commit()
rows = conn.execute("SELECT username, full_name, role FROM users").fetchall()
print("Remaining users:")
for r in rows:
    print(" ", r)
conn.close()
