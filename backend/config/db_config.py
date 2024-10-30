import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import os
import base64
import tempfile

# Load environment variables
load_dotenv('../../.env')

def connect_to_db():
    cert_file_path = None 
    try:
        ssl_ca_content = os.getenv('SSL_CERT')
        if ssl_ca_content:
            ssl_ca_content = base64.b64decode(ssl_ca_content)

            with tempfile.NamedTemporaryFile(delete=False, suffix='.crt') as cert_file:
                cert_file.write(ssl_ca_content)
                cert_file_path = cert_file.name


        if cert_file_path is None:
            raise ValueError("SSL certificate could not be created. Check your SSL_CERT environment variable.")

        # Connect to the database
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASS'),
            database=os.getenv('DB_NAME'),
            port=25060,
            ssl_disabled=False,
            ssl_ca=cert_file_path 
        )
        
        if connection.is_connected():
            print("Connected to the database successfully")
            return connection

    except Error as err:
        print(f"Database connection error: {err}")
        return None
    except Exception as ex:
        print(f"An error occurred: {ex}")
        return None
    finally:
        if cert_file_path and os.path.exists(cert_file_path):
            os.remove(cert_file_path)
