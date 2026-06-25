'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { agriApi } from '@/utils/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import GlassCard from '@/components/ui/GlassCard'
import RiskMeter from '@/components/ui/RiskMeter'
import { Wheat, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import { INDIAN_STATES } from '@/utils/states_coords'

export default function AgriculturePage() {
  const [selectedState, setSelectedState] = useState<string>('Uttar Pradesh')
  const [cropAnalysis, setCropAnalysis] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function loadAgriData() {
      setLoading(true)
      try {
        const data = await agriApi.getStateSuitability(selectedState)
        setCropAnalysis(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadAgriData()
  }, [selectedState])

  const getEffectColor = (effect: string) => {
    if (effect === 'positive') return 'text-neon-green bg-neon-green/10 border-neon-green/20'
    if (effect === 'negative') return 'text-accent-red bg-accent-red/10 border-accent-red/20'
    return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 z-10 relative">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-orbitron font-extrabold text-white flex items-center gap-2">
            <Wheat className="text-neon-green animate-pulse" />
            <span>Agriculture Impact Analysis</span>
          </h1>
          <p className="text-sm text-[#8BB8D4] mt-1">
            Microclimatic crop suitability indexing and weather hazard mitigation models to secure seasonal crop yields.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Select Region Node:</span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="input-neon text-xs py-2 w-48 font-semibold"
          >
            {Object.keys(INDIAN_STATES).map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center"><LoadingSpinner /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cropAnalysis.map((crop) => {
            const isSuitable = crop.suitability_score >= 0.75
            return (
              <motion.div
                key={crop.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard className="p-6 h-full flex flex-col gap-4 border border-dark-border relative overflow-hidden group">
                  
                  {/* Status indicator pill */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-orbitron font-extrabold text-white flex items-center gap-2">
                        <span>{crop.crop_name}</span>
                        {isSuitable ? (
                          <CheckCircle2 className="text-neon-green" size={18} />
                        ) : (
                          <AlertCircle className="text-accent-orange" size={18} />
                        )}
                      </h2>
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest block mt-0.5">
                        State Target: {crop.state}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block mb-1">Suitability Index</span>
                      <span className={`text-xl font-orbitron font-extrabold ${
                        isSuitable ? 'text-neon-green' : 'text-accent-orange'
                      }`}>
                        {(crop.suitability_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Suitability score bar */}
                  <div className="w-full bg-[#050B14] rounded-full h-2 overflow-hidden border border-dark-border/40 my-1">
                    <div
                      className={`h-full rounded-full ${
                        isSuitable
                          ? 'bg-gradient-to-r from-neon-green to-[#10b981]'
                          : 'bg-gradient-to-r from-accent-orange to-amber-500'
                      }`}
                      style={{ width: `${crop.suitability_score * 100}%` }}
                    />
                  </div>

                  {/* Meteorological factors and Crop Risk Score */}
                  <div className="grid grid-cols-3 gap-3 my-2 text-xs">
                    <div className="flex flex-col items-center p-2.5 bg-[#050B14]/40 rounded-xl border border-dark-border/30">
                      <span className="text-gray-400 block mb-1 text-[10px]">Rainfall Effect</span>
                      <span className={`font-bold px-2 py-0.5 rounded border text-[10px] uppercase ${getEffectColor(crop.rainfall_effect)}`}>
                        {crop.rainfall_effect}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2.5 bg-[#050B14]/40 rounded-xl border border-dark-border/30">
                      <span className="text-gray-400 block mb-1 text-[10px]">Temperature Effect</span>
                      <span className={`font-bold px-2 py-0.5 rounded border text-[10px] uppercase ${getEffectColor(crop.temperature_effect)}`}>
                        {crop.temperature_effect}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2.5 bg-[#050B14]/40 rounded-xl border border-dark-border/30">
                      <span className="text-gray-400 block mb-1 text-[10px]">Crop Risk Index</span>
                      <span className={`font-bold font-orbitron ${
                        crop.risk_score > 0.6 ? 'text-accent-red' : 'text-neon-green'
                      }`}>
                        {(crop.risk_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Recommendation details */}
                  <div className="flex-1 mt-2 p-3.5 bg-[#050B14]/60 border border-dark-border rounded-xl">
                    <span className="text-[10px] text-neon-green font-bold font-orbitron tracking-widest uppercase block mb-1.5">
                      Agronomist AI Advisory
                    </span>
                    <p className="text-xs text-gray-200 leading-relaxed font-medium">
                      {crop.recommendation}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
