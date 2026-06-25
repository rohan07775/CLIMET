"""
app/services/weather_service.py
──────────────────────────────────────────────────────────────────────────────
Fetches real-time weather data from the Open-Meteo API for every Indian state
and Union Territory. Results are cached in Redis for 1 hour to avoid
unnecessary API calls.

Open-Meteo is completely free and requires no API key.
"""

import json
import logging
import math
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import httpx
import redis.asyncio as aioredis

from app.config import settings

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# Indian States & UTs — coordinates and capital city
# ─────────────────────────────────────────────────────────────────────────────
INDIAN_STATES: Dict[str, Dict[str, Any]] = {
    "Andhra Pradesh":      {"lat": 15.9129, "lon": 79.7400, "capital": "Amaravati"},
    "Arunachal Pradesh":   {"lat": 27.1004, "lon": 93.6167, "capital": "Itanagar"},
    "Assam":               {"lat": 26.2006, "lon": 92.9376, "capital": "Dispur"},
    "Bihar":               {"lat": 25.0961, "lon": 85.3131, "capital": "Patna"},
    "Chhattisgarh":        {"lat": 21.2787, "lon": 81.8661, "capital": "Raipur"},
    "Goa":                 {"lat": 15.2993, "lon": 74.1240, "capital": "Panaji"},
    "Gujarat":             {"lat": 22.2587, "lon": 71.1924, "capital": "Gandhinagar"},
    "Haryana":             {"lat": 29.0588, "lon": 76.0856, "capital": "Chandigarh"},
    "Himachal Pradesh":    {"lat": 31.1048, "lon": 77.1734, "capital": "Shimla"},
    "Jharkhand":           {"lat": 23.6102, "lon": 85.2799, "capital": "Ranchi"},
    "Karnataka":           {"lat": 15.3173, "lon": 75.7139, "capital": "Bengaluru"},
    "Kerala":              {"lat": 10.8505, "lon": 76.2711, "capital": "Thiruvananthapuram"},
    "Madhya Pradesh":      {"lat": 22.9734, "lon": 78.6569, "capital": "Bhopal"},
    "Maharashtra":         {"lat": 19.7515, "lon": 75.7139, "capital": "Mumbai"},
    "Manipur":             {"lat": 24.6637, "lon": 93.9063, "capital": "Imphal"},
    "Meghalaya":           {"lat": 25.4670, "lon": 91.3662, "capital": "Shillong"},
    "Mizoram":             {"lat": 23.1645, "lon": 92.9376, "capital": "Aizawl"},
    "Nagaland":            {"lat": 26.1584, "lon": 94.5624, "capital": "Kohima"},
    "Odisha":              {"lat": 20.9517, "lon": 85.0985, "capital": "Bhubaneswar"},
    "Punjab":              {"lat": 31.1471, "lon": 75.3412, "capital": "Chandigarh"},
    "Rajasthan":           {"lat": 27.0238, "lon": 74.2179, "capital": "Jaipur"},
    "Sikkim":              {"lat": 27.5330, "lon": 88.5122, "capital": "Gangtok"},
    "Tamil Nadu":          {"lat": 11.1271, "lon": 78.6569, "capital": "Chennai"},
    "Telangana":           {"lat": 18.1124, "lon": 79.0193, "capital": "Hyderabad"},
    "Tripura":             {"lat": 23.9408, "lon": 91.9882, "capital": "Agartala"},
    "Uttar Pradesh":       {"lat": 26.8467, "lon": 80.9462, "capital": "Lucknow"},
    "Uttarakhand":         {"lat": 30.0668, "lon": 79.0193, "capital": "Dehradun"},
    "West Bengal":         {"lat": 22.9868, "lon": 87.8550, "capital": "Kolkata"},
    # Union Territories
    "Delhi":               {"lat": 28.6139, "lon": 77.2090, "capital": "New Delhi"},
    "Jammu and Kashmir":   {"lat": 33.7782, "lon": 76.5762, "capital": "Srinagar"},
    "Ladakh":              {"lat": 34.1526, "lon": 77.5771, "capital": "Leh"},
    "Chandigarh":          {"lat": 30.7333, "lon": 76.7794, "capital": "Chandigarh"},
    "Puducherry":          {"lat": 11.9416, "lon": 79.8083, "capital": "Puducherry"},
    "Andaman and Nicobar": {"lat": 11.7401, "lon": 92.6586, "capital": "Port Blair"},
    "Lakshadweep":         {"lat": 10.5667, "lon": 72.6417, "capital": "Kavaratti"},
    "Dadra and Nagar Haveli": {"lat": 20.1809, "lon": 73.0169, "capital": "Daman"},
}

