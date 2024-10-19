from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from config.db_config import connect_to_db

db = connect_to_db()

user_bp = Blueprint('user_bp', __name__)

# Register a new user
@user_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data['email']
    password = data['password']

    # Ensure email is a valid Good Earth Markets address
    if not email.endswith("@goodearthmarkets.com"):
        return jsonify({"error": "Invalid email domain"}), 400

    hashed_password = generate_password_hash(password)

    cursor = db.cursor()
    try:
        cursor.execute("INSERT INTO users (email, password) VALUES (%s, %s)", (email, hashed_password))
        db.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Login route for users and admins
@user_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data['email']
    password = data['password']

    cursor = db.cursor(dictionary=True)

    # Check if the user exists
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    if user and check_password_hash(user['password'], password):
        access_token = create_access_token(identity={"id": user['id'], "role": "user"})
        return jsonify(access_token=access_token), 200

    # Check if the email belongs to an admin
    cursor.execute("SELECT * FROM admins WHERE email = %s", (email,))
    admin = cursor.fetchone()

    if admin and check_password_hash(admin['password'], password):
        access_token = create_access_token(identity={"id": admin['id'], "role": "admin"})
        return jsonify(access_token=access_token), 200

    return jsonify({"error": "Invalid email or password"}), 401

# Get the current user's info
@user_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_identity = get_jwt_identity()
    return jsonify(user_identity), 200
