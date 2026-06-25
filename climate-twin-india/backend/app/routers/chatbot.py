"""
app/routers/chatbot.py
──────────────────────────────────────────────────────────────────────────────
AI Chatbot Router. Interfaces with the Gemini AI service, passing active alerts
and regional weather parameters for context-rich conversations.
"""

import uuid
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models.db_models import Alert
from app.schemas.schemas import ChatMessageRequest, ChatMessageResponse
from app.services.gemini_service import gemini_service
from app.services.weather_service import weather_service

router = APIRouter()


@router.post("/query", response_model=ChatMessageResponse)
async def query_chatbot(request: ChatMessageRequest, db: AsyncSession = Depends(get_db)):
    """
    Receives user query, gathers active weather/alert contexts, and queries Gemini.
    Returns the text response and optimized text-to-speech output.
    """
    # 1. Fetch active alerts context
    alerts_result = await db.execute(select(Alert).where(Alert.is_active == True))
    alerts_db = alerts_result.scalars().all()
    
    active_alerts: List[Dict[str, Any]] = [
        {"state": a.state, "alert_type": a.alert_type, "risk_level": a.risk_level, "message": a.message}
        for a in alerts_db
    ]

    # 2. Fetch cached weather context for all states
    weather_db = await weather_service.get_all_states_weather()

    # 3. Establish or reuse session ID
    session_id = request.session_id or str(uuid.uuid4())

    # 4. Generate response
    response_data = await gemini_service.get_response(
        user_message=request.message,
        active_alerts=active_alerts,
        state_weather=weather_db,
        language=request.language
    )

    return ChatMessageResponse(
        response=response_data["response"],
        session_id=session_id,
        speech_output_text=response_data.get("speech_output_text")
    )
