from flask import Blueprint, request, jsonify, g, Response
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from chat import create_user_space, add_members_to_space, send_message, send_google_chat_message, send_feedback_message
from werkzeug.security import generate_password_hash, check_password_hash
from config.db_config import connect_to_db
import logging
from flask_mail import Message
from urllib.parse import quote
import json
from config.db_config import connect_to_db
from datetime import timedelta


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

def get_user_name(user_id):
    cursor = get_db().cursor(dictionary=True)
    cursor.execute("SELECT first_name, last_name FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    return f"{user['first_name']} {user['last_name']}" if user else None

def get_user_email(user_id):
    cursor = get_db().cursor(dictionary=True)
    cursor.execute("SELECT email FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    return user['email'] if user else None

def get_user_phone(user_id):
    cursor = get_db().cursor(dictionary=True)
    cursor.execute("SELECT phone_number FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    return user['phone_number'] if user else None

def get_db():
    if 'db' not in g:
        g.db = connect_to_db()
    return g.db

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
        print('attempting to see if theres other users')
        cursor.execute("""
            SELECT email FROM admin WHERE email = %s
            UNION
            SELECT email FROM users WHERE email = %s
        """, (email, email))
        print('query worked')
        if cursor.fetchone():
            return jsonify({"error": "Account already registered with this email."}), 400

        hashed_password = generate_password_hash(password)
        cursor.execute("INSERT INTO users (email, password, store_id, first_name, last_name, phone_number) VALUES (%s, %s, %s, %s, %s, %s)", 
                       (email, hashed_password, store_id, first_name, last_name, phone_number))
        db.commit()

        space_info = create_user_space(email)

        if space_info:
            space_id = space_info.get('name')

            # Add the ticket owner to the space
            add_members_to_space(space_id, email)

            # Send the chat notification
            message_text = (
                f"🎉 *Hello {first_name}!*\n\n"
                f"Thank you for registering with our IT Support Hub!\n\n"
                f"You can create, view, update, and delete tickets anytime by visiting *gemtickets.org*.\nTo submit your tickets via Chats, please start a New Chat with *'Ticket System'*.\n\n"
                f"Once we receive your ticket, we will get to it as soon as possible. You'll receive updates on your tickets right here in this chat.\n\n"
                f"If you have any questions or need further assistance, feel free to reach out to the IT team directly.\n\n"
                f"Thank you!"
            )
            send_message(space_id, message_text)

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
    user_identity_str = get_jwt_identity()
    user_identity = json.loads(user_identity_str)
    
    if user_identity['role'] != 'admin':
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

        expiration_time = timedelta(hours=3)

        # If both email and password are correct
        identity = json.dumps({'id': account['id'], 'role': account['role']})
        access_token = create_access_token(identity=identity, expires_delta=expiration_time)
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
    try:
        # Extract JWT identity
        user_identity_str = get_jwt_identity()
        user_identity = json.loads(user_identity_str)

        db = connect_to_db()
        cursor = db.cursor(dictionary=True)

        if user_identity['role'] == 'admin':
            cursor.execute(
                "SELECT id, first_name, last_name, store_id, email, phone_number FROM admin WHERE id = %s", 
                (user_identity['id'],)
            )
            admin = cursor.fetchone()

            if admin:
                return jsonify({
                    'id': admin['id'],
                    'first_name': admin['first_name'],
                    'last_name': admin['last_name'],
                    'email': admin['email'],
                    'store_id': admin['store_id'],
                    'phone_number': admin['phone_number'],
                    'role': 'admin'
                }), 200
        else:
            cursor.execute(
                "SELECT id, first_name, last_name, email, store_id, phone_number FROM users WHERE id = %s", 
                (user_identity['id'],)
            )
            user = cursor.fetchone()

            if user:
                return jsonify({
                    'id': user['id'],
                    'first_name': user['first_name'],
                    'last_name': user['last_name'],
                    'email': user['email'],
                    'phone_number': user['phone_number'],
                    'store_id': user['store_id'],
                    'role': 'user'
                }), 200

        return jsonify({"error": "User not found"}), 404

    except Exception as e:
        logging.error(f"Error in /me route: {e}")
        return jsonify({"error": "Internal server error"}), 500

    finally:
        cursor.close()



@user_bp.route('/search_users', methods=['GET'])
@jwt_required()
def get_users():
    user_identity_str = get_jwt_identity()
    user = json.loads(user_identity_str)
    search_term = request.args.get('keywords', '').strip() 

    if not search_term:
        return jsonify({"error": "Keywords required."}), 400

    try:
        cursor = get_db().cursor(dictionary=True)

        # If user is an admin, allow searching across all fields
        if user['role'] == 'admin':
            cursor.execute(
                """
                SELECT * FROM users 
                WHERE 
                    id LIKE %s OR 
                    email LIKE %s OR 
                    store_id LIKE %s OR 
                    first_name LIKE %s OR 
                    last_name LIKE %s OR 
                    phone_number LIKE %s
                """, 
                (
                    '%' + search_term + '%',  # for id
                    '%' + search_term + '%',  # for email
                    '%' + search_term + '%',  # for store_id
                    '%' + search_term + '%',  # for first_name
                    '%' + search_term + '%',  # for last_name
                    '%' + search_term + '%',  # for phone_number
                )
            )
        else:
            # If user is not an admin, limit search to their own records
            cursor.execute(
                """
                SELECT * FROM users 
                WHERE 
                    id = %s AND (
                        id LIKE %s OR 
                        email LIKE %s OR 
                        first_name LIKE %s OR 
                        last_name LIKE %s OR 
                        phone_number LIKE %s
                    )
                """, 
                (
                    user['id'],  
                    '%' + search_term + '%',  # for id
                    '%' + search_term + '%',  # for email
                    '%' + search_term + '%',  # for first_name
                    '%' + search_term + '%',  # for last_name
                    '%' + search_term + '%',  # for phone_number
                )
            )

        users = cursor.fetchall()  # Fetch the result

        return jsonify(users), 200  # Return users as JSON
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()


# Delete User (Only the admin can delete)
@user_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_ticket(user_id):
    user_identity_str = get_jwt_identity()
    user = json.loads(user_identity_str)  # Deserialize identity

    cursor = get_db().cursor(dictionary=True)

    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()

    if not user:
        return jsonify({"error": "User not found."}), 404

    cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
    get_db().commit()
    cursor.close()
    return jsonify({"message": "User deleted successfully."}), 204

# Change password
@user_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    user_identity_str = get_jwt_identity()
    user_identity = json.loads(user_identity_str)  # Deserialize identity
    data = request.json
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')

    db = connect_to_db()
    cursor = db.cursor(dictionary=True)

    if user_identity['role'] == 'admin':
        cursor.execute("SELECT password FROM admin WHERE id = %s", (user_identity['id'],))
    else:
        cursor.execute("SELECT password FROM users WHERE id = %s", (user_identity['id'],))

    user = cursor.fetchone()

    if user and check_password_hash(user['password'], current_password):
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
    user_identity_str = get_jwt_identity()
    user_identity = json.loads(user_identity_str)
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
            cursor.execute("""
                SELECT * FROM admin WHERE email = %s
                UNION
                SELECT * FROM users WHERE email = %s
            """, (new_email, new_email))
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

    cursor.execute("SELECT first_name FROM users WHERE email = %s", (email,))
    result = cursor.fetchone()

    name = result['first_name']
    
    if not email:
        return jsonify({"message": "Email is required"}), 400
    
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    account = cursor.fetchone()

    if not account:
        return jsonify({"error": "No user registered with that email."}), 404

    preToken = s.dumps(email, salt='password-reset')

    resetToken = quote(preToken)

    reset_url = f"https://gemtickets.org/reset_password/{resetToken}"

    try:
        msg = Message("Password Reset Request", recipients=[email])
        msg.body = (
            f"Hello {name},\n\n"
            "We have received a request to reset your password. To securely reset your password, please use the link below:\n"
            f"{reset_url}\n\n"
            "If you did not request a password reset, please disregard this email, and your current password will remain unchanged.\n\n"
            "Thanks,\n"
            "GEM IT Team"
        )
        mail.send(msg)
        return jsonify({"message": "Password reset email sent! Follow the link in your email to reset your password."}), 200
    except Exception as e:
        print({str(e)})
        return jsonify({"message": f"Error sending email: {str(e)}"}), 500

# Reset Pass
@user_bp.route('/reset_password/<resetToken>', methods=['POST'])
def reset_password(resetToken):
    from app import s
    try:
        # Use resetToken instead of token
        email = s.loads(resetToken, salt='password-reset', max_age=3600)

        new_password = request.json.get('new_password')
        if not new_password:
            return jsonify({"message": "New password is required."}), 400
        
        hashed_password = generate_password_hash(new_password)

        db = connect_to_db()
        cursor = db.cursor(dictionary=True)

        cursor.execute("UPDATE users SET password = %s WHERE email = %s", (hashed_password, email))
        db.commit()

        response = jsonify({"message": "Password successfully reset."})
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, proxy-revalidate"
        return response
    
    except Exception as e:
        return jsonify({"message": "The reset link is invalid or has expired."}), 400


@user_bp.route('/feedback', methods=['POST'])
@jwt_required()
def submit_feedback():
    try:
        # Get user information
        user_identity_str = get_jwt_identity()
        user = json.loads(user_identity_str)
        name = get_user_name(user.get('id'))
        phone_number = get_user_phone(user.get('id'))
        email = get_user_email(user.get('id'))

        # Parse and validate request data
        data = request.json
        feedback = data.get('feedback')  # Safely get feedback
        if not feedback:
            return jsonify({"error": "Feedback content is required"}), 400

        # Prepare feedback message data
        feedback_data = {
            "name": name,
            "feedback": feedback,
            "contact_method": f"{phone_number}, {email}"
        }

        # Send feedback to Google Chat
        send_feedback_message(feedback_data)

        return jsonify({"message": "Feedback submitted successfully!"}), 201

    except Exception as e:
        # Handle unexpected errors
        import traceback
        traceback.print_exc()
        return jsonify({"error": "An error occurred while submitting feedback"}), 500


@user_bp.route('/message-users', methods=['POST'])
def send_message_to_all():
    data = request.json
    message_text = data.get('message') 

    if not message_text:
        return jsonify({"error": "Message text is required"}), 400

    db = connect_to_db()
    cursor = db.cursor()
    try:
        # Query all registered users' emails
        cursor.execute("SELECT email FROM users")
        user_emails = cursor.fetchall()

        for (email,) in user_emails:  # Unpack tuple from query
            try:
                # Find or create the user's Google Chat space
                space_info = create_user_space(email)
                space_id = space_info.get('name')
                add_members_to_space(space_id, email)
                # Send the admin's message to the user's Chat space
                send_message(space_id, message_text)

            except Exception as e:
                continue  # Skip to the next user in case of an error

        return jsonify({"message": "Messages sent to all users"}), 200

    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500
    finally:
        cursor.close()
        db.close()


# Update User
@user_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_ticket(user_id):
    user_identity_str = get_jwt_identity()
    user_identity = json.loads(user_identity_str) 
    data = request.json

    # Validate input data
    required_fields = ['first_name', 'last_name', 'phone_number', 'store_id']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields."}), 400
    
    phone_number = data['phone_number']

    db = get_db()
    cursor = db.cursor(dictionary=True)

    # Update user data
    try:
        if user_identity['role'] != 'admin':  # Regular user update
            cursor.execute(
                """
                UPDATE users
                SET first_name = %s, last_name = %s, phone_number = %s, store_id = %s
                WHERE id = %s
                """,
                (data['first_name'], data['last_name'], phone_number, data['store_id'], user_id)
            )
            db.commit()

        else:  # Admin user update
            cursor.execute(
                """
                UPDATE admin
                SET first_name = %s, last_name = %s, phone_number = %s, store_id = %s
                WHERE id = %s
                """,
                (data['first_name'], data['last_name'], phone_number, data['store_id'], user_id)
            )
            db.commit()

    except Exception as e:
        db.rollback()
        return jsonify({"error": f"Failed to update user: {str(e)}"}), 500
    finally:
        cursor.close()

    return jsonify({"message": "User info updated successfully!"}), 200

