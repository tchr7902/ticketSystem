from flask import Flask, jsonify, g
from config.db_config import connect_to_db
from routes.ticket_routes import tickets_bp

app = Flask(__name__)

# CRUD Blueprints
app.register_blueprint(tickets_bp)


# DB Connection
def get_db():
    if 'db' not in g: 
        g.db = connect_to_db()
    return g.db

@app.teardown_appcontext
def close_db(exception):
    db = g.pop('db', None)
    if db is not None:
        db.close() 

if __name__ == '__main__':
    app.run(debug=True)
