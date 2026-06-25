"""
app/routers/agri.py
──────────────────────────────────────────────────────────────────────────────
Agriculture Impact Router. Serves crop suitability index scores, risk indices,
and sowing recommendations for Rice, Wheat, Cotton, and Maize.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models.db_models import CropAnalysis
from app.schemas.schemas import CropAnalysisOut
from app.services.weather_service import INDIAN_STATES

router = APIRouter()


@router.get("/state/{state_name}", response_model=List[CropAnalysisOut])
async def get_state_crop_suitability(state_name: str, db: AsyncSession = Depends(get_db)):
    """
    Returns crop suitability analysis (Wheat, Rice, Cotton, Maize) for a state.
    Details the risk score, rainfall/temperature effects, and sowing guidelines.
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
            detail=f"State '{state_name}' not found."
        )

    result = await db.execute(
        select(CropAnalysis)
        .where(CropAnalysis.state == matching_state)
        .order_by(CropAnalysis.suitability_score.desc())
    )
    return result.scalars().all()


@router.get("/all", response_model=List[CropAnalysisOut])
async def get_all_crop_suitability(limit: int = 100, db: AsyncSession = Depends(get_db)):
    """Returns all agricultural suitability indices sorted by score."""
    result = await db.execute(
        select(CropAnalysis).order_by(CropAnalysis.suitability_score.desc()).limit(limit)
    )
    return result.scalars().all()
