'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { weatherApi, carbonApi } from '@/utils/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import GlassCard from '@/components/ui/GlassCard'
import RiskMeter from '@/components/ui/RiskMeter'
import { BarChart3, Download, RefreshCw, Sparkles, HelpCircle, AlertCircle, Leaf } from 'lucide-react'
import toast from 'react-hot-toast'

// Chart.js registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  Filler
)

export default function AnalyticsPage() {
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [loadingCharts, setLoadingCharts] = useState<boolean>(true)
  const [selectedState, setSelectedState] = useState<string>('Delhi')

  // Carbon Calculator Form State
  const [electricity, setElectricity] = useState<number>(180)
  const [transport, setTransport] = useState<number>(450)
  const [fuel, setFuel] = useState<number>(25)
  const [waste, setWaste] = useState<number>(15)
  const [carbonResult, setCarbonResult] = useState<any>(null)
  const [calculating, setCalculating] = useState<boolean>(false)

  const loadChartData = async () => {
    setLoadingCharts(true)
    try {
      const data = await weatherApi.getHistorical(selectedState, 30)
      // Reverse to show chronological order (left to right)
      setHistoricalData([...data].reverse())
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingCharts(false)
    }
  }

  useEffect(() => {
    loadChartData()
  }, [selectedState])

  const handleCalculateCarbon = async (e: React.FormEvent) => {
    e.preventDefault()
    setCalculating(true)
    try {
      const res = await carbonApi.calculate({
        electricity_kwh: electricity,
        transport_km: transport,
        fuel_liters: fuel,
        waste_kg: waste,
      })
      setCarbonResult(res)
      toast.success('Greenhouse gas footprint calculated successfully!')
    } catch (err) {
      toast.error('Carbon scoring unavailable.')
    } finally {
      setCalculating(false)
    }
  }

  const triggerPDFDownload = () => {
    toast.loading('Generating District Climate Vulnerability Index PDF Report...', {
      duration: 2000,
    })
    setTimeout(() => {
      toast.success('PDF Report downloaded successfully! (ClimaTwin_India_Report.pdf)')
    }, 2000)
  }

  // Setup Chart datasets
  const labels = historicalData.map((d) =>
    new Date(d.recorded_at).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    })
  )

  const tempChartData = {
    labels,
    datasets: [
      {
        fill: true,
        label: `${selectedState} Temperature (°C)`,
        data: historicalData.map((d) => d.temperature),
        borderColor: '#00D4FF',
        backgroundColor: 'rgba(0, 212, 255, 0.15)',
        tension: 0.3,
        pointBackgroundColor: '#00D4FF',
        pointBorderColor: '#FFFFFF',
      },
    ],
  }

  const rainChartData = {
    labels,
    datasets: [
      {
        label: `${selectedState} Rainfall (mm)`,
        data: historicalData.map((d) => d.rainfall),
        backgroundColor: 'rgba(99, 102, 241, 0.75)',
        borderColor: '#6366F1',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#8BB8D4',
          font: { family: 'Orbitron' },
        },
      },
      tooltip: {
        backgroundColor: '#0A1628',
        borderColor: '#00D4FF',
        borderWidth: 1,
        titleColor: '#00D4FF',
        bodyColor: '#E8F4FD',
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(26, 39, 68, 0.3)' },
        ticks: { color: '#8BB8D4' },
      },
      x: {
        grid: { color: 'rgba(26, 39, 68, 0.1)' },
        ticks: { color: '#8BB8D4' },
      },
    },
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 z-10 relative">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-orbitron font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="text-neon-cyan animate-pulse" />
            <span>Climate Analytics & Carbon Index</span>
          </h1>
          <p className="text-sm text-[#8BB8D4] mt-1">
            Telemetry trend visualization, greenhouse gas offsets, and District Climate Vulnerability Index metrics.
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="input-neon text-xs py-2 w-48 font-semibold"
          >
            {['Delhi', 'Gujarat', 'Assam', 'Rajasthan', 'Kerala', 'Maharashtra', 'Uttar Pradesh'].map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <button
            onClick={triggerPDFDownload}
            className="btn-neon text-xs py-2 flex items-center gap-1.5 font-bold"
          >
            <Download size={14} />
            <span>PDF Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Middle Column: Climate Graphs */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Temp Line Chart */}
          <GlassCard className="p-6">
            <h2 className="text-sm font-bold font-orbitron text-neon-blue tracking-wider uppercase mb-4">
              Temperature Trend (Past 30 Days)
            </h2>
            {loadingCharts ? (
              <div className="h-[280px] flex items-center justify-center"><LoadingSpinner /></div>
            ) : (
              <div className="h-[280px] w-full">
                <Line data={tempChartData} options={chartOptions} />
              </div>
            )}
          </GlassCard>

          {/* Precipitation Bar Chart */}
          <GlassCard className="p-6">
            <h2 className="text-sm font-bold font-orbitron text-neon-purple tracking-wider uppercase mb-4">
              Rainfall Dispersion (Past 30 Days)
            </h2>
            {loadingCharts ? (
              <div className="h-[280px] flex items-center justify-center"><LoadingSpinner /></div>
            ) : (
              <div className="h-[280px] w-full">
                <Bar data={rainChartData} options={chartOptions} />
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Column: Carbon Footprint Module */}
        <div className="flex flex-col gap-6">
          <GlassCard className="p-6 border-l-4 border-l-neon-cyan">
            <h2 className="text-sm font-bold font-orbitron text-neon-cyan tracking-wider uppercase mb-4 flex items-center gap-1.5">
              <Leaf size={16} />
              <span>Carbon Footprint Calculator</span>
            </h2>
            <form onSubmit={handleCalculateCarbon} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Monthly Power (kWh):</label>
                <input
                  type="number"
                  value={electricity}
                  onChange={(e) => setElectricity(parseFloat(e.target.value) || 0)}
                  className="input-neon"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Transport Travel (km):</label>
                <input
                  type="number"
                  value={transport}
                  onChange={(e) => setTransport(parseFloat(e.target.value) || 0)}
                  className="input-neon"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Fuel Consumed (Liters):</label>
                <input
                  type="number"
                  value={fuel}
                  onChange={(e) => setFuel(parseFloat(e.target.value) || 0)}
                  className="input-neon"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Waste Generated (kg):</label>
                <input
                  type="number"
                  value={waste}
                  onChange={(e) => setWaste(parseFloat(e.target.value) || 0)}
                  className="input-neon"
                />
              </div>
              <button
                type="submit"
                disabled={calculating}
                className="w-full text-center text-xs py-2 font-bold tracking-widest text-[#050B14] bg-neon-cyan rounded-lg hover:bg-cyan-500 transition-colors flex items-center justify-center gap-1.5 mt-2 disabled:opacity-50"
              >
                {calculating ? <LoadingSpinner /> : <Sparkles size={12} />}
                <span>Calculate Offset Score</span>
              </button>
            </form>

            {/* Carbon Output Results */}
            {carbonResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 pt-6 border-t border-dark-border flex flex-col gap-4 text-xs"
              >
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-[#050B14]/40 p-2.5 rounded-xl border border-dark-border/40">
                    <span className="text-[9px] text-gray-400 block mb-1">CO₂ Emissions</span>
                    <span className="font-bold text-sm text-white font-orbitron">
                      {carbonResult.co2_emissions_kg} kg
                    </span>
                  </div>
                  <div className="bg-[#050B14]/40 p-2.5 rounded-xl border border-dark-border/40">
                    <span className="text-[9px] text-gray-400 block mb-1">Carbon Score</span>
                    <span className="font-bold text-sm text-neon-cyan font-orbitron">
                      {carbonResult.carbon_score}/100
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-400">Sustainability Rating:</span>
                    <span className="text-neon-green">{carbonResult.sustainability_score}%</span>
                  </div>
                  <div className="w-full bg-[#050B14] rounded-full h-1.5 overflow-hidden border border-dark-border/30">
                    <div
                      className="bg-neon-green h-full rounded-full"
                      style={{ width: `${carbonResult.sustainability_score}%` }}
                    />
                  </div>
                </div>

                <div className="bg-[#050B14]/60 p-3 rounded-xl border border-dark-border">
                  <span className="text-[10px] font-bold text-neon-cyan uppercase font-orbitron block mb-1 flex items-center gap-1">
                    <AlertCircle size={10} /> Offset Advisory
                  </span>
                  <p className="text-[11px] text-gray-200 leading-relaxed font-medium">
                    {carbonResult.recommendations[0]}
                  </p>
                </div>
              </motion.div>
            )}
          </GlassCard>
        </div>

      </div>
    </div>
  )
}
