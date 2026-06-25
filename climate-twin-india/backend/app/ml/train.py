"""
app/ml/train.py
──────────────────────────────────────────────────────────────────────────────
CLI Training Script. Fetches historical weather observations from the
database, processes them into Pandas DataFrames, runs model training,
and saves the serialized model files.
"""

import argparse
import asyncio
import logging
import pandas as pd
from sqlalchemy import text

from app.database import AsyncSessionLocal
from app.ml.models import (
    XGBoostClimateModel,
    RandomForestDisasterModel,
    TimeSeriesLSTMModel,
    MonsoonProphetModel,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s]: %(message)s")
logger = logging.getLogger(__name__)


async def load_weather_data() -> pd.DataFrame:
    """Loads historical weather data from the database into a Pandas DataFrame."""
    logger.info("Fetching historical weather observations from database...")
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            text("SELECT id, state, temperature, rainfall, humidity, recorded_at FROM weather_data ORDER BY recorded_at ASC")
        )
        rows = result.fetchall()
        
        if not rows:
            raise ValueError("No historical weather readings found in database. Run database seeder first!")
            
        columns = ["id", "state", "temperature", "rainfall", "humidity", "recorded_at"]
        df = pd.DataFrame([dict(zip(columns, row)) for row in rows])
        
        # Ensure correct datatypes
        df["recorded_at"] = pd.to_datetime(df["recorded_at"])
        df["temperature"] = df["temperature"].astype(float)
        df["rainfall"] = df["rainfall"].astype(float)
        df["humidity"] = df["humidity"].astype(float)
        
        logger.info(f"Loaded {len(df)} weather observations.")
        return df


def train_models(df: pd.DataFrame, model_type: str = "all") -> None:
    """Trains specified model or all models."""
    if model_type in ["all", "xgboost"]:
        # Train XGBoost for temperature
        temp_model = XGBoostClimateModel(target="temperature")
        temp_model.train(df)
        
        # Train XGBoost for rainfall
        rain_model = XGBoostClimateModel(target="rainfall")
        rain_model.train(df)
        
    if model_type in ["all", "random_forest"]:
        # Train Random Forest disaster classifier
        rf_model = RandomForestDisasterModel()
        rf_model.train(df)
        
    if model_type in ["all", "lstm"]:
        # Train LSTM sequence neural network
        lstm_model = TimeSeriesLSTMModel()
        lstm_model.train(df)
        
    if model_type in ["all", "prophet"]:
        # Train Prophet seasonal trends model
        prophet_model = MonsoonProphetModel()
        prophet_model.train(df)

    logger.info("Training pipeline execution complete.")


async def main():
    parser = argparse.ArgumentParser(description="ClimaTwin India ML Training Pipeline")
    parser.add_argument(
        "--model",
        type=str,
        default="all",
        choices=["all", "xgboost", "random_forest", "lstm", "prophet"],
        help="Specify which model to retrain (default: all)",
    )
    args = parser.parse_args()
    
    try:
        df = await load_weather_data()
        train_models(df, args.model)
    except Exception as e:
        logger.error(f"Training failed: {e}", exc_info=True)


if __name__ == "__main__":
    asyncio.run(main())
