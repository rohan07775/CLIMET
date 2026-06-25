"""
app/models/db_models.py
──────────────────────────────────────────────────────────────────────────────
SQLAlchemy ORM model definitions for all database tables used by the
AI-Powered Digital Twin of India's Climate backend.
"""

from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    DateTime,
    Float,
    Integer,
    String,
    Text,
    func,
)

from app.database import Base


# ── WeatherData ───────────────────────────────────────────────────────────────
class WeatherData(Base):
    """
    Stores real-time and historical weather observations for Indian states.
    Populated by the weather_service fetching Open-Meteo data.
    """
    __tablename__ = "weather_data"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    state = Column(String(100), nullable=False, index=True)
    city = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    # Meteorological measurements
    temperature = Column(Float, nullable=True, comment="°C")
    humidity = Column(Float, nullable=True, comment="Percentage 0-100")
    rainfall = Column(Float, nullable=True, comment="mm")
    wind_speed = Column(Float, nullable=True, comment="km/h")
    pressure = Column(Float, nullable=True, comment="hPa")
    aqi = Column(Float, nullable=True, comment="Air Quality Index estimate")
    heat_index = Column(Float, nullable=True, comment="Feels-like temperature °C")

    # Metadata
    recorded_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )
    source = Column(
        String(50),
        nullable=False,
        default="open-meteo",
        comment="Data source: open-meteo | nasa-power | manual",
    )


# ── PredictionData ────────────────────────────────────────────────────────────
class PredictionData(Base):
    """
    Stores ML model predictions for future climate conditions.
    """
    __tablename__ = "prediction_data"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    state = Column(String(100), nullable=False, index=True)
    model_used = Column(
        String(50),
        nullable=False,
        comment="xgboost | random_forest | lstm | ensemble",
    )
    prediction_type = Column(
        String(50),
        nullable=False,
        comment="temperature | rainfall | humidity | heat_index",
    )
    predicted_value = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=True, comment="0.0 – 1.0")
    prediction_for_date = Column(DateTime(timezone=True), nullable=False, index=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


# ── Alert ─────────────────────────────────────────────────────────────────────
class Alert(Base):
    """
    Climate disaster alerts issued for Indian states.
    """
    __tablename__ = "alerts"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    state = Column(String(100), nullable=False, index=True)
    alert_type = Column(
        String(50),
        nullable=False,
        comment="flood | heatwave | drought | heavy_rain | cyclone",
    )
    risk_level = Column(
        String(20),
        nullable=False,
        comment="low | moderate | high | severe",
    )
    message = Column(Text, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )


# ── State ─────────────────────────────────────────────────────────────────────
class State(Base):
    """
    Reference table for all Indian states and Union Territories.
    """
    __tablename__ = "states"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    code = Column(String(10), unique=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    area = Column(Float, nullable=True, comment="km²")
    population = Column(BigInteger, nullable=True)
    major_crops = Column(
        Text,
        nullable=True,
        comment="Comma-separated list of major crops",
    )
    capital = Column(String(100), nullable=True)


# ── CropAnalysis ──────────────────────────────────────────────────────────────
class CropAnalysis(Base):
    """
    ML-derived crop suitability analysis per state.
    """
    __tablename__ = "crop_analysis"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    state = Column(String(100), nullable=False, index=True)
    crop_name = Column(String(100), nullable=False)
    suitability_score = Column(Float, nullable=False, comment="0.0 – 1.0")
    rainfall_effect = Column(
        String(20),
        nullable=True,
        comment="positive | negative | neutral",
    )
    temperature_effect = Column(
        String(20),
        nullable=True,
        comment="positive | negative | neutral",
    )
    risk_score = Column(Float, nullable=True, comment="0.0 – 1.0, higher = riskier")
    recommendation = Column(Text, nullable=True)
    analyzed_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )


# ── User ──────────────────────────────────────────────────────────────────────
class User(Base):
    """
    Application user — can subscribe to alerts and access the dashboard.
    """
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(200), nullable=True)
    phone = Column(String(20), nullable=True)
    subscribed_states = Column(
        Text,
        nullable=True,
        comment="Comma-separated state names for alert subscriptions",
    )
    is_active = Column(Boolean, nullable=False, default=True)
    is_admin = Column(Boolean, nullable=False, default=False)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
