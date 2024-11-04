from dotenv import load_dotenv
import os
from google.oauth2 import service_account
from google.auth.transport.requests import Request
import json
from googleapiclient.discovery import build
from google.oauth2 import service_account


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

SPACE_TYPE = {
    "SPACE": "SPACE",
    "GROUP_CHAT": "GROUP_CHAT",
    "DIRECT_MESSAGE": "DIRECT_MESSAGE"
}

# Load service account credentials from the JSON key file
def get_service_account_credentials():
    service_account_info = json.loads(os.getenv('GOOGLE_SERVICE_ACCOUNT'))
    creds = service_account.Credentials.from_service_account_info(
        service_account_info,
        scopes=SCOPES
    )
    return creds

def create_named_space(display_name, space_type="SPACE", description=None, guidelines=None):
    creds = get_service_account_credentials()  # Get service account credentials
    service = build('chat', 'v1', credentials=creds)  # Build the service

    space_details = {
        "displayName": display_name,
        "spaceType": space_type,
        "spaceDetails": {
            "description": description,
            "guidelines": guidelines
        } if description or guidelines else {}
    }

    try:
        result = service.spaces().create(body=space_details).execute()
        print(f'Space created: {result}')
        return result  # Return the result containing space information
    except Exception as e:
        print(f'Failed to create space: {e}')
        return None

def add_members_to_space(space_id, members):
    """Add members to a specified space."""
    creds = get_service_account_credentials() 
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
    """Send a message to a specified space."""
    creds = get_service_account_credentials()
    service = build('chat', 'v1', credentials=creds)

    message = {
        'text': message_text
    }

    try:
        result = service.spaces().messages().create(
            parent=f'spaces/{space_id}',
            body=message
        ).execute()
        print(f'Message sent to space {space_id}: {result}')
    except Exception as e:
        print(f'Failed to send message to space {space_id}: {e}')