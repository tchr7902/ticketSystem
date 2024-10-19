from flask import Blueprint, request, jsonify
from config.db_config import connect_to_db

tickets_bp = Blueprint('tickets', __name__)


# Create ticket
@tickets_bp.route('/api/tickets', methods=['POST'])

def create_ticket():
    data = request.json
    title = data.get('title')
    description = data.get('description')
    status = data.get('status', 'open')

    connection = connect_to_db()
    cursor = connection.cursor()

    query = "INSERT INTO tickets (title, description, status) VALUES (%s, %s, %s)"
    cursor.execute(query, (title, description, status))
    connection.commit()

    ticket_id = cursor.lastrowid
    cursor.close()
    connection.close()

    return jsonify({'id': ticket_id, 'title': title, 'description': description, 'status': status}), 201

# Get tickets
@tickets_bp.route('/api/tickets', methods=['GET'])
def get_tickets():
    connection = connect_to_db()
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM tickets")
    tickets = cursor.fetchall()

    ticket_list = []
    for ticket in tickets:
        ticket_list.append({
            'id': ticket[0],
            'title': ticket[1],
            'description': ticket[2],
            'status': ticket[3],
            'created_at': ticket[4]
        })

    cursor.close()
    connection.close()

    return jsonify(ticket_list)

# Update ticket
@tickets_bp.route('/api/tickets/<int:ticket_id>', methods=['PUT'])
def update_ticket(ticket_id):
    data = request.json
    title = data.get('title')
    description = data.get('description')
    status = data.get('status')

    connection = connect_to_db()
    cursor = connection.cursor()

    query = "UPDATE tickets SET title = %s, description = %s, status = %s WHERE id = %s"
    cursor.execute(query, (title, description, status, ticket_id))
    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({'id': ticket_id, 'title': title, 'description': description, 'status': status}), 200

# Delete ticket
@tickets_bp.route('/api/tickets/<int:ticket_id>', methods=['DELETE'])
def delete_ticket(ticket_id):
    connection = connect_to_db()
    cursor = connection.cursor()

    query = "DELETE FROM tickets WHERE id = %s"
    cursor.execute(query, (ticket_id,))
    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({'message': 'Ticket deleted successfully.'}), 204