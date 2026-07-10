'use client'

import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import { Info, Database, BookOpen, Layers, CheckCircle2, Users, Tv, Instagram, Youtube } from 'lucide-react'

export default function AboutPage() {
  const architectures = [
    { label: 'Ingestion Layer', desc: 'Asynchronous Celery workers pulling hourly Open-Meteo weather parameters, CPCB AQI readings, CWC reservoir hydrology, and INSAT-3D satellite granules.' },
    { label: 'Storage Layer', desc: 'PostgreSQL 15 geospatial database with PostGIS for district polygons, and Redis 7 as the primary TTL weather data and alert cache.' },
    { label: 'ML Ensemble Pipeline', desc: 'Auto-regressive XGBoost models (temperature/rainfall), Bidirectional LSTM (7-day time series sequences), and Meta Prophet (monsoon arrival and seasonality).' },
    { label: 'Presentation UI', desc: 'Next.js 15 App Router styling with neon CSS variables, dynamic Leaflet maps, Chart.js trends, and HTML5 Web Speech API voice support.' },
  ]

  const references = [
    { title: 'Destination Earth Initiative (DestinE)', author: 'European Union (2022)', url: 'https://destination-earth.eu' },
    { title: 'GraphCast: Skillful Medium-Range Global Weather Forecasting', author: 'Google DeepMind, Science (2023)', url: 'https://deepmind.google' },
    { title: 'Pangu-Weather: Accurate 3D Neural Network Meteorology', author: 'Huawei, Nature (2023)', url: 'https://nature.com' },
    { title: 'Sendai Framework for Disaster Risk Reduction (2015–2030)', author: 'United Nations (UNDRR)', url: 'https://undrr.org' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 z-10 relative">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-orbitron font-extrabold text-white flex items-center gap-2">
          <Info className="text-neon-blue animate-pulse" />
          <span>About ClimaTwin India</span>
        </h1>
        <p className="text-sm text-[#8BB8D4] mt-1">
          Technical specifications, system design details, authoritative dataset citations, and active components checklists.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: System Architecture */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Architecture Details */}
          <GlassCard className="hud-panel p-6 border border-[#00D4FF]/20" glowColor="blue">
            <h2 className="text-sm font-bold font-orbitron text-neon-blue tracking-wider uppercase mb-5 flex items-center gap-1.5">
              <Layers size={16} />
              <span>Full-Stack Architecture</span>
            </h2>
            <div className="flex flex-col gap-4">
              {architectures.map((arch, idx) => (
                <div key={idx} className="bg-[#050B14]/40 p-4 rounded-xl border border-dark-border/40">
                  <span className="font-orbitron font-extrabold text-white text-xs uppercase tracking-wide block mb-1">
                    {arch.label}
                  </span>
                  <p className="text-xs text-gray-300 leading-relaxed font-medium">
                    {arch.desc}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Academic References */}
          <GlassCard className="hud-panel hud-corner-braces p-6 border border-[#6366F1]/20" glowColor="purple">
            <h2 className="text-sm font-bold font-orbitron text-neon-purple tracking-wider uppercase mb-5 flex items-center gap-1.5">
              <BookOpen size={16} />
              <span>Literature & Scientific Citations</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {references.map((ref, idx) => (
                <a
                  key={idx}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#050B14]/40 p-4 rounded-xl border border-dark-border/40 hover:border-neon-purple/40 transition-colors block text-xs"
                >
                  <span className="font-bold text-white block mb-1">
                    {ref.title}
                  </span>
                  <span className="text-gray-400 block">{ref.author}</span>
                </a>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: System Status Checklist */}
        <div className="flex flex-col gap-6">
          
          {/* Active components checklist */}
          <GlassCard className="hud-panel p-6 border-l-4 border-l-neon-green" glowColor="green">
            <h2 className="text-sm font-bold font-orbitron text-neon-green tracking-wider uppercase mb-5 flex items-center gap-1.5">
              <Database size={16} />
              <span>System Diagnostics</span>
            </h2>
            <div className="flex flex-col gap-3 text-xs">
              {[
                { name: 'PostgreSQL Geospatial DB (PostGIS)', status: 'Connected' },
                { name: 'Redis Cache (TTL Weather & Logs)', status: 'Active' },
                { name: 'FastAPI REST Server (Port 8000)', status: 'Operational' },
                { name: 'Celery Periodic Ingestion Queue', status: 'Active' },
                { name: 'Google Gemini Chatbot API', status: 'Initialized' },
                { name: 'Twilio SMS Notification Dispatcher', status: 'Ready' },
                { name: 'NextJS App Router (Port 3000)', status: 'Healthy' },
              ].map((comp, idx) => (
                <div
                  key={idx}
                  className="bg-[#050B14]/40 px-3.5 py-3 rounded-lg border border-dark-border/40 flex justify-between items-center"
                >
                  <span className="text-gray-300 font-medium">{comp.name}</span>
                  <span className="flex items-center gap-1 text-neon-green font-bold uppercase tracking-wider text-[10px]">
                    <CheckCircle2 size={12} />
                    <span>{comp.status}</span>
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Development Team */}
          <GlassCard className="hud-panel hud-corner-braces p-6 border-l-4 border-l-neon-blue" glowColor="blue">
            <h2 className="text-sm font-bold font-orbitron text-neon-blue tracking-wider uppercase mb-5 flex items-center gap-1.5">
              <Users size={16} />
              <span>Development Team</span>
            </h2>
            <div className="flex flex-col gap-4 text-xs">
              <div className="bg-[#050B14]/40 p-3 rounded-lg border border-dark-border/40">
                <span className="text-[10px] text-neon-blue font-bold uppercase block mb-1">Project Lead</span>
                <span className="text-sm font-bold text-white">Rohan Patel</span>
              </div>
              <div className="bg-[#050B14]/40 p-3.5 rounded-lg border border-dark-border/40">
                <span className="text-[10px] text-neon-purple font-bold uppercase block mb-1">Team Members</span>
                <div className="flex flex-col gap-1.5 font-semibold text-gray-200 mt-1">
                  <span>• Harshit Pandey</span>
                  <span>• Subham Patel</span>
                  <span>• Rudarraj Parmar</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* The Skyby Media Partner */}
          <GlassCard className="hud-panel p-6 border-l-4 border-l-neon-purple" glowColor="purple">
            <h2 className="text-sm font-bold font-orbitron text-neon-purple tracking-wider uppercase mb-5 flex items-center gap-1.5">
              <Tv size={16} />
              <span>Outreach & Media Partner</span>
            </h2>
            <div className="flex flex-col gap-4 text-xs">
              <div className="bg-[#050B14]/40 p-3.5 rounded-lg border border-dark-border/40">
                <span className="font-orbitron font-extrabold text-white text-xs block mb-1.5">
                  The Skyby Space
                </span>
                <p className="text-xs text-gray-300 leading-relaxed font-medium">
                  Official space science outreach partner for ClimaTwin India, broadcasting Earth observations, satellite meteorological updates, and climate modeling physics directly to the public.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href="https://www.instagram.com/the.skyby?igsh=MTV6YjNkb3p0a3FqZA=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn-neon py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-semibold rounded-lg hover:bg-neon-purple/10 border border-neon-purple/40 text-neon-purple"
                >
                  <Instagram size={14} />
                  <span>Instagram @the.skyby</span>
                </a>
                <a
                  href="https://youtube.com/@theskybyspace?si=y8a4wV_q2okNfAZn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn-neon py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-semibold rounded-lg hover:bg-red-500/10 border border-red-500/40 text-red-500"
                >
                  <Youtube size={14} />
                  <span>YouTube @theskybyspace</span>
                </a>
              </div>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  )
}
