from flask import Flask, jsonify, request
import mysql.connector
from dotenv import load_dotenv
import os

app = Flask(__name__)

load_dotenv('../.env')

dbHost = os.getenv('DB_HOST')
dbUser = os.getenv('DB_USER')
dbPass = os.getenv('DB_PASS')
dbName = os.getenv('DB_NAME')

def get_db_connection():
    return mysql.connector.connect(
            host=dbHost,
            user=dbUser,
            password=dbPass,
            database=dbName
        )

@app.route('/tickets', methods=['GET'])
def get_tickets():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM tickets')
    tickets = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(tickets)

if __name__ == '__main__':
    app.run(debug=True)