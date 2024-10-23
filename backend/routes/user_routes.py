from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from config.db_config import connect_to_db
import logging

db = connect_to_db()

user_bp = Blueprint('user_bp', __name__)

# Register a new user
@user_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    store_id = data.get('store_id')
    first_name = data.get('first_name')
    last_name = data.get('last_name')

    # Ensure all required fields are present
    if not all([email, password, first_name, last_name, store_id]):
        return jsonify({"error": "All fields are required"}), 400

    # Ensure email is a valid Good Earth Markets address
    if not email.endswith("@goodearthmarkets.com"):
        return jsonify({"error": "Invalid email domain"}), 400

    cursor = db.cursor()
    try:
        # Check for existing email
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"error": "Account already registered with this email."}), 400

        hashed_password = generate_password_hash(password)
        cursor.execute("INSERT INTO users (email, password, store_id, first_name, last_name) VALUES (%s, %s, %s, %s, %s)", 
                       (email, hashed_password, store_id, first_name, last_name))
        db.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        logging.error(f"Database error: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        cursor.close()

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
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'role': 'user',
            }
        }), 200

    # Check if the email belongs to an admin
    cursor.execute("SELECT * FROM admin WHERE email = %s", (email,))
    admin = cursor.fetchone()

    if admin and check_password_hash(admin['password'], password):
        access_token = create_access_token(identity={"id": admin['id'], "role": "admin"})
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': admin['id'],
                'email': admin['email'],
                'role': 'admin',
            }
        }), 200

    return jsonify({"error": "Invalid email or password"}), 401

# Get the current user's info
@user_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_identity = get_jwt_identity()  # Get user identity from the token
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT first_name, email, store_id FROM users WHERE id = %s", (user_identity['id'],))
    user = cursor.fetchone()

    if user:
        return jsonify(user), 200  # Return user details
    return jsonify({"error": "User not found"}), 404

# Change user password
@user_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    user_identity = get_jwt_identity()  # Get user identity from the token
    data = request.json
    current_password = data['currentPassword']
    new_password = data['newPassword']

    cursor = db.cursor(dictionary=True)

    # Fetch the user's current password
    cursor.execute("SELECT password FROM users WHERE id = %s", (user_identity['id'],))
    user = cursor.fetchone()

    if user and check_password_hash(user['password'], current_password):
        # Current password matches, proceed to update the password
        hashed_new_password = generate_password_hash(new_password)
        cursor.execute("UPDATE users SET password = %s WHERE id = %s", (hashed_new_password, user_identity['id']))
        db.commit()
        return jsonify({"message": "Password changed successfully."}), 200

    return jsonify({"error": "Current password is incorrect."}), 401


# Change user email
@user_bp.route('/change-email', methods=['POST'])
@jwt_required()
def change_email():
    user_identity = get_jwt_identity()  # Get user identity from the token
    data = request.json
    current_email = data['currentEmail']
    new_email = data['newEmail']

    cursor = db.cursor(dictionary=True)

    # Fetch the user's current email and password
    cursor.execute("SELECT email, password FROM users WHERE id = %s", (user_identity['id'],))
    user = cursor.fetchone()

    if user:
        # Verify the current email
        if user['email'] != current_email:
            return jsonify({"error": "Current email is incorrect."}), 401

        # Validate new email format
        if '@goodearthmarkets.com' not in new_email:
            return jsonify({"error": "Please enter a valid GEM email."}), 400

        # Update the user's email
        cursor.execute("UPDATE users SET email = %s WHERE id = %s", (new_email, user_identity['id']))
        db.commit()

        return jsonify({"message": "Email updated successfully."}), 200

    return jsonify({"error": "User not found."}), 404
