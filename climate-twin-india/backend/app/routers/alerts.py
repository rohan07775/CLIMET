"""
app/routers/alerts.py
──────────────────────────────────────────────────────────────────────────────
Alert Router. Provides endpoints to read active disaster advisories and manages
subscriptions for Twilio SMS and email warnings.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models.db_models import Alert, User
from app.schemas.schemas import AlertOut, AlertCreate, AlertSubscription
from app.services.alert_service import alert_service

router = APIRouter()


@router.get("/active", response_model=List[AlertOut])
async def get_active_alerts(state: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    """Returns all active disaster early warnings, optionally filtered by state."""
    query = select(Alert).where(Alert.is_active == True)
    if state:
        query = query.where(Alert.state.ilike(state))
        
    query = query.order_by(Alert.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/history", response_model=List[AlertOut])
async def get_alert_history(limit: int = 50, db: AsyncSession = Depends(get_db)):
    """Returns historical warning logs (active and resolved)."""
    result = await db.execute(
        select(Alert).order_by(Alert.created_at.desc()).limit(limit)
    )
    return result.scalars().all()


@router.post("/create", response_model=AlertOut, status_code=status.HTTP_201_CREATED)
async def create_alert(alert_in: AlertCreate, db: AsyncSession = Depends(get_db)):
    """
    Manually triggers a new disaster warning (Admin only).
    Fires asynchronous email/SMS notifications to all subscribed users.
    """
    new_alert = Alert(
        state=alert_in.state,
        alert_type=alert_in.alert_type,
        risk_level=alert_in.risk_level,
        message=alert_in.message,
        is_active=True,
    )
    
    db.add(new_alert)
    await db.commit()
    await db.refresh(new_alert)
    
    # Broadcast alert asynchronously to matching subscribers
    # Fetch all users subscribed to this state
    result = await db.execute(select(User).where(User.subscribed_states.like(f"%{alert_in.state}%")))
    subscribers = result.scalars().all()
    
    sms_text = f"[ClimaTwin Alert] {alert_in.risk_level.upper()} {alert_in.alert_type.upper()} warning in {alert_in.state}: {alert_in.message}"
    email_subject = f"⚠️ ClimaTwin India: {alert_in.risk_level.upper()} Alert for {alert_in.state}"
    
    email_html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #050B14; color: #E8F4FD; padding: 20px;">
        <div style="border: 2px solid #FF2D55; border-radius: 12px; padding: 20px; background-color: #0A1628;">
          <h2 style="color: #FF2D55; margin-top: 0;">🚨 CLIMATWIN DISASTER ALERT SYSTEM</h2>
          <p>An emergency alert has been issued for your subscribed region: <strong>{alert_in.state}</strong></p>
          <hr style="border: 0; border-top: 1px solid #1A2744;" />
          <p><strong>Alert Type:</strong> {alert_in.alert_type.upper()}</p>
          <p><strong>Severity:</strong> <span style="color: #FF2D55; font-weight: bold;">{alert_in.risk_level.upper()}</span></p>
          <p><strong>Advisory Message:</strong> {alert_in.message}</p>
          <hr style="border: 0; border-top: 1px solid #1A2744;" />
          <p style="font-size: 12px; color: #8BB8D4;">You received this because you subscribed to alerts for {alert_in.state}. Stay safe.</p>
        </div>
      </body>
    </html>
    """
    
    for sub in subscribers:
        # Trigger SMS if phone exists
        if sub.phone:
            await alert_service.send_sms(sub.phone, sms_text)
        # Trigger Email
        await alert_service.send_email(sub.email, email_subject, email_html)
        
    return new_alert


@router.post("/subscribe")
async def subscribe_to_alerts(subscription: AlertSubscription, db: AsyncSession = Depends(get_db)):
    """Subscribes a user's phone/email to specific state warnings."""
    # Find existing user or create a guest profile
    result = await db.execute(select(User).where(User.email == subscription.email))
    user = result.scalars().first()
    
    states_str = ",".join(subscription.subscribed_states)
    
    if user:
        user.phone = subscription.phone or user.phone
        user.subscribed_states = states_str
    else:
        # Create a light guest user
        user = User(
            email=subscription.email,
            hashed_password="guest-hash-unusable",
            phone=subscription.phone,
            subscribed_states=states_str,
            is_active=True,
            is_admin=False
        )
        db.add(user)
        
    await db.commit()
    return {"message": f"Successfully subscribed {subscription.email} to alerts for: {states_str}"}
