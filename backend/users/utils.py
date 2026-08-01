import random
from django.core.mail import send_mail
from django.utils import timezone
from django.conf import settings
from dotenv import load_dotenv
import os

def generate_and_send_otp(user):
    
    print(os.getenv('EMAIL_HOST_USER'), os.getenv('EMAIL_HOST_PASSWORD'))
    
    code=str(random.randint(100000,999999))
    user.otp_code=code
    user.otp_created_at=timezone.now()
    user.save()
    
    send_mail(
    subject='Verify your BotVerse account',
    message=f'Your verification code is {code}. It expires in 10 minutes.\n\nIf you did not request this, you can ignore this email.',
    from_email=settings.DEFAULT_FROM_EMAIL,
    recipient_list=[user.email],
    fail_silently=True
)
    