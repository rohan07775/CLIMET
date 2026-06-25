'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { weatherApi } from '@/utils/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import GlassCard from '@/components/ui/GlassCard'
import StatBadge from '@/components/ui/StatBadge'
import { Globe, Thermometer, Droplets, Wind, ShieldAlert, Sparkles } from 'lucide-react'

// Dynamically import the Map component with SSR disabled to prevent Leaflet window reference build crashes
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[650px] bg-dark-card flex items-center justify-center rounded-2xl border border-dark-border">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner />
        <span className="text-sm text-[#8BB8D4] font-orbitron">Initializing Geospatial Layers...</span>
      </div>
    </div>
  ),
})

type ParamType = 'temperature' | 'rainfall' | 'humidity' | 'wind_speed' | 'aqi' | 'heat_index'

export default function ClimateTwinPage() {
  const [weatherData, setWeatherData] = useState<any[]>([])
  const [selectedState, setSelectedState] = useState<string | null>('Delhi')
  const [activeParam, setActiveParam] = useState<ParamType>('temperature')
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await weatherApi.getCurrent()
        setWeatherData(data)
      } catch (err) {
        console.error('Failed to load current weather', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Find weather record for the currently selected state
  const selectedWeather = weatherData.find((w) => w.state === selectedState)

  const parameters = [
    { key: 'temperature', label: 'Temperature', icon: Thermometer },
    { key: 'rainfall', label: 'Precipitation', icon: Droplets },
    { key: 'humidity', label: 'Humidity', icon: Droplets },
    { key: 'wind_speed', label: 'Wind Speed', icon: Wind },
    { key: 'aqi', label: 'Air Quality (AQI)', icon: Sparkles },
    { key: 'heat_index', label: 'Heat Index', icon: Thermometer },
  ]

  const getParameterLabel = (param: string) => {
    const found = parameters.find((p) => p.key === param)
    return found ? found.label : param
  }

  if (loading) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center bg-dark-bg gap-4">
        <LoadingSpinner />
        <span className="text-[#8BB8D4] font-orbitron font-bold uppercase tracking-widest text-sm">
          Loading India Climate Twin...
        </span>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 z-10 relative">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-orbitron font-extrabold text-white flex items-center gap-2">
            <Globe className="text-neon-blue animate-pulse" />
            <span>India Climate Twin Dashboard</span>
          </h1>
          <p className="text-sm text-[#8BB8D4] mt-1">
            Real-time geospatial twin mapping microclimate variables across 36 states and union territories.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg text-xs font-semibold text-neon-green">
          <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
          <span>REDIS CACHE ACTIVE: UPDATES EVERY 15 MIN</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Map Control Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <GlassCard className="p-5 flex flex-col gap-4">
            <h2 className="text-xs font-bold font-orbitron text-neon-blue tracking-wider uppercase">
              Climate Layer Overlays
            </h2>
            <div className="flex flex-col gap-2">
              {parameters.map((p) => {
                const Icon = p.icon
                const isActive = activeParam === p.key
                return (
                  <button
                    key={p.key}
                    onClick={() => setActiveParam(p.key as ParamType)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left text-sm ${
                      isActive
                        ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/40 shadow-[0_0_15px_rgba(0,212,255,0.1)]'
                        : 'text-[#8BB8D4] border border-transparent hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="font-semibold">{p.label}</span>
                  </button>
                )
              })}
            </div>
          </GlassCard>

          {/* Selected State Telemetry Card */}
          {selectedWeather && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-5 flex flex-col gap-4 border-l-4 border-l-neon-blue">
                <div>
                  <span className="text-[10px] text-neon-blue font-bold font-orbitron tracking-widest uppercase">
                    Selected Node Telemetry
                  </span>
                  <h3 className="text-2xl font-orbitron font-extrabold text-white mt-1">
                    {selectedWeather.state}
                  </h3>
                  <p className="text-xs text-[#8BB8D4]">{selectedWeather.city} (Capital)</p>
                </div>

                <div className="grid grid-cols-2 gap-4 my-2">
                  <div className="bg-[#050B14]/40 p-3 rounded-xl border border-dark-border/40">
                    <span className="text-[10px] text-gray-400 block mb-1">Temperature</span>
                    <span className="text-lg font-bold font-orbitron text-white">
                      {selectedWeather.temperature}°C
                    </span>
                  </div>
                  <div className="bg-[#050B14]/40 p-3 rounded-xl border border-dark-border/40">
                    <span className="text-[10px] text-gray-400 block mb-1">Precipitation</span>
                    <span className="text-lg font-bold font-orbitron text-white">
                      {selectedWeather.rainfall} mm
                    </span>
                  </div>
                  <div className="bg-[#050B14]/40 p-3 rounded-xl border border-dark-border/40">
                    <span className="text-[10px] text-gray-400 block mb-1">Relative Humidity</span>
                    <span className="text-lg font-bold font-orbitron text-white">
                      {selectedWeather.humidity}%
                    </span>
                  </div>
                  <div className="bg-[#050B14]/40 p-3 rounded-xl border border-dark-border/40">
                    <span className="text-[10px] text-gray-400 block mb-1">Air Quality (AQI)</span>
                    <span className={`text-lg font-bold font-orbitron ${
                      selectedWeather.aqi > 150 ? 'text-accent-red' : 'text-neon-green'
                    }`}>
                      {selectedWeather.aqi}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-dark-border">
                  <div className="flex justify-between text-xs text-[#8BB8D4]">
                    <span>Feels Like (Heat Index):</span>
                    <span className="font-bold text-white">{selectedWeather.heat_index}°C</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#8BB8D4]">
                    <span>Wind Velocity:</span>
                    <span className="font-bold text-white">{selectedWeather.wind_speed} km/h</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#8BB8D4]">
                    <span>Barometric Pressure:</span>
                    <span className="font-bold text-white">{selectedWeather.pressure} hPa</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>

        {/* Dynamic Geospatial Map */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex items-center justify-between glass py-2 px-4 text-xs text-[#8BB8D4]">
            <span>Active Overlay: <strong>{getParameterLabel(activeParam)}</strong></span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-neon-green rounded-full opacity-60" /> Good / Safe
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-accent-orange rounded-full opacity-60" /> Warning
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-accent-red rounded-full opacity-60" /> Critical / Severe
              </span>
            </div>
          </div>

          <div className="h-[600px] w-full">
            <MapComponent
              weatherData={weatherData}
              activeParameter={activeParam}
              onStateSelect={(stateName) => setSelectedState(stateName)}
              selectedState={selectedState}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
