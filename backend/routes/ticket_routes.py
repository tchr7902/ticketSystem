from flask import Blueprint, request, jsonify, g, redirect, url_for
import requests
from config.db_config import connect_to_db
from flask_jwt_extended import jwt_required, get_jwt_identity
from chat import create_user_space, add_members_to_space, send_message, upload_image_to_gcs, send_google_chat_message, delete_image_from_gcs
import json


tickets_bp = Blueprint('tickets', __name__)

def get_user_name(user_id):
    cursor = get_db().cursor(dictionary=True)
    cursor.execute("SELECT first_name, last_name FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    return f"{user['first_name']} {user['last_name']}" if user else None

def get_user_first_name(user_id):
    cursor = get_db().cursor(dictionary=True)
    cursor.execute("SELECT first_name FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    return f"{user['first_name']}" if user else None

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

def get_user_id(email):
    cursor = get_db().cursor(dictionary=True)
    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    return user['id'] if user else None

def get_user_id_ticket(ticket_id):
    cursor = get_db().cursor(dictionary=True)
    cursor.execute("SELECT user_id FROM tickets WHERE id = %s", (ticket_id,))
    user_id = cursor.fetchone()
    cursor.close()
    return user_id['user_id'] if user_id else None

def get_db():
    if 'db' not in g:
        g.db = connect_to_db()
    return g.db

# Get Tickets (Admin sees all, users see only their own)
@tickets_bp.route('', methods=['GET'])
@jwt_required()
def get_tickets():
    user_identity_str = get_jwt_identity()
    user = json.loads(user_identity_str)
    cursor = get_db().cursor(dictionary=True)

    if user['role'] == 'admin':
        cursor.execute('SELECT * FROM tickets')
    else:
        cursor.execute('SELECT * FROM tickets WHERE user_id = %s', (user['id'],))

    tickets = cursor.fetchall()
    cursor.close()
    return jsonify(tickets), 200


# Create Ticket
@tickets_bp.route('', methods=['POST'])
@jwt_required()
def create_ticket():
    user_identity_str = get_jwt_identity()
    user = json.loads(user_identity_str)  # Deserialize identity
    data = request.json  # JSON payload from the frontend

    status = data.get('status', 'Open')  # Default status to 'Open' if not provided

    # Get user details
    name = get_user_name(user['id'])
    first_name = get_user_first_name(user['id'])
    email = get_user_email(user['id'])
    phone_number = get_user_phone(user['id'])

    # Extract image URL from the request data (uploaded by the frontend)
    image_url = data.get('image_url')

    # Save the ticket to the database
    cursor = get_db().cursor()
    cursor.execute(
        """
        INSERT INTO tickets (title, description, severity, user_id, status, contact_method, name, email, phone_number, image_url)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            data['title'], data['description'], data['severity'], user['id'], status,
            data['contact_method'], name, email, phone_number, image_url
        )
    )
    get_db().commit()
    cursor.close()

    # Prepare message data
    message_data = {
        'title': data['title'],
        'description': data['description'],
        'severity': data['severity'],
        'name': name,
        'contact_method': data['contact_method'],
        'image_url': image_url  # Include the image URL
    }

    # Send message to Google Chat with the image URL
    send_google_chat_message(message_data, image_url)

    # Create Google Chat space for the user and notify them
    space_info = create_user_space(email)

    if space_info:
        space_id = space_info.get('name')

        # Add the ticket owner to the space
        add_members_to_space(space_id, email)

        # Send a chat notification
        message_text = (
            f"🛠️ *Hello {first_name}!*\n\n"
            f"The IT Team has received your ticket '*{data['title']}*' and will start working on it shortly.\n"
        )
        send_message(space_id, message_text)

    return jsonify({"message": "Ticket created successfully!"}), 201


# Update Ticket Route
@tickets_bp.route('/<int:ticket_id>', methods=['PUT'])
@jwt_required()
def update_ticket(ticket_id):
    user_identity_str = get_jwt_identity()
    user = json.loads(user_identity_str)  # Deserialize identity
    data = request.json

    user_id = get_user_id_ticket(ticket_id)
    first_name = get_user_first_name(user_id)

    cursor = get_db().cursor(dictionary=True)
    cursor.execute("SELECT * FROM tickets WHERE id = %s", (ticket_id,))
    ticket = cursor.fetchone()

    if not ticket:
        return jsonify({"error": "Ticket not found."}), 404

    if ticket['user_id'] != user['id'] and user['role'] != 'admin':
        return jsonify({"error": "Unauthorized access."}), 403

    # Get the old description to compare with the new one
    old_description = ticket['description']

    # Update ticket description with new data (including title, description, severity, status)
    cursor.execute(
        "UPDATE tickets SET title = %s, description = %s, severity = %s, contact_method = %s, status = %s WHERE id = %s",
        (data['title'], data['description'], data['severity'], data['contact_method'], data['status'], ticket_id)
    )

    # Prepare message text and check if there's a new update in the description
    notes = ""
    if old_description != data['description']:  # Only if description has changed
        last_update_index = data['description'].rfind("Update:")  # Find the last "Update:"
        if last_update_index != -1:
            notes = f"\n*Update*: {data['description'][last_update_index + len('Update:'):].strip()}"  # Capture after "Update:"

    # Send the message regardless of whether there is a new update
    if user['role'] == 'admin':
        # Create a named space for the ticket notification
        space_info = create_user_space(ticket['email'])

        if space_info:
            space_id = space_info.get('name')

            # Add the ticket owner to the space
            add_members_to_space(space_id, ticket['email'])

            # Send the chat notification, including the new "Update:" if there is one
            message_text = (
                f"📢 *Hello {first_name}!*\n\n"
                f"Your ticket '*{ticket['title']}*' is now *{data['status']}*.\n"
                f"{notes}"
            )
            send_message(space_id, message_text)

    get_db().commit()
    cursor.close()
    return jsonify({"message": "Ticket updated successfully!"}), 200



# Delete Ticket (Only the owner or admin can delete)
@tickets_bp.route('/<int:ticket_id>', methods=['DELETE'])
@jwt_required()
def delete_ticket(ticket_id):
    user_identity_str = get_jwt_identity()
    user = json.loads(user_identity_str)  # Deserialize identity

    cursor = get_db().cursor(dictionary=True)

    cursor.execute("SELECT * FROM tickets WHERE id = %s", (ticket_id,))
    ticket = cursor.fetchone()

    if not ticket:
        return jsonify({"error": "Ticket not found."}), 404

    if ticket['user_id'] != user['id'] and user['role'] != 'admin':
        return jsonify({"error": "Unauthorized access."}), 403
    
    image_url = ticket.get('image_url')
    if image_url:
        delete_image_from_gcs(image_url)

    cursor.execute("DELETE FROM tickets WHERE id = %s", (ticket_id,))
    get_db().commit()
    cursor.close()
    return jsonify({"message": "Ticket deleted successfully."}), 204


# Get User Tickets
@tickets_bp.route('/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_tickets(user_id):
    cursor = get_db().cursor()

    cursor.execute("""
            SELECT status, COUNT(*) as count
            FROM tickets
            WHERE user_id = %s
            GROUP BY status
            """, (user_id,))
    tickets = cursor.fetchall()
    cursor.close()

    results = {status: count for status, count in tickets}
    return jsonify(results), 200


@tickets_bp.route('/search', methods=['GET'])
@jwt_required()
def search_tickets():
    user_identity_str = get_jwt_identity()
    user = json.loads(user_identity_str)  # Deserialize identity
    search_term = request.args.get('keywords', '').strip() 

    if not search_term:
        return jsonify({"error": "Keywords required."}), 400

    try:
        cursor = get_db().cursor(dictionary=True)

        if user['role'] == 'admin':
            cursor.execute(
                """
                SELECT * FROM tickets 
                WHERE 
                    id LIKE %s OR 
                    title LIKE %s OR 
                    description LIKE %s OR 
                    created_at LIKE %s OR 
                    severity LIKE %s OR 
                    status LIKE %s OR 
                    contact_method LIKE %s OR 
                    name LIKE %s OR 
                    email LIKE %s
                """, 
                (
                    '%' + search_term + '%',  # for id
                    '%' + search_term + '%',  # for title
                    '%' + search_term + '%',  # for description
                    '%' + search_term + '%',  # for created_at
                    '%' + search_term + '%',  # for severity
                    '%' + search_term + '%',  # for status
                    '%' + search_term + '%',  # for contact_method
                    '%' + search_term + '%',  # for name
                    '%' + search_term + '%',  # for email
                )
            )
        else:
            cursor.execute(
                """
                SELECT * FROM tickets 
                WHERE 
                    user_id = %s AND (
                    id LIKE %s OR 
                    title LIKE %s OR 
                    description LIKE %s OR 
                    created_at LIKE %s OR 
                    severity LIKE %s OR 
                    status LIKE %s OR 
                    contact_method LIKE %s OR 
                    name LIKE %s OR 
                    email LIKE %s
                )
                """, 
                (
                    user['id'],
                    '%' + search_term + '%',  # for id
                    '%' + search_term + '%',  # for title
                    '%' + search_term + '%',  # for description
                    '%' + search_term + '%',  # for created_at
                    '%' + search_term + '%',  # for severity
                    '%' + search_term + '%',  # for status
                    '%' + search_term + '%',  # for contact_method
                    '%' + search_term + '%',  # for name
                    '%' + search_term + '%',  # for email
                )
            )

        tickets = cursor.fetchall() 
        return jsonify(tickets), 200 
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()


# Archive Ticket
@tickets_bp.route('/<int:ticket_id>/archive', methods=['POST'])
@jwt_required()
def archive_ticket(ticket_id):
    data = request.get_json()
    notes = data.get('archiveNotes', '')
    time_spent = data.get('timeSpent', '')
    parts_needed = data.get('partsNeeded', '')

    cursor = get_db().cursor()

    try:
        cursor.execute("""
            INSERT INTO archived_tickets 
            (original_ticket_id, user_id, title, description, created_at, severity, status, notes, contact_method, name, time_spent, parts_needed)
            SELECT id, user_id, title, description, created_at, severity, status, %s, contact_method, name, %s, %s
            FROM tickets
            WHERE id = %s
        """, (notes, time_spent, parts_needed, ticket_id))


        if cursor.rowcount == 0:
            raise Exception("Ticket transfer failed. No ticket with this ID found.")

        get_db().commit()

        delete_ticket(ticket_id)

    except Exception as e:
        get_db().rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()

    return jsonify({"message": "Ticket archived successfully."}), 200



# Get Archived Tickets
@tickets_bp.route('/users/<int:user_id>/archived', methods=['GET'])
@jwt_required()
def get_archived_tickets(user_id):
    user_identity_str = get_jwt_identity()
    user = json.loads(user_identity_str)  # Deserialize identity
    cursor = get_db().cursor()
    if user['role'] == 'admin':
        cursor.execute('SELECT * FROM archived_tickets')
    else:
        cursor.execute('SELECT * FROM archived_tickets WHERE user_id = %s', (user_id,))
    tickets = cursor.fetchall()
    cursor.close()

    return jsonify(tickets), 200

# Delete Ticket (Only the owner or admin can delete)
@tickets_bp.route('/archived/<int:archived_ticket_id>', methods=['DELETE'])
@jwt_required()
def delete_archived_ticket(archived_ticket_id):
    user_identity_str = get_jwt_identity()
    user = json.loads(user_identity_str)  # Deserialize identity

    cursor = get_db().cursor(dictionary=True)

    cursor.execute("SELECT * FROM archived_tickets WHERE id = %s", (archived_ticket_id,))
    ticket = cursor.fetchone()

    if not ticket:
        return jsonify({"error": "Archived ticket not found."}), 404

    if ticket['user_id'] != user['id'] and user['role'] != 'admin':
        return jsonify({"error": "Unauthorized access."}), 403

    cursor.execute("DELETE FROM archived_tickets WHERE id = %s", (archived_ticket_id,))
    get_db().commit()
    cursor.close()
    return jsonify({"message": "Archived ticket deleted successfully."}), 204


# Chat API
@tickets_bp.route('/api/google-chat', methods=['POST'])
def handle_chat_event():
    data = request.get_json()
    return jsonify({"text": "Message received!"})


@tickets_bp.route('/chat_ticket', methods=['POST'])
def submit_chat_ticket():
    data = request.get_json()
    
    # Check if this is a valid event for ticket submission (sent from the Cloud Function)
    if data:
        # Extract ticket data from the request
        ticket_title = data.get('title')
        ticket_description = data.get('description')
        ticket_severity = data.get('severity')
        ticket_email = data.get('email')

        # Validate that necessary fields are present
        if not ticket_title or not ticket_description or not ticket_severity or not ticket_email:
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Example: Extract additional user details (you can modify this as needed)
        user_id = get_user_id(ticket_email)
        name = get_user_name(user_id)
        phone_number = get_user_phone(user_id)
        first_name = get_user_first_name(user_id)
        ticket_status = 'Open'
        severity = ticket_severity.capitalize()

        # Insert the ticket into the database
        cursor = get_db().cursor()
        cursor.execute(
            """
            INSERT INTO tickets (title, description, severity, user_id, status, contact_method, name, email, phone_number)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (ticket_title, ticket_description, ticket_severity, user_id, ticket_status, ticket_email, name, ticket_email, phone_number)
        )
        get_db().commit()
        cursor.close()

        message_data = {
        'title': ticket_title,
        'description': ticket_description,
        'severity': severity,
        'name': name,
        'contact_method': ticket_email
        }

        send_google_chat_message(message_data)

        space_info = create_user_space(ticket_email)
        if space_info:
            space_id = space_info.get('name')
            add_members_to_space(space_id, ticket_email)
            message_text = (
            f"🛠️ *Hello {first_name}!*\n\n"
            f"The IT Team has received your ticket '*{data['title']}*' and will start working on it shortly.\n"
        )
            send_message(space_id, message_text)

        return jsonify({'text': 'Your ticket has been successfully submitted!'}), 200
    else:
        return jsonify({'text': 'Invalid event data'}), 400


# Flask route for file upload
@tickets_bp.route('/upload-image', methods=['POST'])
@jwt_required()
def upload_image():
    file = request.files['image']  # Assumes the file is uploaded as 'image'

    if file:
        # Upload image and get signed URL
        signed_url = upload_image_to_gcs(file)

        return jsonify({'image_url': signed_url}), 200
    else:
        return jsonify({'error': 'No image uploaded'}), 400