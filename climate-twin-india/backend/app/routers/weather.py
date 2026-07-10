"""
app/routers/weather.py
──────────────────────────────────────────────────────────────────────────────
Weather Router. Serves cached real-time meteorological observations for
states/UTs and retrieves historical database observations for charting.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models.db_models import WeatherData
from app.schemas.schemas import WeatherDataOut, StateWeatherSummary
from app.services.weather_service import weather_service, INDIAN_STATES

router = APIRouter()


@router.get("/current", response_model=List[StateWeatherSummary])
async def get_all_current_weather():
    """
    Returns real-time weather telemetry (Temperature, Rainfall, Humidity, AQI,
    Heat Index) for all 36 Indian states and union territories.
    Data is cached in Redis for 1 hour to optimize performance.
    """
    try:
        data = await weather_service.get_all_states_weather()
        return data
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving weather observations: {e}"
        )


@router.get("/state/{state_name}", response_model=StateWeatherSummary)
async def get_state_weather(state_name: str):
    """
    Returns current weather details for a single specific state.
    Utilizes Redis cache before falling back to Open-Meteo.
    """
    # Normalize state name check
    matching_state = None
    for name in INDIAN_STATES.keys():
        if name.lower() == state_name.lower():
            matching_state = name
            break
            
    if not matching_state:
        raise HTTPException(
            status_code=404,
            detail=f"State '{state_name}' not found. Please specify a valid Indian state/UT."
        )
        
    data = await weather_service.get_state_weather(matching_state)
    if not data:
        raise HTTPException(
            status_code=500,
            detail=f"Could not retrieve telemetry for state '{matching_state}'"
        )
    return data


@router.get("/historical", response_model=List[WeatherDataOut])
async def get_historical_weather(
    state: Optional[str] = None,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """
    Returns historical weather readings from the PostgreSQL database.
    Can be filtered by state. Used for analytics and trend charting.
    """
    query = select(WeatherData)
    if state:
        # Match case-insensitive
        query = query.where(WeatherData.state.ilike(state))
    
    query = query.order_by(WeatherData.recorded_at.desc()).limit(limit)
    result = await db.execute(query)
    readings = list(result.scalars().all())
    
    if readings:
        from datetime import datetime, timezone, timedelta
        # Find the maximum date in the returned readings
        max_db_date = max(r.recorded_at for r in readings if r.recorded_at)
        if max_db_date:
            now_utc = datetime.now(timezone.utc)
            # Make sure max_db_date has timezone info
            if max_db_date.tzinfo is None:
                max_db_date = max_db_date.replace(tzinfo=timezone.utc)
            
            # Align time details to match the database times
            target_end_date = now_utc.replace(
                hour=max_db_date.hour, 
                minute=max_db_date.minute, 
                second=max_db_date.second, 
                microsecond=max_db_date.microsecond
            )
            shift_delta = target_end_date - max_db_date
            
            for r in readings:
                if r.recorded_at:
                    if r.recorded_at.tzinfo is None:
                        r.recorded_at = r.recorded_at.replace(tzinfo=timezone.utc)
                    r.recorded_at = r.recorded_at + shift_delta

    return readings


@router.post("/invalidate-cache")
async def clear_weather_cache(state: Optional[str] = None):
    """Admin utility endpoint to invalidate Redis weather caches."""
    await weather_service.invalidate_cache(state)
    return {"message": "Cache successfully invalidated."}
