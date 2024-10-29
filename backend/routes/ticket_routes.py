from flask import Blueprint, request, jsonify, g
from config.db_config import connect_to_db
from flask_jwt_extended import jwt_required, get_jwt_identity
from chat import send_google_chat_message

tickets_bp = Blueprint('tickets', __name__)

def get_user_name(user_id):
    cursor = get_db().cursor(dictionary=True)
    cursor.execute("SELECT first_name, last_name FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    return f"{user['first_name']} {user['last_name']}" if user else None

def get_db():
    if 'db' not in g:
        g.db = connect_to_db()
    return g.db

# Get Tickets (Admin sees all, users see only their own)
@tickets_bp.route('', methods=['GET'])
@jwt_required()
def get_tickets():
    user = get_jwt_identity()
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
    user = get_jwt_identity()
    data = request.json

    status = data.get('status') if data.get('status') else 'Open'

    name = get_user_name(user['id'])

    cursor = get_db().cursor()
    cursor.execute(
        "INSERT INTO tickets (title, description, severity, user_id, status, contact_method, name) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (data['title'], data['description'], data['severity'], user['id'], status, data['contact_method'], name)
    )
    get_db().commit()
    cursor.close()

    message_data = {
        'title': data['title'],
        'description': data['description'],
        'severity': data['severity'],
        'name': name,  # Include the user's name
        'contact_method': data['contact_method']
    }

    send_google_chat_message(message_data)

    return jsonify({"message": "Ticket created successfully!"}), 201

# Update Ticket (Only the owner or admin can update)
@tickets_bp.route('/<int:ticket_id>', methods=['PUT'])
@jwt_required()
def update_ticket(ticket_id):
    user = get_jwt_identity()
    data = request.json

    cursor = get_db().cursor(dictionary=True)

    cursor.execute("SELECT * FROM tickets WHERE id = %s", (ticket_id,))
    ticket = cursor.fetchone()

    if not ticket:
        return jsonify({"error": "Ticket not found."}), 404

    if ticket['user_id'] != user['id'] and user['role'] != 'admin':
        return jsonify({"error": "Unauthorized access."}), 403

    cursor.execute(
        "UPDATE tickets SET title = %s, description = %s, severity = %s, status = %s WHERE id = %s",
        (data['title'], data['description'], data['severity'], data['status'], ticket_id)
    )
    get_db().commit()
    cursor.close()
    return jsonify({"message": "Ticket updated successfully!"}), 200

# Delete Ticket (Only the owner or admin can delete)
@tickets_bp.route('/<int:ticket_id>', methods=['DELETE'])
@jwt_required()
def delete_ticket(ticket_id):
    user = get_jwt_identity()

    cursor = get_db().cursor(dictionary=True)

    cursor.execute("SELECT * FROM tickets WHERE id = %s", (ticket_id,))
    ticket = cursor.fetchone()

    if not ticket:
        return jsonify({"error": "Ticket not found."}), 404

    if ticket['user_id'] != user['id'] and user['role'] != 'admin':
        return jsonify({"error": "Unauthorized access."}), 403

    cursor.execute("DELETE FROM tickets WHERE id = %s", (ticket_id,))
    get_db().commit()
    cursor.close()
    return jsonify({"message": "Ticket deleted successfully."}), 204


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


@tickets_bp.route('/<int:ticket_id>/archive', methods=['POST'])
@jwt_required()
def archive_ticket(ticket_id):
    data = request.get_json()
    notes = data.get('notes', '')

    cursor = get_db().cursor()

    try:
        cursor.execute("""
            INSERT INTO archived_tickets 
            (original_ticket_id, user_id, title, description, created_at, severity, status, notes, contact_method, name)
            SELECT id, user_id, title, description, created_at, severity, status, %s, contact_method, name
            FROM tickets
            WHERE id = %s
        """, (notes, ticket_id))

        if cursor.rowcount == 0:
            raise Exception("Ticket transfer failed. No ticket with this ID found.")

        get_db().commit()

        cursor.execute("DELETE FROM tickets WHERE id = %s", (ticket_id,))

        get_db().commit()

    except Exception as e:
        get_db().rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()

    return jsonify({"message": "Ticket archived successfully."}), 200




@tickets_bp.route('/users/<int:user_id>/archived', methods=['GET'])
@jwt_required()
def get_archived_tickets(user_id):
    user = get_jwt_identity()
    cursor = get_db().cursor()
    if user['role'] == 'admin':
        cursor.execute('SELECT * FROM archived_tickets')
    else:
        cursor.execute('SELECT * FROM archived_tickets WHERE user_id = %s', (user_id,))
    tickets = cursor.fetchall()
    cursor.close()

    return jsonify(tickets), 200