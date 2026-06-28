import logging
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)

class NotificationService:
    @staticmethod
    def send_email(to: str, subject: str, body: str) -> bool:
        """Sends an email using Django's core mail system"""
        try:
            logger.info(f"Sending email to {to}: [{subject}]")
            if settings.EMAIL_HOST_PASSWORD:
                send_mail(
                    subject=subject,
                    message=body,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[to],
                    fail_silently=False
                )
            else:
                logger.info("EMAIL_HOST_PASSWORD not set. Logging email content instead:")
                logger.info(f"--- EMAIL TO {to} ---\nSubject: {subject}\nBody: {body}\n--------------------")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {to}: {e}")
            return False

    @staticmethod
    def send_sms(phone: str, message: str) -> bool:
        """Sends an SMS using Twilio if credentials are set, else logs it"""
        try:
            logger.info(f"Sending SMS to {phone}: {message}")
            if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
                from twilio.rest import Client
                client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
                client.messages.create(
                    body=message,
                    from_=settings.TWILIO_PHONE_NUMBER,
                    to=phone
                )
            else:
                logger.info("Twilio credentials not set. Logging SMS instead:")
                logger.info(f"--- SMS TO {phone} ---\n{message}\n------------------")
            return True
        except Exception as e:
            logger.error(f"Failed to send SMS to {phone}: {e}")
            return False
