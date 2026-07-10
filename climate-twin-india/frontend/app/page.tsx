'use client'

import Link from 'next/link'
import { Globe, Brain, AlertTriangle, Wheat, BarChart3, MessageSquare, Zap, ShieldAlert, Cpu } from 'lucide-react'

export default function Home() {
  const modules = [
    {
      title: 'Digital Twin of India',
      description: 'Interact with a live geospatial model of India monitoring Temperature, Rainfall, AQI, and Heat Index.',
      href: '/climate-twin',
      icon: Globe,
      color: 'from-[#00D4FF] to-[#0099FF]',
      shadow: 'rgba(0, 212, 255, 0.3)',
    },
    {
      title: 'AI Climate Forecasts',
      description: 'Review 7-day predictive telemetry powered by XGBoost, Prophet, and Bidirectional LSTM models.',
      href: '/predictions',
      icon: Brain,
      color: 'from-[#6366F1] to-[#a855f7]',
      shadow: 'rgba(99, 102, 241, 0.3)',
    },
    {
      title: 'Disaster Warning System',
      description: 'Early warnings for Floods, Heatwaves, and Cyclones with automated Twilio SMS alert subscriptions.',
      href: '/disasters',
      icon: AlertTriangle,
      color: 'from-[#FF2D55] to-[#FF6B35]',
      shadow: 'rgba(255, 45, 85, 0.3)',
    },
    {
      title: 'Agricultural Analytics',
      description: 'Evaluate crop suitability, sowing viability, and temperature/moisture risk indexes per state.',
      href: '/agriculture',
      icon: Wheat,
      color: 'from-[#00FF88] to-[#10b981]',
      shadow: 'rgba(0, 255, 136, 0.3)',
    },
    {
      title: 'Trend Charts & Anomalies',
      description: 'Visualize historical climate change anomalies and generate downloadable PDF reports.',
      href: '/analytics',
      icon: BarChart3,
      color: 'from-[#00FFFF] to-[#0099FF]',
      shadow: 'rgba(0, 255, 255, 0.3)',
    },
    {
      title: 'Gemini AI Assistant',
      description: 'Query our conversational climate agent in English or Hindi with built-in voice support.',
      href: '/assistant',
      icon: MessageSquare,
      color: 'from-[#FF6B35] to-[#FF2D55]',
      shadow: 'rgba(255, 107, 53, 0.3)',
    },
  ]

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 scan-lines z-10">
      
      {/* Real-time Alerts Ticker */}
      <div className="w-full max-w-7xl mb-12 glass-subtle overflow-hidden py-3 px-6 flex items-center gap-4 border-l-4 border-l-accent-red">
        <div className="flex items-center gap-2 text-accent-red font-bold text-xs tracking-wider animate-pulse whitespace-nowrap">
          <ShieldAlert size={16} />
          <span>EMERGENCY FEED:</span>
        </div>
        <div className="relative flex-1 overflow-hidden h-5">
          <div className="ticker-inner text-sm text-[#8BB8D4]">
            <span className="mx-8 font-semibold text-accent-red">⚠️ ASSAM: River gauges breach warning levels. Severe flood risk active.</span>
            <span className="mx-8 font-semibold text-accent-orange">🔥 DELHI NCR: Extreme Heatwave alert. Projected temps up to 44°C.</span>
            <span className="mx-8">🌧️ KERALA: Sowing delay advisory issued due to local heavy rainfall.</span>
            <span className="mx-8 font-semibold text-accent-red">⚠️ RAJASTHAN: High heatwave warning. Avoid direct sun exposure from 12-4 PM.</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl text-center flex flex-col items-center animate-fade-up relative">
        {/* Rotating Tech Rings behind Hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] tech-ring-container pointer-events-none hidden md:block">
          <div className="w-full h-full tech-ring-1 absolute inset-0" />
          <div className="w-8/12 h-8/12 tech-ring-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Header Badge */}
        <div className="cyber-badge mb-8">
          <Cpu size={12} className="animate-spin-slow text-neon-blue" />
          <span>ISRO MOSDAC + NASA POWER Integrated Data</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-orbitron font-extrabold tracking-tight mb-6 z-10 relative">
          Digital Twin of India's{' '}
          <span className="shimmer-text">Climate System</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="max-w-3xl text-base sm:text-lg text-[#8BB8D4] mb-12 leading-relaxed z-10 relative">
          A live, AI-driven computational replica modeling weather patterns, predicting natural disasters, calculating carbon offsets, and auditing agricultural risk levels across all 36 Indian states.
        </p>

        {/* Primary Call-to-actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-20 z-10 relative">
          <Link href="/climate-twin" className="btn-neon-solid flex items-center justify-center gap-2">
            <Globe size={18} />
            <span>Launch Climate Twin</span>
          </Link>
          <Link href="/assistant" className="btn-neon flex items-center justify-center gap-2">
            <Zap size={18} />
            <span>Consult AI Assistant</span>
          </Link>
        </div>

        {/* System Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-20 z-10 relative">
          {[
            { label: 'Observed States & UTs', value: '36', badgeType: 'green' },
            { label: 'Forecast Accuracy', value: '92.4%', badgeType: 'blue' },
            { label: 'ML Prediction Pipeline', value: '4 Models', badgeType: 'purple' },
            { label: 'Disaster Warning Lead', value: '< 2 hrs', badgeType: 'red' },
          ].map((stat, idx) => (
            <div key={idx} className="hud-panel hud-corner-braces p-6 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-orbitron font-extrabold text-white mb-1 leading-none flex items-center gap-1.5 justify-center">
                <span className={`w-2 h-2 rounded-full animate-pulse ${
                  stat.badgeType === 'green' ? 'bg-neon-green' :
                  stat.badgeType === 'red' ? 'bg-accent-red' :
                  stat.badgeType === 'purple' ? 'bg-neon-purple' : 'bg-neon-blue'
                }`} />
                {stat.value}
              </span>
              <span className="text-xs text-[#4A6B85] tracking-wider uppercase font-semibold mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Core Modules Grid */}
        <div className="w-full text-left z-10 relative">
          <h2 className="text-2xl sm:text-3xl font-orbitron font-bold text-center mb-12 text-white">
            <span className="text-neon-blue font-orbitron font-medium mr-2">//</span>
            Climate Intelligence Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((m, idx) => (
              <Link key={idx} href={m.href}>
                <div className="hud-panel p-6 rounded-2xl h-full flex flex-col card-hover cursor-pointer border border-dark-border/60 relative overflow-hidden group">
                  {/* Neon Corner Glow */}
                  <div
                    className="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl group-hover:scale-150 transition-all duration-300"
                    style={{ background: m.shadow }}
                  />
                  <div className={`p-3 w-fit rounded-xl bg-gradient-to-br ${m.color} text-[#050B14] mb-5 shadow-lg`}>
                    <m.icon size={22} />
                  </div>
                  <h3 className="text-lg font-orbitron font-bold text-[#E8F4FD] group-hover:text-neon-blue transition-colors mb-2">
                    {m.title}
                  </h3>
                  <p className="text-sm text-[#8BB8D4] leading-relaxed flex-1">
                    {m.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
