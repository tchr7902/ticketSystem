from dotenv import load_dotenv
import os
from google.oauth2 import service_account
from google.auth.transport.requests import Request
import json
from googleapiclient.discovery import build
from google.oauth2 import service_account
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
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
    'https://www.googleapis.com/auth/chat.app.spaces',
    'https://www.googleapis.com/auth/chat.messages',
    'https://www.googleapis.com/auth/chat.spaces',
    'https://www.googleapis.com/auth/chat.memberships',
    'https://www.googleapis.com/auth/chat.admin.spaces',
    'https://www.googleapis.com/auth/chat.spaces.create'
]

SPACE_TYPE = {
    "SPACE": "SPACE",
    "GROUP_CHAT": "GROUP_CHAT",
    "DIRECT_MESSAGE": "DIRECT_MESSAGE"
}

# Function to get service account credentials with user impersonation
def get_service_account_credentials(user_email):
    service_account_info = json.loads(os.getenv('GOOGLE_SERVICE_ACCOUNT'))
    creds = service_account.Credentials.from_service_account_info(
        service_account_info,
        scopes=SCOPES,
        subject=user_email  # Impersonate the user
    )
    return creds

# Function to create a named space
def create_named_space(display_name, description=None, guidelines=None):
    service_account_email = 'ticketbot@goodearthmarkets.com'
    creds = get_service_account_credentials(service_account_email)
    service = build('chat', 'v1', credentials=creds)

    space_details = {
        "displayName": display_name,
        "spaceType": "SPACE",
        "spaceDetails": {
            "description": description,
            "guidelines": guidelines
        } if description or guidelines else {}
    }

    try:
        result = service.spaces().create(body=space_details).execute()
        print(f'Space created: {result}')
        return result
    except Exception as e:
        print(f'Failed to create space: {e}')
        return None

# Function to add members to a space
def add_members_to_space(space_id, owner_email):
    email = 'ticketbot@goodearthmarkets.com'  # Impersonating the same account
    creds = get_service_account_credentials(email)  # Get credentials for the impersonated account
    service = build('chat', 'v1', credentials=creds)

    # Create a list of member emails to add, including the ticketbot
    members_to_add = [email, owner_email]

    for member_email in members_to_add:
        member_details = {
            "member": {
                "email": member_email  # Use just the email directly
            }
        }
        
        try:
            service.spaces().members().create(
                parent=space_id,
                body=member_details
            ).execute()
            print(f'Member {member_email} added to space {space_id}')
        except Exception as e:
            print(f'Failed to add member {member_email} to space: {e}')



# Function to send a message to a space
def send_message(space_id, text):
    service_account_email = 'ticketbot@goodearthmarkets.com'
    creds = get_service_account_credentials(service_account_email)
    service = build('chat', 'v1', credentials=creds)

    message = {
        "text": text
    }
    
    try:
        service.spaces().messages().create(
            parent=space_id,
            body=message
        ).execute()
        print(f'Message sent to space {space_id}: {text}')
    except Exception as e:
        print(f'Failed to send message to space: {e}')
