from flask import Flask, jsonify, g, send_from_directory, request
from flask_cors import CORS
from config.db_config import connect_to_db
from routes.ticket_routes import tickets_bp
from routes.user_routes import user_bp
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__, static_folder='build', static_url_path='')

# CORS setup: Allow localhost and the deployed app
CORS(app, supports_credentials=True, origins=[
    "https://ticketsystem-1.onrender.com",
    "http://localhost:3000",
    "http://localhost:5000",
    "http://127.0.0.1:5000"
])

# Configure the JWT secret key
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_KEY')
jwt = JWTManager(app)

# Register blueprints with URL prefixes
app.register_blueprint(tickets_bp, url_prefix="/tickets")
app.register_blueprint(user_bp, url_prefix="/users")

# Manage database connection
def get_db():
    if 'db' not in g:
        g.db = connect_to_db()
        if g.db:
            print("Database connection successful.")
        else:
            print("Failed to connect to the database.")
    return g.db

@app.teardown_appcontext
def close_db(exception):
    db = g.pop('db', None)
    if db is not None:
        db.close()

# Serve static files and the React app
@app.route('/')
def serve():
    return send_from_directory(app.static_folder, '../frontend/public/index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory(app.static_folder, path)

@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, '../frontend/public/index.html')

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
