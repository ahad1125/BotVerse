import random
from django.utils import timezone
import os
import requests

def generate_and_send_otp(user):
    code=str(random.randint(100000,999999))
    user.otp_code=code
    user.otp_created_at=timezone.now()
    user.save()
    
    resend_api_key = os.getenv('RESEND_API_KEY')
    if not resend_api_key:
        print("RESEND_API_KEY is not configured. Logging OTP code:")
        print(f"Verification code for {user.email} is {code}")
        return
        
    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {resend_api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "from": "BotVerse <onboarding@resend.dev>",
        "to": user.email,
        "subject": "Verify your BotVerse account",
        "html": f"<p>Your verification code is <strong>{code}</strong>. It expires in 10 minutes.</p><p>If you did not request this, you can ignore this email.</p>"
    }
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        print(f"Resend email status: {response.status_code}, content: {response.text}")
    except Exception as e:
        print(f"Failed to send email via Resend: {e}")
    