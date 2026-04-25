from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
import bcrypt
from db import get_connection

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    try:
        conn = get_connection()
        user = conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
        conn.close()
    except Exception as e:
        return jsonify({'error': 'Database error', 'details': str(e)}), 500

    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401

    if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        return jsonify({'error': 'Invalid credentials'}), 401

    token = create_access_token(identity=str(user['id']), additional_claims={
        'username': user['username'],
        'full_name': user['full_name'],
        'role': user['role']
    })

    return jsonify({
        'token': token,
        'user': {
            'id': user['id'],
            'username': user['username'],
            'full_name': user['full_name'],
            'role': user['role']
        }
    }), 200
