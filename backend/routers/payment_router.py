from fastapi import APIRouter, Depends, HTTPException, status, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
import stripe
import os
from ..database import get_database
from ..models import PaymentIntent, PaymentResponse, User, BookingStatus, PaymentStatus
from ..auth import get_current_active_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/payments", tags=["payments"])

# Configure Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

@router.post("/create-payment-intent", response_model=PaymentResponse)
async def create_payment_intent(
    payment_data: PaymentIntent,
    current_user: User = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create Stripe payment intent for booking."""
    # Get booking details
    booking = await db.bookings.find_one({
        "id": payment_data.booking_id,
        "client_id": current_user.id
    })
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if booking["payment_status"] == PaymentStatus.PAID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking already paid"
        )
    
    try:
        # Create payment intent with Stripe
        intent = stripe.PaymentIntent.create(
            amount=int(payment_data.amount * 100),  # Convert to cents
            currency=payment_data.currency,
            automatic_payment_methods={"enabled": True},
            metadata={
                "booking_id": payment_data.booking_id,
                "client_id": current_user.id,
                "client_email": current_user.email
            }
        )
        
        # Update booking with payment intent ID
        await db.bookings.update_one(
            {"id": payment_data.booking_id},
            {
                "$set": {
                    "stripe_payment_intent_id": intent.id,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        logger.info(f"Payment intent created for booking: {payment_data.booking_id}")
        
        return PaymentResponse(
            client_secret=intent.client_secret,
            payment_intent_id=intent.id
        )
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment processing error: {str(e)}"
        )

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Handle Stripe webhook events."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError:
        logger.error("Invalid payload in Stripe webhook")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        logger.error("Invalid signature in Stripe webhook")
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        booking_id = payment_intent["metadata"]["booking_id"]
        
        # Update booking payment status
        await db.bookings.update_one(
            {"id": booking_id},
            {
                "$set": {
                    "payment_status": PaymentStatus.PAID,
                    "status": BookingStatus.CONFIRMED,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        logger.info(f"Payment succeeded for booking: {booking_id}")
        
    elif event["type"] == "payment_intent.payment_failed":
        payment_intent = event["data"]["object"]
        booking_id = payment_intent["metadata"]["booking_id"]
        
        # Update booking payment status
        await db.bookings.update_one(
            {"id": booking_id},
            {
                "$set": {
                    "payment_status": PaymentStatus.FAILED,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        logger.info(f"Payment failed for booking: {booking_id}")
    
    return {"status": "success"}

@router.get("/booking/{booking_id}/status")
async def get_payment_status(
    booking_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get payment status for booking."""
    booking = await db.bookings.find_one({
        "id": booking_id,
        "client_id": current_user.id
    })
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    return {
        "booking_id": booking_id,
        "payment_status": booking["payment_status"],
        "total_amount": booking["total_amount"],
        "stripe_payment_intent_id": booking.get("stripe_payment_intent_id")
    }

@router.post("/refund/{booking_id}")
async def process_refund(
    booking_id: str,
    reason: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Process refund for cancelled booking."""
    booking = await db.bookings.find_one({"id": booking_id})
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check authorization
    can_refund = False
    if booking["client_id"] == current_user.id:
        can_refund = True
    elif current_user.role == "admin":
        can_refund = True
    
    if not can_refund:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to process refund"
        )
    
    if booking["payment_status"] != PaymentStatus.PAID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking is not paid"
        )
    
    if not booking.get("stripe_payment_intent_id"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No payment intent found for this booking"
        )
    
    try:
        # Process refund with Stripe
        refund = stripe.Refund.create(
            payment_intent=booking["stripe_payment_intent_id"],
            reason="requested_by_customer",
            metadata={
                "booking_id": booking_id,
                "reason": reason
            }
        )
        
        # Update booking status
        await db.bookings.update_one(
            {"id": booking_id},
            {
                "$set": {
                    "payment_status": PaymentStatus.REFUNDED,
                    "status": BookingStatus.CANCELLED,
                    "cancellation_reason": reason,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        logger.info(f"Refund processed for booking: {booking_id}")
        
        return {
            "message": "Refund processed successfully",
            "refund_id": refund.id,
            "amount": refund.amount / 100  # Convert back from cents
        }
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe refund error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Refund processing error: {str(e)}"
        )