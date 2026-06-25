"""
app/routers/carbon.py
──────────────────────────────────────────────────────────────────────────────
Carbon Footprint Router. Calculates CO₂ footprint based on electricity consumption,
transportation, direct fuel use, and waste. Outputs a sustainability score.
"""

from typing import List
from fastapi import APIRouter
from app.schemas.schemas import CarbonCalculationRequest, CarbonCalculationOut

router = APIRouter()


@router.post("/calculate", response_model=CarbonCalculationOut)
async def calculate_carbon_footprint(request: CarbonCalculationRequest):
    """
    Calculates carbon emissions and returns sustainability scores and advisories.
    Emission factors based on Indian averages (e.g. grid coefficient = 0.82 kg/kWh).
    """
    # India Grid Emission Factor: 0.82 kg CO2 / kWh
    co2_electricity = request.electricity_kwh * 0.82
    
    # Average travel footprint: 0.12 kg CO2 / km
    co2_transport = request.transport_km * 0.12
    
    # Fuel combustion: average ~2.5 kg CO2 / Liter
    co2_fuel = request.fuel_liters * 2.5
    
    # Waste breakdown: average ~0.5 kg CO2 / kg of municipal waste
    co2_waste = request.waste_kg * 0.5

    total_co2 = co2_electricity + co2_transport + co2_fuel + co2_waste

    # Sustainability Index computation
    # Benchmark: average urban Indian household is ~400 kg CO2 / month
    # A score of 100 means zero footprint; decreases as emissions increase.
    carbon_score = max(5.0, min(100.0, 100.0 - (total_co2 / 12.0)))
    sustainability_score = max(5.0, min(100.0, carbon_score * 0.95 + 5.0))

    # Compile recommendations
    recommendations: List[str] = []
    if request.electricity_kwh > 250:
        recommendations.append(
            "Your grid power footprint is high. Consider switching to energy-efficient BLDC fans and 5-star BEE rated appliances."
        )
        recommendations.append("Install a solar rooftop panel to offset day-time grid electricity demand.")
        
    if request.transport_km > 500 or request.fuel_liters > 40:
        recommendations.append(
            "Transportation footprint is high. Carpool, switch to Delhi Metro / public transit, or transition to a plug-in Electric Vehicle (EV)."
        )
        recommendations.append("Consider walking or cycling for short utility runs under 2 kilometers.")
        
    if request.waste_kg > 30:
        recommendations.append(
            "Waste footprint is high. Implement dual-bin wet/dry segregation and compost kitchen waste locally."
        )
        recommendations.append("Avoid single-use plastics and buy items with minimal packaging.")

    if not recommendations:
        recommendations.append("Excellent job! Your carbon footprint is well below national thresholds. Keep up the sustainable lifestyle.")

    return CarbonCalculationOut(
        co2_emissions_kg=round(total_co2, 2),
        carbon_score=round(carbon_score, 1),
        sustainability_score=round(sustainability_score, 1),
        recommendations=recommendations,
    )
