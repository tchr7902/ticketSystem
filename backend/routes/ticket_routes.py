from flask import Blueprint, request, jsonify
from config.db_config import connect_to_db
from flask_jwt_extended import jwt_required, get_jwt_identity

tickets_bp = Blueprint('tickets', __name__)
db = connect_to_db()

# Get Tickets (Admin sees all, users see only their own)
@tickets_bp.route('/tickets', methods=['GET'])
@jwt_required()
def get_tickets():
    user = get_jwt_identity()
    cursor = db.cursor(dictionary=True)

    if user['role'] == 'admin':
        cursor.execute('SELECT * FROM tickets')
    else:
        cursor.execute('SELECT * FROM tickets WHERE user_id = %s', (user['id'],))

    tickets = cursor.fetchall()
    return jsonify(tickets), 200

# Create Ticket
@tickets_bp.route('/tickets', methods=['POST'])
@jwt_required()
def create_ticket():
    user = get_jwt_identity()
    data = request.json

    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO tickets (title, description, status, user_id) VALUES (%s, %s, %s, %s)",
        (data['title'], data['description'], 'open', user['id'])
    )
    db.commit()
    return jsonify({"message": "Ticket created successfully!"}), 201

# Update Ticket (Only the owner or admin can update)
@tickets_bp.route('/tickets/<int:ticket_id>', methods=['PUT'])
@jwt_required()
def update_ticket(ticket_id):
    user = get_jwt_identity()
    data = request.json

    cursor = db.cursor()

    # Check if the ticket exists and belongs to the user (or is accessible by admin)
    cursor.execute("SELECT * FROM tickets WHERE id = %s", (ticket_id,))
    ticket = cursor.fetchone()

    if not ticket:
        return jsonify({"error": "Ticket not found."}), 404

    if ticket['user_id'] != user['id'] and user['role'] != 'admin':
        return jsonify({"error": "Unauthorized access."}), 403

    # Perform the update
    cursor.execute(
        "UPDATE tickets SET title = %s, description = %s, status = %s WHERE id = %s",
        (data['title'], data['description'], data['status'], ticket_id)
    )
    db.commit()
    return jsonify({"message": "Ticket updated successfully!"}), 200

# Delete Ticket (Only the owner or admin can delete)
@tickets_bp.route('/tickets/<int:ticket_id>', methods=['DELETE'])
@jwt_required()
def delete_ticket(ticket_id):
    user = get_jwt_identity()
    cursor = db.cursor()

    # Check if the ticket exists and belongs to the user (or is accessible by admin)
    cursor.execute("SELECT * FROM tickets WHERE id = %s", (ticket_id,))
    ticket = cursor.fetchone()

    if not ticket:
        return jsonify({"error": "Ticket not found."}), 404

    if ticket['user_id'] != user['id'] and user['role'] != 'admin':
        return jsonify({"error": "Unauthorized access."}), 403

    # Perform the deletion
    cursor.execute("DELETE FROM tickets WHERE id = %s", (ticket_id,))
    db.commit()
    return jsonify({"message": "Ticket deleted successfully."}), 204