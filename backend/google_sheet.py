import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

def convert_datetime_to_string(dt):
    """Helper function to convert datetime to string if it exists."""
    if isinstance(dt, datetime):
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    return dt

def get_google_sheets_service():
    """Authenticate and return a Google Sheets API service object."""
    credentials = None
    service_account_file_path = os.getenv('GOOGLE_SERVICE_ACCOUNT_FILE_PATH')

    if not service_account_file_path:
        raise Exception("Service account file path is not set in the environment variables.")

    try:
        credentials = service_account.Credentials.from_service_account_file(
            service_account_file_path, scopes=SCOPES
        )
        service = build('sheets', 'v4', credentials=credentials)
        return service
    except Exception as e:
        print(f"Error loading credentials: {e}")
        raise e


def add_ticket_to_google_sheet(ticket_values, spreadsheet_id):
    try:
        service = get_google_sheets_service()
        sheet = service.spreadsheets()

        values = [
            [
                ticket_values['title'], 
                ticket_values['description'], 
                ticket_values['severity'],
                ticket_values['notes'], 
                ticket_values['time_spent'], 
                ticket_values['parts_needed'], 
                ticket_values['status'],
                ticket_values['submitted_by'], 
                convert_datetime_to_string(ticket_values['created_at']), 
                convert_datetime_to_string(ticket_values['archive_date'])
            ]
        ]

        body = {
            'values': values
        }

        sheet.values().append(
            spreadsheetId=spreadsheet_id,
            range='Sheet1!A2', 
            valueInputOption="RAW",
            body=body
        ).execute()

    except Exception as e:
        print(f"Google Sheets API error: {e}")
        raise Exception("Failed to update Google Sheet")
