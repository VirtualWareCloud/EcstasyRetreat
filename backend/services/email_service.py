import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.api_key = os.getenv('SENDGRID_API_KEY')
        self.from_email = os.getenv('FROM_EMAIL', 'noreply@ecstasyretreat.com')
        self.sg = SendGridAPIClient(api_key=self.api_key) if self.api_key else None
        
    async def send_email(
        self,
        to_emails: List[str],
        subject: str,
        html_content: str,
        plain_content: Optional[str] = None
    ) -> bool:
        """Send email using SendGrid."""
        if not self.sg:
            logger.warning("SendGrid API key not configured, email not sent")
            return False
            
        try:
            message = Mail(
                from_email=self.from_email,
                to_emails=to_emails,
                subject=subject,
                html_content=html_content,
                plain_text_content=plain_content
            )
            
            response = self.sg.send(message)
            logger.info(f"Email sent successfully. Status code: {response.status_code}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return False
    
    async def send_booking_confirmation(
        self,
        client_email: str,
        client_name: str,
        therapist_name: str,
        service_name: str,
        appointment_date: str,
        appointment_time: str,
        location: str,
        total_amount: float
    ) -> bool:
        """Send booking confirmation email."""
        subject = f"Booking Confirmation - {service_name}"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #18243D 0%, #d4af37 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">Ecstasy Retreat</h1>
                <p style="color: #fff3a8; margin: 0;">Mobile Massage Therapists</p>
            </div>
            
            <div style="padding: 30px; background: white;">
                <h2 style="color: #18243D;">Booking Confirmed!</h2>
                
                <p>Dear {client_name},</p>
                
                <p>Your massage appointment has been confirmed. Here are the details:</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #18243D; margin-top: 0;">Appointment Details</h3>
                    <p><strong>Service:</strong> {service_name}</p>
                    <p><strong>Therapist:</strong> {therapist_name}</p>
                    <p><strong>Date:</strong> {appointment_date}</p>
                    <p><strong>Time:</strong> {appointment_time}</p>
                    <p><strong>Location:</strong> {location}</p>
                    <p><strong>Total Amount:</strong> ${total_amount:.2f}</p>
                </div>
                
                <p>Your therapist will arrive at your location with all necessary equipment. Please ensure someone is available to provide access to the appointment location.</p>
                
                <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
                
                <p style="margin-top: 30px;">Thank you for choosing Ecstasy Retreat!</p>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="color: #666;">Questions? Reply to this email or call us at (555) 123-4567</p>
                </div>
            </div>
        </div>
        """
        
        return await self.send_email([client_email], subject, html_content)
    
    async def send_therapist_notification(
        self,
        therapist_email: str,
        therapist_name: str,
        client_name: str,
        service_name: str,
        appointment_date: str,
        appointment_time: str,
        location: str
    ) -> bool:
        """Send new booking notification to therapist."""
        subject = f"New Booking Request - {service_name}"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #18243D 0%, #d4af37 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">Ecstasy Retreat</h1>
                <p style="color: #fff3a8; margin: 0;">New Booking Alert</p>
            </div>
            
            <div style="padding: 30px; background: white;">
                <h2 style="color: #18243D;">New Appointment Request</h2>
                
                <p>Hello {therapist_name},</p>
                
                <p>You have a new booking request. Please review and confirm:</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #18243D; margin-top: 0;">Booking Details</h3>
                    <p><strong>Client:</strong> {client_name}</p>
                    <p><strong>Service:</strong> {service_name}</p>
                    <p><strong>Date:</strong> {appointment_date}</p>
                    <p><strong>Time:</strong> {appointment_time}</p>
                    <p><strong>Location:</strong> {location}</p>
                </div>
                
                <p>Please log in to your therapist dashboard to accept or decline this booking.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="#" style="background: #d4af37; color: #18243D; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Booking</a>
                </div>
            </div>
        </div>
        """
        
        return await self.send_email([therapist_email], subject, html_content)
    
    async def send_application_received(
        self,
        applicant_email: str,
        applicant_name: str
    ) -> bool:
        """Send application received confirmation."""
        subject = "Application Received - Ecstasy Retreat"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #18243D 0%, #d4af37 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">Ecstasy Retreat</h1>
                <p style="color: #fff3a8; margin: 0;">Application Received</p>
            </div>
            
            <div style="padding: 30px; background: white;">
                <h2 style="color: #18243D;">Thank You for Your Application!</h2>
                
                <p>Dear {applicant_name},</p>
                
                <p>We have received your application to join our elite team of massage therapists. Thank you for your interest in Ecstasy Retreat!</p>
                
                <p>Our team will review your application and credentials. We typically respond within 3-5 business days.</p>
                
                <p>What happens next:</p>
                <ul>
                    <li>Application review (1-2 days)</li>
                    <li>Background and reference checks (2-3 days)</li>
                    <li>Interview scheduling (if approved)</li>
                    <li>Onboarding process</li>
                </ul>
                
                <p>We'll keep you updated throughout the process via email.</p>
                
                <p style="margin-top: 30px;">Thank you for choosing to be part of our luxury wellness team!</p>
            </div>
        </div>
        """
        
        return await self.send_email([applicant_email], subject, html_content)

# Global email service instance
email_service = EmailService()