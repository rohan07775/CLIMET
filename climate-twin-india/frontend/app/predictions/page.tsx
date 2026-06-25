'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { predictApi } from '@/utils/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import GlassCard from '@/components/ui/GlassCard'
import StatBadge from '@/components/ui/StatBadge'
import RiskMeter from '@/components/ui/RiskMeter'
import { Brain, Sliders, Calendar, Droplets, Thermometer, CloudLightning } from 'lucide-react'
import { INDIAN_STATES } from '@/utils/states_coords'

export default function PredictionsPage() {
  const [selectedState, setSelectedState] = useState<string>('Delhi')
  const [predictions, setPredictions] = useState<any>(null)
  const [monsoon, setMonsoon] = useState<any>(null)
  const [loadingForecast, setLoadingForecast] = useState<boolean>(true)
  const [loadingMonsoon, setLoadingMonsoon] = useState<boolean>(true)

  // Simulation Sliders State (Counterfactual Simulator)
  const [forcingOffset, setForcingOffset] = useState<number>(0.0)
  const [precipFactor, setPrecipFactor] = useState<number>(1.0)

  useEffect(() => {
    async function loadForecast() {
      setLoadingForecast(true)
      try {
        const data = await predictApi.get7Day(selectedState)
        setPredictions(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingForecast(false)
      }
    }
    loadForecast()
  }, [selectedState])

  useEffect(() => {
    async function loadMonsoon() {
      try {
        const data = await predictApi.getMonsoon()
        setMonsoon(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingMonsoon(false)
      }
    }
    loadMonsoon()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 z-10 relative">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-orbitron font-extrabold text-white flex items-center gap-2">
          <Brain className="text-neon-purple animate-pulse" />
          <span>AI Climate Prediction Engine</span>
        </h1>
        <p className="text-sm text-[#8BB8D4] mt-1">
          Ensemble prediction networks (XGBoost, Random Forest, LSTM, Prophet) projecting local and national climate telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sidebar: State Select and Monsoon Onset */}
        <div className="flex flex-col gap-6">
          <GlassCard className="p-5 flex flex-col gap-4">
            <h2 className="text-xs font-bold font-orbitron text-neon-purple tracking-wider uppercase">
              Target Selection
            </h2>
            <div>
              <label className="text-xs text-gray-400 block mb-2">Select State node:</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="input-neon text-sm py-2.5"
              >
                {Object.keys(INDIAN_STATES).map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </GlassCard>

          {/* Monsoon Tracker */}
          <GlassCard className="p-5 flex flex-col gap-4 border-l-4 border-l-neon-purple">
            <h2 className="text-xs font-bold font-orbitron text-neon-purple tracking-wider uppercase flex items-center gap-1.5">
              <Calendar size={14} />
              <span>South-West Monsoon Outlook</span>
            </h2>
            {loadingMonsoon ? (
              <div className="flex justify-center p-6"><LoadingSpinner /></div>
            ) : (
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between border-b border-dark-border/40 pb-2">
                  <span className="text-[#8BB8D4]">Arrival (Kerala Coast):</span>
                  <span className="font-bold text-white font-orbitron">
                    {new Date(monsoon?.arrival_date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                    })}
                  </span>
                </div>
                <div className="flex justify-between border-b border-dark-border/40 pb-2">
                  <span className="text-[#8BB8D4]">Rainfall Profile:</span>
                  <span className="font-bold text-neon-green">{monsoon?.rainfall_intensity}</span>
                </div>
                <div className="flex justify-between border-b border-dark-border/40 pb-2">
                  <span className="text-[#8BB8D4]">Average Rain (Proj):</span>
                  <span className="font-bold text-white">{monsoon?.seasonal_rainfall_mm} mm</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-[#8BB8D4]">Prophet Confidence:</span>
                  <span className="font-bold text-neon-purple font-orbitron">{(monsoon?.confidence_score * 100).toFixed(0)}%</span>
                </div>
                <div className="bg-[#050B14]/40 p-3 rounded-xl border border-dark-border/40 mt-2">
                  <span className="text-[10px] text-neon-purple font-bold block mb-1">Active Alerts:</span>
                  <p className="text-xs text-gray-300 italic">{monsoon?.alerts[0]}</p>
                </div>
              </div>
            )}
          </GlassCard>

          {/* Digital Twin Counterfactual Simulation Panel */}
          <GlassCard className="p-5 flex flex-col gap-4 border-l-4 border-l-neon-cyan">
            <h2 className="text-xs font-bold font-orbitron text-neon-cyan tracking-wider uppercase flex items-center gap-1.5">
              <Sliders size={14} />
              <span>Climate Simulation Controls</span>
            </h2>
            <p className="text-xs text-[#8BB8D4] leading-relaxed">
              Adjust environmental variables to simulate how greenhouse offsets and rainfall shifts impact risk models.
            </p>
            <div className="flex flex-col gap-4 mt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">GHG Warming Offset:</span>
                  <span className="font-bold text-white font-orbitron">+{forcingOffset.toFixed(1)}°C</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="4.0"
                  step="0.5"
                  value={forcingOffset}
                  onChange={(e) => setForcingOffset(parseFloat(e.target.value))}
                  className="w-full accent-neon-cyan cursor-pointer bg-dark-border h-1 rounded-lg"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Precipitation Factor:</span>
                  <span className="font-bold text-white font-orbitron">{(precipFactor * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.10"
                  value={precipFactor}
                  onChange={(e) => setPrecipFactor(parseFloat(e.target.value))}
                  className="w-full accent-neon-cyan cursor-pointer bg-dark-border h-1 rounded-lg"
                />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* 7-Day Forecast Telemetry Grid */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-[10px] text-neon-purple font-bold font-orbitron tracking-widest uppercase">
                  Telemetry Prediction Grid ({predictions?.model_used})
                </span>
                <h3 className="text-xl font-orbitron font-extrabold text-white">
                  Next 7-Day Outlook: {selectedState}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block">Avg Confidence</span>
                <span className="text-sm font-bold font-orbitron text-neon-purple">
                  {predictions ? (predictions.confidence_average * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>

            {loadingForecast ? (
              <div className="flex justify-center py-20"><LoadingSpinner /></div>
            ) : (
              <div className="flex flex-col gap-4">
                {predictions?.predictions.map((p: any, idx: number) => {
                  // Apply counterfactual simulation multipliers dynamically
                  const simulatedTemp = roundValue(p.temperature + forcingOffset, 1)
                  const simulatedRainProb = Math.min(100, roundValue(p.rainfall_probability * precipFactor, 0))

                  // Re-calculate risks based on simulated values
                  let heatwaveChance = p.heatwave_chance
                  if (simulatedTemp > 35) {
                    heatwaveChance = Math.min(100, Math.round((simulatedTemp - 35) * 10))
                  }
                  const floodRisk = Math.min(100, Math.round(p.flood_risk * precipFactor))
                  const droughtRisk = Math.min(100, Math.round(p.drought_risk / precipFactor))

                  return (
                    <div
                      key={idx}
                      className="bg-[#0A1628]/60 p-4 rounded-xl border border-dark-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-neon-purple/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-[#050B14] py-1 px-3 rounded-lg text-center font-orbitron min-w-[60px]">
                          <span className="text-[10px] text-gray-400 uppercase block leading-none mb-1">Day</span>
                          <span className="text-sm font-bold text-white">{idx + 1}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400 block">
                            {new Date(p.date).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                          <span className="text-xs text-[#8BB8D4]">Confidence: {(p.confidence_score * 100).toFixed(0)}%</span>
                        </div>
                      </div>

                      {/* Meteorological details */}
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                          <Thermometer size={16} className="text-[#FF2D55]" />
                          <span className="text-sm font-bold font-orbitron">{simulatedTemp}°C</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Droplets size={16} className="text-neon-blue" />
                          <span className="text-sm font-bold font-orbitron">{simulatedRainProb}%</span>
                        </div>
                      </div>

                      {/* Multi-hazard risks list */}
                      <div className="flex flex-wrap gap-2">
                        {heatwaveChance > 40 && (
                          <span className="text-[10px] px-2.5 py-1 bg-accent-orange/15 border border-accent-orange/40 text-accent-orange font-bold uppercase rounded-lg">
                            Heatwave {heatwaveChance}%
                          </span>
                        )}
                        {floodRisk > 40 && (
                          <span className="text-[10px] px-2.5 py-1 bg-neon-blue/15 border border-neon-blue/40 text-neon-blue font-bold uppercase rounded-lg">
                            Flood Risk {floodRisk}%
                          </span>
                        )}
                        {droughtRisk > 40 && (
                          <span className="text-[10px] px-2.5 py-1 bg-[#6366F1]/15 border border-[#6366F1]/40 text-[#6366F1] font-bold uppercase rounded-lg">
                            Drought Risk {droughtRisk}%
                          </span>
                        )}
                        {heatwaveChance <= 40 && floodRisk <= 40 && droughtRisk <= 40 && (
                          <span className="text-[10px] px-2.5 py-1 bg-neon-green/15 border border-neon-green/40 text-neon-green font-bold uppercase rounded-lg">
                            Stable Conditions
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </GlassCard>
        </div>

      </div>
    </div>
  )
}

function roundValue(val: number, decimals: number) {
  return Number(Math.round(Number(val + 'e' + decimals)) + 'e-' + decimals)
}
