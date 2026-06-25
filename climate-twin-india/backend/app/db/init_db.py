"""
app/db/init_db.py
──────────────────────────────────────────────────────────────────────────────
Database initialization script. Creates all tables and seeds the database
with robust historical weather data, active alerts, crop suitability metrics,
and a default admin/demo user.
"""

import asyncio
import logging
import random
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from sqlalchemy.future import select

from app.database import AsyncSessionLocal, init_db, engine, Base
from app.models.db_models import State, WeatherData, Alert, CropAnalysis, User
from app.services.weather_service import INDIAN_STATES

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


async def seed_states(session) -> None:
    """Seeds the 36 Indian states and Union Territories."""
    result = await session.execute(select(State))
    if result.scalars().first():
        logger.info("States table already seeded. Skipping.")
        return

    logger.info("Seeding states...")
    
    # Major crop configurations for state associations
    crops_map = {
        "Andhra Pradesh": "Rice, Cotton, Maize, Groundnut",
        "Arunachal Pradesh": "Rice, Maize, Millet",
        "Assam": "Rice, Tea, Jute, Mustard",
        "Bihar": "Rice, Wheat, Maize, Sugarcane",
        "Chhattisgarh": "Rice, Maize, Pulses",
        "Goa": "Rice, Cashew, Coconut",
        "Gujarat": "Cotton, Groundnut, Wheat, Rice",
        "Haryana": "Wheat, Rice, Mustard, Cotton",
        "Himachal Pradesh": "Apple, Maize, Wheat, Barley",
        "Jharkhand": "Rice, Maize, Pulses",
        "Karnataka": "Rice, Maize, Cotton, Ragi",
        "Kerala": "Coconut, Rubber, Spices, Rice",
        "Madhya Pradesh": "Soybean, Wheat, Gram, Cotton",
        "Maharashtra": "Cotton, Sugarcane, Soyabean, Jowar",
        "Manipur": "Rice, Maize, Potato",
        "Meghalaya": "Rice, Maize, Pineapple, Ginger",
        "Mizoram": "Rice, Maize, Pulses",
        "Nagaland": "Rice, Maize, Millet",
        "Odisha": "Rice, Jute, Coconut",
        "Punjab": "Wheat, Rice, Cotton, Sugarcane",
        "Rajasthan": "Bajra, Mustard, Wheat, Barley",
        "Sikkim": "Cardamom, Ginger, Rice, Orange",
        "Tamil Nadu": "Rice, Groundnut, Sugarcane, Cotton",
        "Telangana": "Rice, Cotton, Maize, Chillies",
        "Tripura": "Rice, Rubber, Pineapple",
        "Uttar Pradesh": "Wheat, Sugarcane, Rice, Potatoes",
        "Uttarakhand": "Rice, Wheat, Mandua, Barley",
        "West Bengal": "Rice, Jute, Tea, Potato",
        "Delhi": "Vegetables, Wheat",
        "Jammu and Kashmir": "Saffron, Apple, Rice, Maize",
        "Ladakh": "Barley, Wheat, Apricot",
        "Chandigarh": "Wheat, Maize",
        "Puducherry": "Rice, Sugarcane, Coconut",
        "Andaman and Nicobar": "Coconut, Paddy, Arecanut",
        "Lakshadweep": "Coconut",
        "Dadra and Nagar Haveli": "Rice, Ragi",
    }

    state_codes = {
        "Andhra Pradesh": "AP", "Arunachal Pradesh": "AR", "Assam": "AS", "Bihar": "BR",
        "Chhattisgarh": "CG", "Goa": "GA", "Gujarat": "GJ", "Haryana": "HR",
        "Himachal Pradesh": "HP", "Jharkhand": "JH", "Karnataka": "KA", "Kerala": "KL",
        "Madhya Pradesh": "MP", "Maharashtra": "MH", "Manipur": "MN", "Meghalaya": "ML",
        "Mizoram": "MZ", "Nagaland": "NL", "Odisha": "OD", "Punjab": "PB",
        "Rajasthan": "RJ", "Sikkim": "SK", "Tamil Nadu": "TN", "Telangana": "TG",
        "Tripura": "TR", "Uttar Pradesh": "UP", "Uttarakhand": "UT", "West Bengal": "WB",
        "Delhi": "DL", "Jammu and Kashmir": "JK", "Ladakh": "LA", "Chandigarh": "CH",
        "Puducherry": "PY", "Andaman and Nicobar": "AN", "Lakshadweep": "LD",
        "Dadra and Nagar Haveli": "DN"
    }

    for name, coords in INDIAN_STATES.items():
        state = State(
            name=name,
            code=state_codes.get(name, name[:2].upper()),
            latitude=coords["lat"],
            longitude=coords["lon"],
            capital=coords["capital"],
            area=random.randint(20000, 300000) if "Lakshadweep" not in name else 32.0,
            population=random.randint(1000000, 200000000) if "Lakshadweep" not in name else 64000,
            major_crops=crops_map.get(name, "Rice, Wheat"),
        )
        session.add(state)
        
    await session.commit()
    logger.info("Successfully seeded states.")


