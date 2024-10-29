from flask import Flask, jsonify, g
from flask_cors import CORS
from config.db_config import connect_to_db
from routes.ticket_routes import tickets_bp
from routes.user_routes import user_bp
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Get JWT key from environment variables
jwt_key = os.getenv('JWT_KEY')

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for the app with specific origins
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# Configure the JWT secret key before initializing JWTManager
app.config['JWT_SECRET_KEY'] = jwt_key
jwt = JWTManager(app)

# Register blueprints with URL prefixes
app.register_blueprint(tickets_bp, url_prefix="/tickets")
app.register_blueprint(user_bp, url_prefix="/users")

# Database connection management
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

if __name__ == '__main__':
    app.run(debug=True)
