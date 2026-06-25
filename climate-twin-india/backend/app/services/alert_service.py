"""
app/services/alert_service.py
──────────────────────────────────────────────────────────────────────────────
Disaster Early Warning notification dispatcher. Implements Twilio SMS alerts
and SMTP-based email alerts. Falls back to standard logging when configurations
are empty or offline.
"""

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from twilio.rest import Client

from app.config import settings

logger = logging.getLogger(__name__)


class AlertService:
    """Dispatches emergency alerts to subscribers via SMS and Email."""

    def __init__(self):
        # Initialize Twilio Client if config is available
        self.twilio_enabled = False
        if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
            try:
                self.twilio_client = Client(
                    settings.TWILIO_ACCOUNT_SID,
                    settings.TWILIO_AUTH_TOKEN,
                )
                self.twilio_enabled = True
                logger.info("Twilio SMS integration initialized successfully.")
            except Exception as e:
                logger.warning(f"Failed to initialize Twilio: {e}. SMS alerts will use logger fallback.")
        else:
            logger.info("Twilio configurations not set. Running SMS service in offline LOG-ONLY mode.")

    async def send_sms(self, phone: str, message: str) -> bool:
        """
        Sends an SMS alert using Twilio.
        Falls back to local logger if Twilio is disabled.
        """
        if not phone:
            logger.warning("Empty phone number provided. Skipping SMS alert.")
            return False

        log_message = f"[EMERGENCY SMS to {phone}]: {message}"
        if not self.twilio_enabled:
            logger.info(f"OFFLINE-FALLBACK: {log_message}")
            return True

        try:
            # Twilio dispatch runs synchronously; execute in a separate thread if needed
            # For hackathon simplicity, standard call is sufficient
            self.twilio_client.messages.create(
                body=message,
                from_=settings.TWILIO_PHONE_FROM,
                to=phone,
            )
            logger.info(f"SMS Alert successfully sent to {phone} via Twilio.")
            return True
        except Exception as e:
            logger.error(f"Error sending SMS to {phone} via Twilio: {e}")
            logger.info(f"OFFLINE-FALLBACK: {log_message}")
            return False

    async def send_email(self, email: str, subject: str, html_body: str) -> bool:
        """
        Sends an HTML email alert using SMTP.
        Falls back to local logger if SMTP configuration is empty.
        """
        if not email:
            logger.warning("Empty email address provided. Skipping email alert.")
            return False

        log_message = f"[EMERGENCY EMAIL to {email}] Subject: {subject}\nBody: {html_body[:200]}..."

        # Check SMTP settings
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.info(f"OFFLINE-FALLBACK: {log_message}")
            return True

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.SMTP_USER
            msg["To"] = email

            # Attach plain and HTML body
            msg.attach(MIMEText(html_body, "html"))

            # Start connection
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, email, msg.as_string())
            server.quit()

            logger.info(f"Email Alert successfully sent to {email} via SMTP.")
            return True
        except Exception as e:
            logger.error(f"Error sending Email to {email} via SMTP: {e}")
            logger.info(f"OFFLINE-FALLBACK: {log_message}")
            return False


# Singleton instance
alert_service = AlertService()
