import requests
from dotenv import load_dotenv
import os

load_dotenv('../../.env')

chatURL = os.getenv('CHATURL')

def send_google_chat_message(ticket):
    webhook_url = chatURL

    message = {
        'text': (
            f"🚨 *New Ticket Created!*\n\n"
            f"*Title:* {ticket['title']}\n"
            f"*Description:* {ticket['description']}\n"
            f"*Severity:* {ticket['severity']}\n"
            f"*Submitted By:* {ticket['name']}\n"
            f"*Contact Method:* {ticket['contact_method']}\n"
        )
    }

    response = requests.post(webhook_url, json=message)

    if response.status_code == 200:
        print('Message sent successfully!')
    else:
        print(f'Failed to send message: {response.content}')