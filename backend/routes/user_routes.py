from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from config.db_config import connect_to_db
import logging
from flask_mail import Message
from urllib.parse import quote

user_bp = Blueprint('user_bp', __name__)
db = connect_to_db()

def validate_password(password):
    if len(password) < 8:
        return "Password must be at least 8 characters long."
    if not any(char.isupper() for char in password):
        return "Password must contain at least one uppercase letter."
    if not any(char in "!@#$%^&*" for char in password):
        return "Password must contain at least one special character."
    return None

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

    password_error = validate_password(password)
    if password_error:
        return jsonify({"error": password_error}), 400

    # Ensure all required fields are present
    if not all([email, password, first_name, last_name, store_id, phone_number]):
        return jsonify({"error": "All fields are required"}), 400

    # Ensure email is a valid Good Earth Markets address
    if not email.endswith("@goodearthmarkets.com"):
        return jsonify({"error": "Invalid email domain"}), 400

    db = connect_to_db()
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
        db.close()

# Register a new admin (only accessible to existing admins)
@user_bp.route('/admin/register', methods=['POST'])
@jwt_required()
def register_admin():
    # Get the JWT identity to verify the role
    identity = get_jwt_identity()
    
    if identity['role'] != 'admin':
        return jsonify({"error": "Unauthorized. Only admins can register new admins."}), 403

    data = request.json
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    store_id = data.get('store_id')

    password_error = validate_password(password)
    if password_error:
        return jsonify({"error": password_error}), 400

    # Ensure all required fields are provided
    if not all([email, password, first_name, last_name, store_id]):
        return jsonify({"error": "All fields are required"}), 400

    # Ensure email is a valid Good Earth Markets address
    if not email.endswith("@goodearthmarkets.com"):
        return jsonify({"error": "Invalid email domain"}), 400

    db = connect_to_db()
    cursor = db.cursor()
    try:
        # Check if the admin email already exists
        cursor.execute("SELECT * FROM admin WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"error": "Admin account already exists with this email."}), 400

        # Hash the password and insert the new admin
        hashed_password = generate_password_hash(password)
        cursor.execute(
            "INSERT INTO admin (email, password, first_name, last_name, store_id) VALUES (%s, %s, %s, %s, %s)", 
            (email, hashed_password, first_name, last_name, store_id)
        )
        db.commit()
        return jsonify({"message": "Admin registered successfully"}), 201

    except Exception as e:
        logging.error(f"Database error: {e}")
        return jsonify({"error": "Internal server error"}), 500

    finally:
        cursor.close()


# Login route for users and admins
@user_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    db = connect_to_db()
    cursor = db.cursor(dictionary=True)

    try:
        # Check if the email exists in either the users or admin table
        cursor.execute("""
            SELECT id, email, password, 'user' AS role FROM users WHERE email = %s
            UNION ALL
            SELECT id, email, password, 'admin' AS role FROM admin WHERE email = %s
        """, (email, email))
        
        account = cursor.fetchone()

        # If no account found
        if not account:
            return jsonify({"error": "No user registered with that email."}), 404

        # Check if the password is correct
        if not check_password_hash(account['password'], password):
            return jsonify({"error": "Password is incorrect."}), 401

        # If both email and password are correct
        access_token = create_access_token(identity={"id": account['id'], "role": account['role']})
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': account['id'],
                'email': account['email'],
                'role': account['role'],
            }
        }), 200

    except Exception as e:
        logging.error(f"Login error: {e}")
        return jsonify({"error": "Internal server error"}), 500

    finally:
        cursor.close()


@user_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_identity = get_jwt_identity()  # Get user identity and role from the token
    db = connect_to_db()
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

    db = connect_to_db()
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

    db = connect_to_db()
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
            
            # Check for existing email
            cursor.execute("SELECT * FROM users WHERE email = %s", (new_email,))
            if cursor.fetchone():
                return jsonify({"error": "Account already registered with this email."}), 400

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

# Forgot Pass
@user_bp.route('/forgot_password', methods=['POST'])
def forgot_password():
    from app import mail, s
    email = request.json.get('email')
    db = connect_to_db()
    cursor = db.cursor(dictionary=True)
    
    if not email:
        return jsonify({"message": "Email is required"}), 400
    
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    account = cursor.fetchone()

    if not account:
        return jsonify({"error": "No user registered with that email."}), 404

    token = s.dumps(email, salt='password-reset')

    encoded_token = quote(token)

    reset_url = f"https://gemtickets.org/users/reset_password/{encoded_token}"

    try:
        msg = Message("Password Reset Request", recipients=[email])
        msg.body = f"To reset your password, please click the link below:\n{reset_url}"
        mail.send(msg)
        return jsonify({"message": "Password reset email sent! Follow the link in your email to reset your password."}), 200
    except Exception as e:
        return jsonify({"message": f"Error sending email: {str(e)}"}), 500

# Reset Pass
@user_bp.route('/reset_password/<token>', methods=['POST'])
def reset_password(token):
    from app import s
    try:
        email = s.loads(token, salt='password-reset', max_age=3600)

        new_password = request.json.get('new_password')
        if not new_password:
            return jsonify({"message": "New password is required."}), 400
        
        hashed_password = generate_password_hash(new_password)

        db = connect_to_db()
        cursor = db.cursor(dictionary=True)

        cursor.execute("UPDATE users SET password = %s WHERE email = %s", (hashed_password, email))
        db.commit()

        return jsonify({"message": "Password succesfully reset."}), 200
    
    except Exception as e:
        print(f"Error in resetting password: {e}")
        return jsonify({"message": "The reset link is invalid or has expired."}), 400