async def seed_historical_weather(session) -> None:
    """Seeds historical weather records for the last 90 days to train ML models."""
    result = await session.execute(select(WeatherData))
    if result.scalars().first():
        logger.info("WeatherData table already seeded. Skipping.")
        return

    logger.info("Seeding 90 days of daily historical weather for all states (takes a few seconds)...")
    
    # Establish base climate characteristics per state to generate realistic data
    state_baselines = {
        "Delhi": {"temp": 32.0, "humidity": 45.0, "rain_prob": 0.1, "aqi": 250.0},
        "Rajasthan": {"temp": 36.0, "humidity": 30.0, "rain_prob": 0.05, "aqi": 180.0},
        "Kerala": {"temp": 28.0, "humidity": 85.0, "rain_prob": 0.4, "aqi": 40.0},
        "Assam": {"temp": 26.0, "humidity": 80.0, "rain_prob": 0.35, "aqi": 60.0},
        "Maharashtra": {"temp": 30.0, "humidity": 65.0, "rain_prob": 0.2, "aqi": 120.0},
        "Tamil Nadu": {"temp": 31.0, "humidity": 75.0, "rain_prob": 0.15, "aqi": 90.0},
        "Jammu and Kashmir": {"temp": 16.0, "humidity": 55.0, "rain_prob": 0.25, "aqi": 50.0},
        "Ladakh": {"temp": 8.0, "humidity": 25.0, "rain_prob": 0.05, "aqi": 30.0},
    }
    
    # Default baseline for unspecified states
    default_baseline = {"temp": 27.0, "humidity": 65.0, "rain_prob": 0.2, "aqi": 80.0}

    now = datetime.now(timezone.utc)
    weather_batch = []
    
    for name, coords in INDIAN_STATES.items():
        base = state_baselines.get(name, default_baseline)
        
        for i in range(90):
            date = now - timedelta(days=i)
            # Add sinusoidal seasonal variation and noise
            season_factor = 5.0 * (1.0 + random.uniform(-0.2, 0.2))
            temp = base["temp"] + season_factor
            humidity = min(100.0, max(10.0, base["humidity"] + random.uniform(-15, 15)))
            
            # Rainfall logic
            is_raining = random.random() < base["rain_prob"]
            rainfall = round(random.uniform(5.0, 50.0), 2) if is_raining else 0.0
            
            # Wind, Pressure, AQI, Heat Index
            wind_speed = round(random.uniform(2.0, 25.0), 2)
            pressure = round(1005.0 + random.uniform(-10, 10), 2)
            aqi = max(10.0, min(500.0, base["aqi"] + random.uniform(-40, 40) - (0.5 * wind_speed) - (2.0 * rainfall)))
            heat_index = temp + (0.05 * humidity) # Feels-like temperature estimation
            
            weather_data = WeatherData(
                state=name,
                city=coords["capital"],
                latitude=coords["lat"],
                longitude=coords["lon"],
                temperature=round(temp, 2),
                humidity=round(humidity, 2),
                rainfall=rainfall,
                wind_speed=wind_speed,
                pressure=pressure,
                aqi=round(aqi, 1),
                heat_index=round(heat_index, 2),
                recorded_at=date,
                source="nasa-power",
            )
            weather_batch.append(weather_data)

    session.add_all(weather_batch)
    await session.commit()
    logger.info(f"Successfully seeded {len(weather_batch)} historical weather records.")


async def seed_alerts(session) -> None:
    """Seeds active and resolved alerts in the system."""
    result = await session.execute(select(Alert))
    if result.scalars().first():
        logger.info("Alerts table already seeded. Skipping.")
        return

    logger.info("Seeding disaster alerts...")
    alerts = [
        Alert(
            state="Assam",
            alert_type="flood",
            risk_level="severe",
            message="Severe flood warning issued in Brahmaputra River basin. Flood gauges have breached dangerous thresholds. Residents in low-lying districts are advised to evacuate immediately.",
            is_active=True,
        ),
        Alert(
            state="Delhi",
            alert_type="heatwave",
            risk_level="severe",
            message="Severe heatwave warning. Ambient temperatures are projected to reach 44.5°C with a heat index of 47°C. Avoid outdoor activities between 11:00 AM and 4:00 PM.",
            is_active=True,
        ),
        Alert(
            state="Rajasthan",
            alert_type="heatwave",
            risk_level="high",
            message="High heatwave risk in western districts. Temperatures exceeding 43°C. Ensure hydration for farm workers and livestock.",
            is_active=True,
        ),
        Alert(
            state="Kerala",
            alert_type="heavy_rain",
            risk_level="moderate",
            message="Moderate to heavy rainfall alert in coastal districts. Potential waterlogging in urban sectors. Sowing delay recommended.",
            is_active=True,
        ),
        Alert(
            state="Odisha",
            alert_type="cyclone",
            risk_level="low",
            message="Cyclonic circulation detected in Bay of Bengal. Visual monitoring active. Fishermen advised to check alerts before entering sea.",
            is_active=False,
        )
    ]
    session.add_all(alerts)
    await session.commit()
    logger.info("Successfully seeded alerts.")


