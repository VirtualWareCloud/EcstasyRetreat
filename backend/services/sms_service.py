import os
from twilio.rest import Client
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class SMSService:
    def __init__(self):
        self.account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        self.auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        self.phone_number = os.getenv('TWILIO_PHONE_NUMBER')
        
        self.client = None
        if self.account_sid and self.auth_token:
            self.client = Client(self.account_sid, self.auth_token)
    
    async def send_sms(self, to_phone: str, message: str) -> bool:
        """Send SMS message."""
        if not self.client:
            logger.warning("Twilio credentials not configured, SMS not sent")
            return False
        
        try:
            message = self.client.messages.create(
                body=message,
                from_=self.phone_number,
                to=to_phone
            )
            
            logger.info(f"SMS sent successfully. SID: {message.sid}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send SMS: {str(e)}")
            return False
    
    async def send_booking_reminder(
        self,
        client_phone: str,
        client_name: str,
        therapist_name: str,
        appointment_time: str,
        location: str
    ) -> bool:
        """Send booking reminder SMS."""
        message = f"""
Hi {client_name}! This is a reminder about your massage appointment:

Therapist: {therapist_name}
Time: {appointment_time}
Location: {location}

Your therapist will arrive with all equipment. Please ensure access is available.

- Ecstasy Retreat
        """.strip()
        
        return await self.send_sms(client_phone, message)
    
    async def send_booking_confirmation_sms(
        self,
        client_phone: str,
        client_name: str,
        service_name: str,
        appointment_date: str,
        appointment_time: str
    ) -> bool:
        """Send booking confirmation SMS."""
        message = f"""
Booking Confirmed! 

Hi {client_name}, your {service_name} is confirmed for {appointment_date} at {appointment_time}.

You'll receive a reminder 2 hours before your appointment.

- Ecstasy Retreat
        """.strip()
        
        return await self.send_sms(client_phone, message)

# Global SMS service instance
sms_service = SMSService()