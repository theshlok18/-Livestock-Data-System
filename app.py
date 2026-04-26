from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from routes.auth import auth_bp
from routes.api import api_bp
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config['JWT_SECRET_KEY']            = Config.JWT_SECRET_KEY
    app.config['JWT_ACCESS_TOKEN_EXPIRES']  = Config.JWT_ACCESS_TOKEN_EXPIRES
    app.config['UPLOAD_FOLDER']             = Config.UPLOAD_FOLDER
    app.config['MAX_CONTENT_LENGTH']        = Config.MAX_CONTENT_LENGTH

    # CORS — allow configured frontend origin
    CORS(app, resources={r"/api/*": {
        "origins": [Config.FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
    }})

    JWTManager(app)
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(api_bp,  url_prefix='/api')

    # Health check
    @app.route('/health')
    def health():
        return {'status': 'ok', 'db': Config.DB_PATH}, 200

    return app

if __name__ == '__main__':
    app = create_app()
    debug = os.getenv('FLASK_ENV', 'production') == 'development'
    app.run(host='0.0.0.0', port=Config.PORT, debug=debug)
