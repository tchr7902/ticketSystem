import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv('../../.env')

dbHost = os.getenv('DB_HOST')
dbUser = os.getenv('DB_USER')
dbPass = os.getenv('DB_PASS')
dbName = os.getenv('DB_NAME')

def connect_to_db():
    try:
        connection = mysql.connector.connect(
            host=dbHost,
            user=dbUser,
            password=dbPass,
            database=dbName
        )
        print(f"Connecting to {dbHost} with user {dbUser}")
        if connection.is_connected():
            print("Connected to the database successfully")
            return connection
    except Error as err:
        print(f"Database connection error: {err}")
        return None