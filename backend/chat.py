import requests
from dotenv import load_dotenv
import os
from google.oauth2 import service_account
from google.auth.transport.requests import Request
import uuid
import json
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build


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
    flow = InstalledAppFlow.from_client_config(client_secrets, SCOPES)
    creds = flow.run_local_server(port=0)
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