import requests
from dotenv import load_dotenv
import os
from google.oauth2 import service_account
from google.auth.transport.requests import Request
import uuid
import json
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials


load_dotenv('../../.env')

# Google Chat API URL
chat_url = "https://chat.googleapis.com/v1/spaces"

def send_google_chat_message(space_id, ticket):
    message = {
        'text': (
            f"🚨 *Ticket Created!*\n\n"
            f"*Title:* {ticket['title']}\n"
            f"*Description:* {ticket['description']}\n"
            f"*Severity:* {ticket['severity']}\n"
            f"*Submitted By:* {ticket['name']}\n"
            f"*Status:* {ticket['status']}\n"
        )
    }

    response = send_message(space_id, message)

    if response:
        print('Message sent successfully!')
    else:
        print('Failed to send message.')


# Define the scope for the Chat API
SCOPES = [
    'https://www.googleapis.com/auth/chat.spaces',
    'https://www.googleapis.com/auth/chat.messages'
]

# Load service account credentials from the JSON key file
def get_service_account_credentials():
    service_account_info = json.loads(os.getenv('GOOGLE_SERVICE_ACCOUNT'))
    creds = service_account.Credentials.from_service_account_info(
        service_account_info,
        scopes=SCOPES
    )
    return creds

def send_direct_message(user_email, message_text):
    creds = get_service_account_credentials()  # Get service account credentials
    service = build('chat', 'v1', credentials=creds)  # Build the service

    message = {
        'text': message_text
    }

    # Assuming there's a direct space with the user, you would need to handle that context
    # You might need to retrieve or create a direct messaging space if it doesn't exist
    space_name = f'spaces/{user_email}'  # Placeholder, might need a valid space ID
    try:
        result = service.spaces().messages().create(
            parent=space_name,  # Send message to the user
            body=message
        ).execute()
        print(f'Message sent to {user_email}: {result}')
    except Exception as e:
        print(f'Failed to send message to {user_email}: {e}')

def add_members_to_space(space_id, members):
    creds = get_service_account_credentials()  # No need to impersonate for adding members
    service = build('chat', 'v1', credentials=creds)

    for member in members:
        member_info = {
            'member': {
                'user': {
                    'email': member
                }
            }
        }
        try:
            result = service.spaces().members().create(
                parent=f'spaces/{space_id}',
                body=member_info
            ).execute()
            print(f'Member added: {result}')
        except Exception as e:
            print(f'Failed to add member {member}: {e}')

def send_message(space_id, message_text):
    creds = get_service_account_credentials()  # No impersonation needed here
    service = build('chat', 'v1', credentials=creds)

    message = {
        'text': message_text
    }

    try:
        result = service.spaces().messages().create(
            parent=f'spaces/{space_id}',  # Use the correct space ID
            body=message
        ).execute()
        print(f'Message sent to space {space_id}: {result}')
    except Exception as e:
        print(f'Failed to send message to space {space_id}: {e}')