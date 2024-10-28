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
    phone_number = data.get('phone_number')

    # Ensure all required fields are present
    if not all([email, password, first_name, last_name, store_id, phone_number]):
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
        cursor.execute("INSERT INTO users (email, password, store_id, first_name, last_name, phone_number) VALUES (%s, %s, %s, %s, %s, %s)", 
                       (email, hashed_password, store_id, first_name, last_name, phone_number))
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

@user_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_identity = get_jwt_identity()  # Get user identity and role from the token
    cursor = db.cursor(dictionary=True)

    if user_identity['role'] == 'admin':
        # If the role is admin, fetch admin details
        cursor.execute("SELECT id, first_name, last_name, store_id, email FROM admin WHERE id = %s", (user_identity['id'],))
        admin = cursor.fetchone()

        if admin:
            return jsonify({
                'id': admin['id'],
                'first_name': admin['first_name'],
                'last_name': admin['last_name'],
                'email': admin['email'],
                'store_id': admin['store_id'],
                'role': 'admin'
            }), 200

    else:
        # Otherwise, fetch user details
        cursor.execute("SELECT id, first_name, email, store_id, phone_number FROM users WHERE id = %s", (user_identity['id'],))
        user = cursor.fetchone()

        if user:
            return jsonify({
                'id': user['id'],
                'first_name': user['first_name'],
                'email': user['email'],
                'phone_number': user['phone_number'],
                'store_id': user['store_id'],
                'role': 'user'
            }), 200

    return jsonify({"error": "User not found"}), 404


# Change password
@user_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    user_identity = get_jwt_identity()  # Get user identity from the token
    data = request.json
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')

    cursor = db.cursor(dictionary=True)

    # Determine if user is admin or user
    if user_identity['role'] == 'admin':
        # Fetch the admin's current password
        cursor.execute("SELECT password FROM admin WHERE id = %s", (user_identity['id'],))
    else:
        # Fetch the user's current password
        cursor.execute("SELECT password FROM users WHERE id = %s", (user_identity['id'],))

    user = cursor.fetchone()

    if user and check_password_hash(user['password'], current_password):
        # Current password matches, proceed to update the password
        hashed_new_password = generate_password_hash(new_password)
        
        if user_identity['role'] == 'admin':
            cursor.execute("UPDATE admin SET password = %s WHERE id = %s", (hashed_new_password, user_identity['id']))
        else:
            cursor.execute("UPDATE users SET password = %s WHERE id = %s", (hashed_new_password, user_identity['id']))
        
        db.commit()
        return jsonify({"message": "Password changed successfully."}), 200

    return jsonify({"error": "Current password is incorrect."}), 401


# Change email
@user_bp.route('/change-email', methods=['POST'])
@jwt_required()
def change_email():
    user_identity = get_jwt_identity()
    data = request.json
    current_email = data.get('currentEmail')
    new_email = data.get('newEmail')

    # Ensure that the request contains the necessary fields
    if not current_email or not new_email:
        return jsonify({"error": "Current email and new email must be provided."}), 400

    cursor = db.cursor(dictionary=True)

    try:
        # Determine if user is admin or user
        if user_identity['role'] == 'admin':
            # Check in admins table
            cursor.execute("SELECT email FROM admin WHERE id = %s", (user_identity['id'],))
        else:
            # Check in users table
            cursor.execute("SELECT email FROM users WHERE id = %s", (user_identity['id'],))

        user = cursor.fetchone()

        if user:
            # Verify the current email
            if user['email'] != current_email:
                return jsonify({"error": "Current email is incorrect."}), 401

            # Validate new email format
            if '@goodearthmarkets.com' not in new_email:
                return jsonify({"error": "Please enter a valid GEM email."}), 400

            # Update the user's email
            if user_identity['role'] == 'admin':
                cursor.execute("UPDATE admin SET email = %s WHERE id = %s", (new_email, user_identity['id']))
            else:
                cursor.execute("UPDATE users SET email = %s WHERE id = %s", (new_email, user_identity['id']))

            db.commit()  # Commit the changes
            return jsonify({"message": "Email updated successfully."}), 200

        return jsonify({"error": "User not found."}), 404

    except Exception as e:
        db.rollback()  # Rollback in case of any error
        print("Error during email change:", e)  # Log the error for debugging
        return jsonify({"error": "An error occurred while updating the email."}), 500

    finally:
        cursor.close()  # Always close the cursor