# Open-Meteo variables to fetch
_OPEN_METEO_VARIABLES = (
    "temperature_2m,"
    "apparent_temperature,"
    "precipitation,"
    "relative_humidity_2m,"
    "wind_speed_10m,"
    "surface_pressure,"
    "weathercode"
)

# WMO weather code → human readable label
_WMO_CODE_MAP: Dict[int, str] = {
    0: "Clear sky",
    1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Depositing rime fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Slight snowfall", 73: "Moderate snowfall", 75: "Heavy snowfall",
    80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
    95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail",
}


# ─────────────────────────────────────────────────────────────────────────────
# AQI Estimation
# ─────────────────────────────────────────────────────────────────────────────
def _estimate_aqi(
    temperature: float,
    humidity: float,
    wind_speed: float,
    rainfall: float,
    state: str,
) -> float:
    """
    Heuristic AQI estimation when real AQI data is unavailable.

    Logic:
    - High wind disperses pollutants → lower AQI
    - Rain washes particulates → lower AQI
    - High humidity traps pollutants → higher AQI
    - High-population / industrial states have baseline offset
    """
    high_pollution_states = {
        "Delhi", "Uttar Pradesh", "Bihar", "Haryana",
        "Punjab", "Rajasthan", "Maharashtra",
    }
    base_aqi = 100.0 if state in high_pollution_states else 60.0

    # Wind: each 10 km/h reduces AQI by ~8
    wind_factor = -0.8 * wind_speed
    # Rain: each mm reduces AQI by ~2
    rain_factor = -2.0 * min(rainfall, 30.0)
    # Humidity: above 60% adds to AQI (pollution trapping)
    humidity_factor = max(0.0, (humidity - 60.0) * 0.5)

    aqi = base_aqi + wind_factor + rain_factor + humidity_factor
    return max(10.0, min(500.0, round(aqi, 1)))


