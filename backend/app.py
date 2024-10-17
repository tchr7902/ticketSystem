from flask import Flask, jsonify, g
from config.db_config import connect_to_db

app = Flask(__name__)

# Function to get the database connection
def get_db():
    if 'db' not in g:  # Check if the db is already in the Flask app context
        g.db = connect_to_db()
    return g.db

@app.route('/api/tickets', methods=['GET'])
def get_tickets():
    db = get_db()  # Get the database connection
    if db is None:
        return jsonify({"error": "Database not connected"}), 500  # Return error if db is not connected
    
    cursor = db.cursor(dictionary=True)
    query = "SELECT * FROM tickets"
    
    try:
        cursor.execute(query)
        tickets = cursor.fetchall()
        print(f"Fetched tickets: {tickets}")  # Log fetched tickets
        return jsonify(tickets)
    except Exception as e:
        print(f"Error fetching tickets: {e}")
        return jsonify({"error": "Unable to fetch tickets"}), 500
    finally:
        cursor.close()  # Correctly close the cursor

@app.teardown_appcontext
def close_db(exception):
    db = g.pop('db', None)
    if db is not None:
        db.close()  # Close the database connection when the app context is torn down

if __name__ == '__main__':
    app.run(debug=True)
