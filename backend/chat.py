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
    'https://www.googleapis.com/auth/chat.spaces.create',
    'https://www.googleapis.com/auth/chat.spaces.members',
    'https://www.googleapis.com/auth/chat.messages.send'
]

# Load service account credentials from the JSON key file
def get_service_account_credentials():
    service_account_info = json.loads(os.getenv('GOOGLE_SERVICE_ACCOUNT'))
    creds = service_account.Credentials.from_service_account_info(
        service_account_info,
        scopes=SCOPES
    )
    return creds

# Impersonate a user
def impersonate_user(bot_email):
    bot_email='ticketbot@goodearthmarkets.com'
    creds = get_service_account_credentials()
    delegated_creds = creds.with_subject(bot_email)  # Impersonate the specified user
    return delegated_creds

def create_named_space(display_name, user_email):
    creds = impersonate_user()  # Authenticate and impersonate the user
    service = build('chat', 'v1', credentials=creds)  # Build the service

    space_info = {
        'spaceType': 'SPACE',
        'displayName': display_name
    }
    
    result = service.spaces().create(body=space_info).execute()  # Create the space
    print(f'Space created: {result}')
    return result

def add_members_to_space(space_id, members):
    # Assuming members is a list of emails
    for member in members:
        creds = impersonate_user(member)  # Impersonate the member user
        service = build('chat', 'v1', credentials=creds)

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

def send_message(space_id, message_text, user_email):
    creds = impersonate_user(user_email)  # Impersonate the user
    service = build('chat', 'v1', credentials=creds)

    message = {
        'text': message_text
    }

    result = service.spaces().messages().create(
        parent=f'spaces/{space_id}',
        body=message
    ).execute()
    print(f'Message sent: {result}')