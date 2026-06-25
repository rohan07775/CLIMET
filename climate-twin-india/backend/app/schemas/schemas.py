"""
app/schemas/schemas.py
──────────────────────────────────────────────────────────────────────────────
Pydantic schemas defining request and response models for all API endpoints.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


# ── Auth Schemas ─────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    full_name: Optional[str] = None
    phone: Optional[str] = None
    subscribed_states: Optional[str] = Field(None, description="Comma-separated state names")


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str]
    phone: Optional[str]
    subscribed_states: Optional[str]
    is_active: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ── Weather Schemas ──────────────────────────────────────────────────────────

class WeatherDataOut(BaseModel):
    id: int
    state: str
    city: Optional[str]
    latitude: float
    longitude: float
    temperature: Optional[float]
    humidity: Optional[float]
    rainfall: Optional[float]
    wind_speed: Optional[float]
    pressure: Optional[float]
    aqi: Optional[float]
    heat_index: Optional[float]
    recorded_at: datetime
    source: str

    class Config:
        from_attributes = True


class StateWeatherSummary(BaseModel):
    state: str
    city: str
    latitude: float
    longitude: float
    temperature: float
    humidity: float
    rainfall: float
    wind_speed: float
    pressure: float
    aqi: float
    heat_index: float
    recorded_at: str


# ── Prediction Schemas ─────────────────────────────────────────────────────────

class PredictionRequest(BaseModel):
    state: str
    prediction_days: int = 7


class SinglePrediction(BaseModel):
    date: datetime
    temperature: float
    rainfall_probability: float
    heatwave_chance: float
    drought_risk: float
    flood_risk: float
    confidence_score: float


class PredictionOut(BaseModel):
    state: str
    model_used: str
    predictions: List[SinglePrediction]
    confidence_average: float


class MonsoonPredictionOut(BaseModel):
    arrival_date: datetime
    rainfall_intensity: str  # e.g., "Normal", "Deficit", "Excess"
    seasonal_rainfall_mm: float
    alerts: List[str]
    confidence_score: float


# ── Alert Schemas ─────────────────────────────────────────────────────────────

class AlertCreate(BaseModel):
    state: str
    alert_type: str  # flood | heatwave | drought | heavy_rain | cyclone
    risk_level: str  # low | moderate | high | severe
    message: str


class AlertOut(BaseModel):
    id: int
    state: str
    alert_type: str
    risk_level: str
    message: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AlertSubscription(BaseModel):
    email: EmailStr
    phone: Optional[str] = None
    subscribed_states: List[str]


# ── Crop Suitability Schemas ──────────────────────────────────────────────────

class CropAnalysisOut(BaseModel):
    id: int
    state: str
    crop_name: str
    suitability_score: float
    rainfall_effect: str
    temperature_effect: str
    risk_score: float
    recommendation: str
    analyzed_at: datetime

    class Config:
        from_attributes = True


class CropSuitabilityRequest(BaseModel):
    state: str


# ── Chatbot Schemas ───────────────────────────────────────────────────────────

class ChatMessageRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    language: str = "en"  # en | hi


class ChatMessageResponse(BaseModel):
    response: str
    session_id: str
    speech_output_text: Optional[str] = None  # Text optimized for speech synthesis


# ── Carbon footprint Schemas ──────────────────────────────────────────────────

class CarbonCalculationRequest(BaseModel):
    electricity_kwh: float = Field(0.0, description="Monthly electricity in kWh")
    transport_km: float = Field(0.0, description="Monthly transport in km")
    fuel_liters: float = Field(0.0, description="Monthly fuel consumed in liters (car/bike)")
    waste_kg: float = Field(0.0, description="Monthly waste generated in kg")


class CarbonCalculationOut(BaseModel):
    co2_emissions_kg: float
    carbon_score: float  # 0-100 (higher is better / lower footprint)
    sustainability_score: float  # 0-100 (higher is better)
    recommendations: List[str]
