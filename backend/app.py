from flask import Flask, request, jsonify, g, send_from_directory
from flask_cors import CORS
from config.db_config import connect_to_db
from routes.ticket_routes import tickets_bp
from routes.user_routes import user_bp
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
from itsdangerous import URLSafeTimedSerializer
from flask_mail import Mail, Message

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')

# CORS setup: Allow localhost and the deployed app
CORS(app, supports_credentials=True, origins=[
    "https://ticketsystem-1.onrender.com",
    "https://gemtickets.org",
    "http://localhost:3000",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
])

# Configure the JWT secret key
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_KEY')

# Set the Flask app secret key
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# Configure Flask-Mail SMTP settings from environment variables
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', True) 
app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', False)
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', os.getenv('MAIL_USERNAME'))

# Initialize Flask-Mail
mail = Mail(app)

# Initialize JWTManager
jwt = JWTManager(app)

# Initialize URLSafeTimedSerializer with the Flask secret key
s = URLSafeTimedSerializer(app.config['SECRET_KEY'])

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

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
