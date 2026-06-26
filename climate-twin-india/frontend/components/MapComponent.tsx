'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Circle, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { INDIAN_STATES } from '@/utils/states_coords'

// Fix Leaflet marker icon asset paths in Next.js production builds
const fixLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

// Custom Leaflet styling helper to re-center map if state changes
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

interface MapComponentProps {
  weatherData: any[]
  activeParameter: 'temperature' | 'rainfall' | 'humidity' | 'wind_speed' | 'aqi' | 'heat_index'
  onStateSelect: (stateName: string) => void
  selectedState: string | null
}

export default function MapComponent({
  weatherData,
  activeParameter,
  onStateSelect,
  selectedState,
}: MapComponentProps) {
  const [mapCenter] = useState<[number, number]>([22.5726, 78.9629]) // Center of India
  const [mapZoom] = useState<number>(5)
  const [radarPath, setRadarPath] = useState<string | null>(null)

  useEffect(() => {
    fixLeafletIcons()
  }, [])

  // Fetch latest RainViewer radar timestamp path when looking at rainfall
  useEffect(() => {
    if (activeParameter === 'rainfall') {
      fetch('https://api.rainviewer.com/public/weather-maps.json')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.radar && data.radar.past && data.radar.past.length > 0) {
            const latest = data.radar.past[data.radar.past.length - 1]
            setRadarPath(latest.path)
          }
        })
        .catch((err) => console.error('Failed to load RainViewer radar path', err))
    }
  }, [activeParameter])

  // Helper to color circles based on selected climate parameter
  const getCircleColor = (val: number, param: string): string => {
    if (param === 'temperature') {
      if (val > 40) return '#FF2D55' // Red Hot
      if (val > 35) return '#FF6B35' // Orange
      if (val > 25) return '#FFC800' // Yellow
      return '#00FF88' // Green / Cool
    }
    if (param === 'rainfall') {
      if (val > 30) return '#6366F1' // Indigo / Heavy rain
      if (val > 10) return '#0099FF' // Blue
      if (val > 1) return '#00D4FF' // Cyan
      return '#4A6B85' // Dry
    }
    if (param === 'aqi') {
      if (val > 300) return '#FF2D55' // Severe (Red)
      if (val > 150) return '#FF6B35' // High (Orange)
      if (val > 50) return '#FFC800' // Moderate (Yellow)
      return '#00FF88' // Good (Green)
    }
    if (param === 'heat_index') {
      if (val > 45) return '#FF2D55' // Danger (Red)
      if (val > 38) return '#FF6B35' // Extreme Caution (Orange)
      return '#00D4FF' // Safe (Cyan)
    }
    if (param === 'wind_speed') {
      if (val > 22) return '#FFC800' // Strong wind (Yellow)
      if (val > 12) return '#00FFFF' // Moderate wind (Cyan)
      return '#0099FF' // Gentle breeze (Blue)
    }
    if (param === 'humidity') {
      if (val > 75) return '#6366F1' // Very humid (Indigo)
      if (val > 50) return '#0099FF' // Humid (Blue)
      return '#00FF88' // Dry (Green)
    }
    // Default fallback
    return '#00D4FF'
  };

  const getParameterUnit = (param: string): string => {
    switch (param) {
      case 'temperature':
      case 'heat_index':
        return '°C'
      case 'rainfall':
        return ' mm'
      case 'humidity':
        return '%'
      case 'wind_speed':
        return ' km/h'
      case 'aqi':
        return ''
      default:
        return ''
    }
  }

  // Helper to dynamically build animated wind SVG icons based on wind velocity
  const createWindIcon = (speed: number) => {
    // Shorter duration = faster movement
    const duration = Math.max(0.6, Math.min(2.5, 20 / (speed || 5)))
    return L.divIcon({
      className: 'wind-icon-container',
      html: `
        <svg width="60" height="30" viewBox="0 0 60 30" style="overflow: visible; transform: rotate(-10deg);">
          <path d="M 0 8 Q 20 0 60 8" fill="none" stroke="#00D4FF" stroke-width="1.2" class="wind-line" style="animation-duration: ${duration}s;" />
          <path d="M 8 18 Q 28 10 52 18" fill="none" stroke="#00FF88" stroke-width="1.2" class="wind-line" style="animation-duration: ${duration * 1.2}s; animation-delay: 0.2s;" />
          <path d="M 4 26 Q 24 18 56 26" fill="none" stroke="#6366F1" stroke-width="1.2" class="wind-line" style="animation-duration: ${duration * 0.8}s; animation-delay: 0.4s;" />
        </svg>
      `,
      iconSize: [60, 30],
      iconAnchor: [30, 15],
    })
  }

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-dark-border shadow-2xl z-20">
      {/* SVG Blur Filter for Heatmap circles */}
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
        <defs>
          <filter id="heat-blur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="55" />
            <feColorMatrix type="matrix" values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 2.2 -0.1" />
          </filter>
        </defs>
      </svg>

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full"
        zoomControl={true}
        attributionControl={false}
      >
        {/* Dark satellite-inspired futuristic tile layer (CartoDB Dark Matter) */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />

        {/* Live RainViewer Radar Tile Layer for continuous rainfall maps (Zoom Earth style) */}
        {activeParameter === 'rainfall' && radarPath && (
          <TileLayer
            url={`https://tilecache.rainviewer.com${radarPath}/256/{z}/{x}/{y}/2/1_1.png`}
            opacity={0.65}
            zIndex={5}
          />
        )}

        {selectedState && INDIAN_STATES[selectedState] && (
          <ChangeView
            center={[INDIAN_STATES[selectedState].lat, INDIAN_STATES[selectedState].lon]}
            zoom={6}
          />
        )}

        {/* 1. Heatmap Blur Layer (Underneath) - Using geographical Circles so they scale when zooming */}
        {activeParameter !== 'rainfall' && weatherData.map((stateInfo) => {
          const stateCoords = INDIAN_STATES[stateInfo.state]
          if (!stateCoords) return null

          const val = stateInfo[activeParameter] || 0
          const color = getCircleColor(val, activeParameter)

          // Geographical radius in meters (350 km) so they overlap and cover all districts/cities when zooming in
          const geoRadiusMeters = 350000

          return (
            <Circle
              key={`heat-${stateInfo.state}`}
              center={[stateCoords.lat, stateCoords.lon]}
              radius={geoRadiusMeters}
              fillColor={color}
              stroke={false}
              fillOpacity={0.65}
              className="heatmap-node"
            />
          )
        })}

        {/* 1.5 Animated Wind Streaks (Underneath points, active only in Wind Speed view) */}
        {activeParameter === 'wind_speed' && weatherData.map((stateInfo) => {
          const stateCoords = INDIAN_STATES[stateInfo.state]
          if (!stateCoords) return null

          return (
            <Marker
              key={`wind-anim-${stateInfo.state}`}
              position={[stateCoords.lat, stateCoords.lon]}
              icon={createWindIcon(stateInfo.wind_speed)}
              interactive={false}
              zIndexOffset={-50}
            />
          )
        })}

        {/* 2. Interactive Points Layer (On Top) */}
        {weatherData.map((stateInfo) => {
          const stateCoords = INDIAN_STATES[stateInfo.state]
          if (!stateCoords) return null

          const val = stateInfo[activeParameter] || 0
          const color = getCircleColor(val, activeParameter)
          const isSelected = selectedState === stateInfo.state

          return (
            <CircleMarker
              key={`point-${stateInfo.state}`}
              center={[stateCoords.lat, stateCoords.lon]}
              radius={isSelected ? 10 : 6}
              fillColor={color}
              color={isSelected ? '#FFFFFF' : '#050B14'}
              weight={isSelected ? 2.5 : 1}
              opacity={0.9}
              fillOpacity={0.95}
              eventHandlers={{
                click: () => onStateSelect(stateInfo.state),
              }}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-orbitron font-bold text-neon-blue text-sm mb-0.5">
                    {stateInfo.state}
                  </h3>
                  <p className="text-[10px] text-[#8BB8D4] mb-2">
                    Capital: <span className="text-[#E8F4FD]">{stateInfo.city}</span>
                  </p>

                  {/* Prominently highlight the currently selected climate layer value */}
                  <div className="my-2 p-2 bg-[#050B14]/80 rounded-lg border border-dark-border/60 text-center">
                    <span className="text-[9px] text-[#8BB8D4] block uppercase tracking-wider font-semibold">
                      {activeParameter.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-extrabold text-neon-blue">
                      {val}{getParameterUnit(activeParameter)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] mt-2 pt-2 border-t border-dark-border">
                    <div>
                      <span className="text-gray-400">Temp:</span>{' '}
                      <span className="font-semibold text-[#E8F4FD]">{stateInfo.temperature}°C</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Rain:</span>{' '}
                      <span className="font-semibold text-[#E8F4FD]">{stateInfo.rainfall}mm</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Wind:</span>{' '}
                      <span className="font-semibold text-[#E8F4FD]">{stateInfo.wind_speed}km/h</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Humidity:</span>{' '}
                      <span className="font-semibold text-[#E8F4FD]">{stateInfo.humidity}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">AQI:</span>{' '}
                      <span className="font-semibold text-neon-green">{stateInfo.aqi}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Feels Like:</span>{' '}
                      <span className="font-semibold text-[#E8F4FD]">{stateInfo.heat_index}°C</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onStateSelect(stateInfo.state)}
                    className="w-full mt-3.5 text-center text-[9px] uppercase font-bold tracking-widest text-[#050B14] bg-neon-blue py-1.5 rounded-lg hover:bg-neon-cyan transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}