# ─────────────────────────────────────────────────────────────────────────────
# WeatherService
# ─────────────────────────────────────────────────────────────────────────────
class WeatherService:
    """
    Async service for fetching weather data from Open-Meteo and caching
    results in Redis.
    """

    CACHE_PREFIX = "weather:"
    CACHE_TTL = settings.WEATHER_CACHE_TTL  # 3600 seconds

    def __init__(self) -> None:
        self._redis: Optional[aioredis.Redis] = None
        self._http_client: Optional[httpx.AsyncClient] = None

    # ── Connection helpers ────────────────────────────────────────────────────
    async def _get_redis(self) -> Optional[aioredis.Redis]:
        """Return a lazy-initialised Redis client, or None if unavailable."""
        if self._redis is None:
            try:
                self._redis = aioredis.from_url(
                    settings.REDIS_URL,
                    encoding="utf-8",
                    decode_responses=True,
                )
                await self._redis.ping()
            except Exception as exc:
                logger.warning("Redis unavailable, running without cache: %s", exc)
                self._redis = None
        return self._redis

    async def _get_http_client(self) -> httpx.AsyncClient:
        if self._http_client is None or self._http_client.is_closed:
            self._http_client = httpx.AsyncClient(timeout=30.0)
        return self._http_client

    # ── Cache helpers ─────────────────────────────────────────────────────────
    async def _cache_get(self, key: str) -> Optional[Dict]:
        redis = await self._get_redis()
        if redis is None:
            return None
        try:
            raw = await redis.get(key)
            return json.loads(raw) if raw else None
        except Exception:
            return None

    async def _cache_set(self, key: str, data: Dict) -> None:
        redis = await self._get_redis()
        if redis is None:
            return
        try:
            await redis.setex(key, self.CACHE_TTL, json.dumps(data, default=str))
        except Exception as exc:
            logger.debug("Cache write failed: %s", exc)

    # ── Open-Meteo fetch ──────────────────────────────────────────────────────
    async def _fetch_open_meteo(
        self, lat: float, lon: float, state: str
    ) -> Optional[Dict]:
        """Fetch current weather from Open-Meteo for the given coordinates."""
        url = f"{settings.OPEN_METEO_BASE_URL}/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": _OPEN_METEO_VARIABLES,
            "timezone": "Asia/Kolkata",
            "forecast_days": 1,
        }
        try:
            client = await self._get_http_client()
            response = await client.get(url, params=params)
            response.raise_for_status()
            raw = response.json()

            current = raw.get("current", {})
            temperature = current.get("temperature_2m")
            humidity = current.get("relative_humidity_2m")
            rainfall = current.get("precipitation", 0.0)
            wind_speed = current.get("wind_speed_10m", 0.0)
            pressure = current.get("surface_pressure")
            heat_index = current.get("apparent_temperature")
            wmo_code = current.get("weathercode", 0)

            aqi = _estimate_aqi(
                temperature or 30.0,
                humidity or 60.0,
                wind_speed or 10.0,
                rainfall or 0.0,
                state,
            )

            return {
                "state": state,
                "city": INDIAN_STATES[state]["capital"],
                "latitude": lat,
                "longitude": lon,
                "temperature": round(temperature, 2) if temperature is not None else None,
                "humidity": round(float(humidity), 2) if humidity is not None else None,
                "rainfall": round(rainfall, 2),
                "wind_speed": round(wind_speed, 2),
                "pressure": round(pressure, 2) if pressure is not None else None,
                "aqi": aqi,
                "heat_index": round(heat_index, 2) if heat_index is not None else None,
                "weather_condition": _WMO_CODE_MAP.get(wmo_code, "Unknown"),
                "recorded_at": datetime.now(timezone.utc).isoformat(),
                "source": "open-meteo",
            }
        except httpx.HTTPStatusError as exc:
            logger.error("Open-Meteo HTTP %s for %s: %s", exc.response.status_code, state, exc)
        except Exception as exc:
            logger.error("Open-Meteo fetch error for %s: %s", state, exc)
        return None

    # ── Public API ────────────────────────────────────────────────────────────
    async def get_state_weather(self, state: str) -> Optional[Dict]:
        """
        Return current weather for a single state.
        Tries Redis cache first; falls back to live API call.
        """
        if state not in INDIAN_STATES:
            return None

        cache_key = f"{self.CACHE_PREFIX}{state}"
        cached = await self._cache_get(cache_key)
        if cached:
            logger.debug("Cache HIT for %s", state)
            return cached

        coords = INDIAN_STATES[state]
        data = await self._fetch_open_meteo(coords["lat"], coords["lon"], state)
        if data:
            await self._cache_set(cache_key, data)
        return data

    async def get_all_states_weather(self) -> List[Dict]:
        """
        Return current weather for ALL Indian states.
        Uses concurrent requests (up to 10 at a time) with per-state caching.
        """
        import asyncio

        # Semaphore limits concurrent HTTP connections
        sem = asyncio.Semaphore(10)

        async def fetch_with_sem(state: str) -> Optional[Dict]:
            async with sem:
                return await self.get_state_weather(state)

        tasks = [fetch_with_sem(state) for state in INDIAN_STATES]
        results = await asyncio.gather(*tasks, return_exceptions=False)
        return [r for r in results if r is not None]

    async def invalidate_cache(self, state: Optional[str] = None) -> None:
        """Manually invalidate cache for one state or all states."""
        redis = await self._get_redis()
        if redis is None:
            return
        if state:
            await redis.delete(f"{self.CACHE_PREFIX}{state}")
        else:
            keys = await redis.keys(f"{self.CACHE_PREFIX}*")
            if keys:
                await redis.delete(*keys)

    async def close(self) -> None:
        """Gracefully close HTTP and Redis connections."""
        if self._http_client and not self._http_client.is_closed:
            await self._http_client.aclose()
        if self._redis:
            await self._redis.aclose()


# Singleton instance used across the application
weather_service = WeatherService()
