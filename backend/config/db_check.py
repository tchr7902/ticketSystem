from mysql.connector import Error
from db_config import connect_to_db
from dotenv import load_dotenv
import os
import logging
import requests
import sys

desktop_path = os.path.join(os.path.expanduser("~"), "Desktop", "db_check.log")
logging.basicConfig(filename=desktop_path, level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

def check_db_connection():
    connection = connect_to_db()
    return connection is not None


def restart_render_service(api_key, service_id):
    url = f"https://api.render.com/v1/services/{service_id}/deploys"
    headers = {"Authorization": f"Bearer {api_key}"}
    response = requests.post(url, headers=headers)
    if response.status_code == 201:
        logging.info("Service restart triggered.")
        return True
    else:
        logging.error("Failed to restart service:", response.text)
        return False


RENDER_API_KEY = os.getenv('RENDER_API_KEY')
RENDER_SERVICE_ID = os.getenv('RENDER_SERVICE_ID')


if not check_db_connection():
    restart_successful = restart_render_service(RENDER_API_KEY, RENDER_SERVICE_ID)
    if not restart_successful:
        logging.info("Exiting the script after failed restart.")
        sys.exit(0)
else:
    logging.info("Database connection is active. Exiting the script.")
    sys.exit(0)
