from dotenv import load_dotenv
import os
from google.oauth2 import service_account
import json
from googleapiclient.discovery import build
import requests
from werkzeug.utils import secure_filename
from datetime import timedelta
from google.cloud import storage
from google.cloud.exceptions import NotFound
from urllib.parse import urlparse


# Load environment variables from the .env file
load_dotenv('../../.env')
# Google Chat API URL
chatURL = os.getenv('CHATURL')
GCS_BUCKET_NAME = os.getenv('GCS_BUCKET_NAME')

service_account_info = json.loads(os.getenv('GOOGLE_SERVICE_ACCOUNT'))
credentials = service_account.Credentials.from_service_account_info(service_account_info)

storage_client = storage.Client(credentials=credentials, project=service_account_info['project_id'])
bucket = storage_client.bucket(GCS_BUCKET_NAME)  # Use your actual bucket name


def send_google_chat_message(ticket, image_url=None):
    webhook_url = chatURL

    # Create the primary text message
    message_text = (
        f"🚨 *New Ticket Created!*\n\n"
        f"*Title:* {ticket['title']}\n"
        f"*Description:* {ticket['description']}\n"
        f"*Severity:* {ticket['severity']}\n"
        f"*Submitted By:* {ticket['name']}\n"
        f"*Contact Method:* {ticket['contact_method']}\n"
    )

    if image_url:
        message_text += f"*Image:* <{image_url}|Download>\n"

    # Prepare the message payload
    message = {"text": message_text}

    # If there's an image URL, include it as a card
    if image_url:
        message["cards"] = [
            {
                "sections": [
                    {
                        "widgets": [
                            {
                                "image": {
                                    "imageUrl": image_url,
                                    "altText": "Attached Image"
                                }
                            }
                        ]
                    }
                ]
            }
        ]

    # Send the message to Google Chat webhook
    response = requests.post(webhook_url, json=message)

    if response.status_code == 200:
        print('Message sent successfully!')
    else:
        print(f'Failed to send message: {response.content}')



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

# Function to list spaces for the user and check if a unique space already exists
def find_user_space(owner_email):
    creds = get_service_account_credentials(owner_email)
    service = build('chat', 'v1', credentials=creds)

    try:
        # List spaces for the user
        response = service.spaces().list().execute()
        spaces = response.get('spaces', [])
        
        # Look for a space named specifically for this user's IT Ticket updates
        for space in spaces:
            if space.get("displayName") == "IT Ticket Updates":
                print(f"Existing user space found: {space['name']}")
                return space  # Return the existing space
        print("No existing space found for this user.")
        return None
    except Exception as e:
        print(f"Failed to list spaces: {e}")
        return None

# Function to create a new space specifically for the user if none exists
def create_user_space(owner_email, description=None, guidelines=None):
    existing_space = find_user_space(owner_email)
    email = 'ticketbot@goodearthmarkets.com'
    
    if existing_space:
        return existing_space  # Use the existing space if found

    # Create a new space for this user if one doesn't exist
    creds = get_service_account_credentials(email)
    service = build('chat', 'v1', credentials=creds)

    space_details = {
        "displayName": "IT Ticket Updates",
        "spaceType": "SPACE",
        "spaceDetails": {
            "description": description,
            "guidelines": guidelines
        } if description or guidelines else {},
    }

    try:
        result = service.spaces().create(body=space_details).execute()
        print(f"Space created for user: {result}")
        return result
    except Exception as e:
        print(f"Failed to create space for user: {e}")
        return None
    

# Function to add members to a space
def add_members_to_space(space_id, owner_email):
    email = 'ticketbot@goodearthmarkets.com'  
    creds = get_service_account_credentials(email) 
    service = build('chat', 'v1', credentials=creds)

    # Member details for the bot
    member_details_bot = {
        "member": {
            "type": "HUMAN",
            "name": f"users/{email}"
        }
    }
    
    try:
        service.spaces().members().create(
            parent=space_id,
            body=member_details_bot
        ).execute()
        print(f'Bot added to space {space_id}')
    except Exception as e:
        print(f'Failed to add bot to space: {e}')
    
    # Member details for the ticket owner
    member_details_owner = {
        "member": {
            "type": "HUMAN",
            "name": f"users/{owner_email}"
        }
    }
    
    try:
        service.spaces().members().create(
            parent=space_id,
            body=member_details_owner
        ).execute()
        print(f'Member {owner_email} added to space {space_id}')
    except Exception as e:
        print(f'Failed to add member {owner_email} to space: {e}')



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
        print(f'Message sent successfully.')
    except Exception as e:
        print(f'Failed to send message to space: {e}')

# Function to send a message to a space
def send_create_message(space_id, text):
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
        print(f'Sent message successfully.')
    except Exception as e:
        print(f'Failed to send message to space: {e}')


def send_feedback_message(feedback_data):
    webhook_url = chatURL

    message = {
        'text': (
            f"💬 *New Feedback Received!*\n\n"
            f"*Submitted By:* {feedback_data['name']}\n"
            f"*Feedback:* {feedback_data['feedback']}\n"
            f"*Contact Info:* {feedback_data['contact_method']}\n"
        )
    }

    response = requests.post(webhook_url, json=message)

    if response.status_code == 200:
        print('Feedback message sent successfully!')
    else:
        print(f'Failed to send feedback message: {response.content}')



def upload_image_to_gcs(file):
    """Upload the image to Google Cloud Storage and return a signed URL"""
    filename = secure_filename(file.filename)
    blob = storage_client.bucket(GCS_BUCKET_NAME).blob(filename)

    blob.upload_from_file(file)

    expiration_time = timedelta(hours=730)

    signed_url = blob.generate_signed_url(expiration=expiration_time, method="GET")

    print(signed_url)

    return signed_url


from urllib.parse import urlparse

def delete_image_from_gcs(image_url):
    """Delete an image from Google Cloud Storage using the file path."""
    parsed_url = urlparse(image_url)
    
    image_path = parsed_url.path.lstrip('/')  
    
    if image_path.startswith(GCS_BUCKET_NAME + '/'):
        image_path = image_path[len(GCS_BUCKET_NAME) + 1:] 
    
    blob = storage_client.bucket(GCS_BUCKET_NAME).blob(image_path)

    try:
        blob.delete()
    except Exception as e:
        print(f"Error deleting image {image_path}: {str(e)}")

