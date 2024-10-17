import mysql.connector
from dotenv import load_dotenv
import os

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
        if connection.is_connected():
            print("Connected to the database successfully")
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        if connection.is_connected():
            connection.close()
            print("Connection closed to database.")


connect_to_db()