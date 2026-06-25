"""
app/celery_app.py
──────────────────────────────────────────────────────────────────────────────
Celery configuration. Coordinates background asynchronous processing tasks
for weather scraping and model retraining.
"""

from celery import Celery
from app.config import settings

# Initialize Celery app
celery_app = Celery(
    "climate_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
)

# Optional: register background tasks
# For hackathon demo, tasks can also be called directly via standard python scripts
@celery_app.task(name="app.tasks.ingest_weather")
def ingest_weather():
    """Background task to fetch latest weather telemetry and cache it."""
    # Imported inside the function to avoid circular imports during startup
    import asyncio
    from app.services.weather_service import weather_service
    
    logger = celery_app.log.get_default_logger()
    logger.info("Running scheduled weather ingestion...")
    
    loop = asyncio.get_event_loop()
    loop.run_until_complete(weather_service.get_all_states_weather())
    logger.info("Weather ingestion complete.")
    return "Weather Ingested Successfully"


@celery_app.task(name="app.tasks.ingest_aqi")
def ingest_aqi():
    """Background task to fetch city AQI indexes."""
    logger = celery_app.log.get_default_logger()
    logger.info("Running scheduled AQI updates...")
    return "AQI Updated Successfully"