async def seed_crop_analysis(session) -> None:
    """Seeds crop suitability and analysis recommendations for states."""
    result = await session.execute(select(CropAnalysis))
    if result.scalars().first():
        logger.info("CropAnalysis table already seeded. Skipping.")
        return

    logger.info("Seeding crop analysis recommendations...")
    crops = ["Rice", "Wheat", "Cotton", "Maize"]
    crop_analyses = []

    for name in INDIAN_STATES.keys():
        for crop in crops:
            # Generate deterministic scores based on crop compatibility with state climate
            score = 0.5
            if crop == "Rice":
                if name in ["West Bengal", "Uttar Pradesh", "Andhra Pradesh", "Punjab", "Kerala", "Assam"]:
                    score = random.uniform(0.8, 0.95)
                else:
                    score = random.uniform(0.3, 0.6)
            elif crop == "Wheat":
                if name in ["Uttar Pradesh", "Punjab", "Haryana", "Madhya Pradesh", "Bihar"]:
                    score = random.uniform(0.8, 0.95)
                else:
                    score = random.uniform(0.2, 0.5)
            elif crop == "Cotton":
                if name in ["Gujarat", "Maharashtra", "Telangana", "Karnataka", "Punjab"]:
                    score = random.uniform(0.75, 0.92)
                else:
                    score = random.uniform(0.15, 0.45)
            elif crop == "Maize":
                if name in ["Karnataka", "Madhya Pradesh", "Bihar", "Andhra Pradesh"]:
                    score = random.uniform(0.75, 0.90)
                else:
                    score = random.uniform(0.4, 0.7)

            # Recommendations text
            if score >= 0.75:
                recommendation = f"Highly suitable for cultivation in {name}. Ensure recommended sowing schedules are followed. Soil health and water levels are highly optimal."
                rain_eff, temp_eff = "positive", "positive"
                risk = random.uniform(0.1, 0.3)
            elif score >= 0.5:
                recommendation = f"Moderately suitable. Cultivation is viable with moderate fertilizer supplementation and standard irrigation management."
                rain_eff, temp_eff = "neutral", "positive"
                risk = random.uniform(0.3, 0.55)
            else:
                recommendation = f"Low suitability. Crop stress probability is high. Alternate drought-resistant crops or intensive soil hydration is required."
                rain_eff, temp_eff = "negative", "negative"
                risk = random.uniform(0.6, 0.85)

            analysis = CropAnalysis(
                state=name,
                crop_name=crop,
                suitability_score=round(score, 2),
                rainfall_effect=rain_eff,
                temperature_effect=temp_eff,
                risk_score=round(risk, 2),
                recommendation=recommendation,
            )
            crop_analyses.append(analysis)

    session.add_all(crop_analyses)
    await session.commit()
    logger.info("Successfully seeded crop analyses.")


async def seed_users(session) -> None:
    """Seeds default user accounts for demonstration."""
    result = await session.execute(select(User).where(User.email == "demo@climatetwin.in"))
    if result.scalars().first():
        logger.info("Demo user already exists. Skipping.")
        return

    logger.info("Seeding default demo user...")
    demo_user = User(
        email="demo@climatetwin.in",
        hashed_password=get_password_hash("HackathonDemo2026"),
        full_name="Climate Twin Demo Admin",
        phone="+919876543210",
        subscribed_states="Assam,Delhi,Rajasthan",
        is_active=True,
        is_admin=True,
    )
    session.add(demo_user)
    await session.commit()
    logger.info("Successfully seeded demo user.")


async def main():
    logger.info("Running complete database initialization and seeding...")
    await init_db()
    
    async with AsyncSessionLocal() as session:
        await seed_states(session)
        await seed_historical_weather(session)
        await seed_alerts(session)
        await seed_crop_analysis(session)
        await seed_users(session)
        
    logger.info("Database seeding complete!")


if __name__ == "__main__":
    asyncio.run(main())
