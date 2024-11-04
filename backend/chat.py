import requests
from dotenv import load_dotenv
import os
from google.oauth2 import service_account
from google.auth.transport.requests import Request
import uuid
import json

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




# Retrieve access token
def get_access_token():
    try:
        service_account_info = json.loads(os.environ.get('GOOGLE_SERVICE_ACCOUNT_KEY'))
        credentials = service_account.Credentials.from_service_account_info(
            service_account_info,
            scopes=['https://www.googleapis.com/auth/chat.spaces']
        )
        credentials.refresh(Request())
        return credentials.token
    except Exception as e:
        print(f"Error obtaining access token: {e}")
        return None

# Search for an existing space
def find_existing_space_by_name(display_name):
    url = f"{chat_url}:search"
    access_token = get_access_token()
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    params = {
        "query": f"customer = 'customers/my_customer' AND spaceType = 'SPACE' AND displayName:'{display_name}'",
        "useAdminAccess": "true"
    }

    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code == 200:
        spaces = response.json().get('spaces', [])
        if spaces:
            return spaces[0].get('name')  # Return the first matching space's name
    print(f"Space not found or error: {response.status_code} - {response.text}")
    return None

# Create a new named space
def create_named_space(display_name):
    url = f"{chat_url}:setup"
    access_token = get_access_token()

    payload = {
        "space": {
            "spaceType": "SPACE",
            "displayName": display_name
        },
        "requestId": str(uuid.uuid4())
    }

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code == 200:
        return response.json()  # Return the space information
    else:
        print(f'Failed to create space: {response.status_code} - {response.text}')
        return None

# Add a member to a space
def add_members_to_space(space_id, email):
    url = f"{chat_url}/{space_id}/members"
    access_token = get_access_token()

    payload = {
        "member": {
            "name": f"users/{email}"
        }
    }

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code == 200:
        print('Member added successfully:', response.json())
    else:
        print(f'Failed to add member: {response.status_code} - {response.text}')

# Send a message in a space
def send_message(space_id, user_name, ticket_name, status):
    url = f"{chat_url}/{space_id}/messages"
    access_token = get_access_token()

    message_text = f"Hello {user_name}! Your ticket '{ticket_name}' has been updated to '{status}'."
    payload = {
        "text": message_text
    }

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code == 200:
        return response.json()
    else:
        print(f'Failed to send message: {response.status_code} - {response.text}')
        return None

# Main function to handle space creation or reuse
def find_or_create_space(user_name, user_email):
    display_name = f"IT Ticket - {user_name}"
    space_id = find_existing_space_by_name(display_name)
    
    if not space_id:
        space_info = create_named_space(display_name)
        if space_info:
            space_id = space_info.get('name')
            add_members_to_space(space_id, user_email)
    return space_id