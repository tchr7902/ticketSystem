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


client_secrets_json = os.getenv('OAUTH_CREDENTIALS')

client_secrets = json.loads(client_secrets_json)

# Define the scope for the Chat API
SCOPES = [
    'https://www.googleapis.com/auth/chat.spaces.create',
    'https://www.googleapis.com/auth/chat.spaces.members',
    'https://www.googleapis.com/auth/chat.messages.send'
]

def authenticate():
    creds = None
    
    # Check if token.json exists to load existing credentials
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)

    # If there are no valid credentials, let the user authenticate
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # Load the client secrets from environment variables
            client_secrets = json.loads(os.environ['OAUTH_CREDENTIALS'])
            flow = InstalledAppFlow.from_client_config(client_secrets, SCOPES)
            creds = flow.run_console()  # Use the console to get the authorization code

            # Save the credentials for the next run
            with open('token.json', 'w') as token:
                token.write(creds.to_json())

    return creds


def create_named_space(display_name):
    creds = authenticate()  # Authenticate and get user credentials
    service = build('chat', 'v1', credentials=creds)  # Build the service

    space_info = {
        'spaceType': 'SPACE',
        'displayName': display_name
    }
    
    result = service.spaces().create(body=space_info).execute()  # Create the space
    print(f'Space created: {result}')
    return result

def add_members_to_space(space_id, members):
    creds = authenticate()
    service = build('chat', 'v1', credentials=creds)

    for member in members:
        member_info = {
            'member': {
                'user': {
                    'email': member
                }
            }
        }
        result = service.spaces().members().create(
            parent=f'spaces/{space_id}',
            body=member_info
        ).execute()
        print(f'Member added: {result}')

def send_message(space_id, message_text):
    creds = authenticate()
    service = build('chat', 'v1', credentials=creds)

    message = {
        'text': message_text
    }

    result = service.spaces().messages().create(
        parent=f'spaces/{space_id}',
        body=message
    ).execute()
    print(f'Message sent: {result}')