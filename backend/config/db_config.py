import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv('../../.env')

def connect_to_db():
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASS'),
            database=os.getenv('DB_NAME')
        )
        if connection.is_connected():
            print("Connected to the database successfully")
            return connection
    except Error as err:
        print(f"Database connection error: {err}")
        return None
