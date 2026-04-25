import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY      = os.getenv('SECRET_KEY',     'dev-secret-change-in-prod')
    JWT_SECRET_KEY  = os.getenv('JWT_SECRET_KEY',  'dev-jwt-secret-change-in-prod')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    # SQLite path — use absolute path so it works on any server
    DB_PATH = os.getenv('DB_PATH', os.path.join(os.path.dirname(__file__), 'livestock.db'))

    UPLOAD_FOLDER       = os.getenv('UPLOAD_FOLDER', os.path.join(os.path.dirname(__file__), 'uploads'))
    MAX_CONTENT_LENGTH  = 5 * 1024 * 1024  # 5 MB

    PORT = int(os.getenv('PORT', 5000))

    # Allowed CORS origins (comma-separated in env)
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
