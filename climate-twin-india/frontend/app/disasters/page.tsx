'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { alertsApi } from '@/utils/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import GlassCard from '@/components/ui/GlassCard'
import RiskMeter from '@/components/ui/RiskMeter'
import { AlertTriangle, BellRing, ShieldAlert, Check, Plus, Send } from 'lucide-react'
import { INDIAN_STATES } from '@/utils/states_coords'
import toast from 'react-hot-toast'

export default function DisastersPage() {
  const [activeAlerts, setActiveAlerts] = useState<any[]>([])
  const [historyAlerts, setHistoryAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Subscription Form State
  const [subEmail, setSubEmail] = useState<string>('')
  const [subPhone, setSubPhone] = useState<string>('')
  const [subStates, setSubStates] = useState<string[]>(['Delhi', 'Assam'])

  // Admin Trigger Alert Form State
  const [triggerState, setTriggerState] = useState<string>('Assam')
  const [triggerType, setTriggerType] = useState<string>('flood')
  const [triggerSeverity, setTriggerSeverity] = useState<string>('severe')
  const [triggerMsg, setTriggerMsg] = useState<string>('')
  const [triggering, setTriggering] = useState<boolean>(false)

  const alertTypes = ['flood', 'heatwave', 'drought', 'heavy_rain', 'cyclone']
  const riskLevels = ['low', 'moderate', 'high', 'severe']

  const loadAlerts = async () => {
    try {
      const active = await alertsApi.getActive()
      const history = await alertsApi.getHistory(15)
      setActiveAlerts(active)
      setHistoryAlerts(history)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [])

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subEmail) {
      toast.error('Email address is required.')
      return
    }
    try {
      await alertsApi.subscribe({
        email: subEmail,
        phone: subPhone || undefined,
        subscribed_states: subStates,
      })
      toast.success(`Successfully subscribed to warnings for: ${subStates.join(', ')}`)
      setSubEmail('')
      setSubPhone('')
    } catch (err) {
      toast.error('Failed to register subscription.')
    }
  }

  const handleTriggerAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!triggerMsg) {
      toast.error('Alert advisory message is required.')
      return
    }
    setTriggering(true)
    try {
      await alertsApi.createAlert({
        state: triggerState,
        alert_type: triggerType,
        risk_level: triggerSeverity,
        message: triggerMsg,
      })
      toast.success('Disaster warning triggered and broadcast to matching subscribers!')
      setTriggerMsg('')
      loadAlerts()
    } catch (err) {
      toast.error('Failed to trigger alert.')
    } finally {
      setTriggering(false)
    }
  }

  const toggleSubState = (state: string) => {
    if (subStates.includes(state)) {
      setSubStates(subStates.filter((s) => s !== state))
    } else {
      setSubStates([...subStates, state])
    }
  }

  if (loading) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center bg-dark-bg gap-4">
        <LoadingSpinner />
        <span className="text-[#8BB8D4] font-orbitron font-bold uppercase tracking-widest text-sm">
          Loading Disaster Registry...
        </span>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 z-10 relative">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-orbitron font-extrabold text-white flex items-center gap-2">
          <AlertTriangle className="text-accent-red animate-pulse" />
          <span>Disaster Early Warning System</span>
        </h1>
        <p className="text-sm text-[#8BB8D4] mt-1">
          Automated multi-hazard alert engine monitoring flood levels, excessive heat anomalies, and cyclone tracking feeds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Middle Column: Active and Historical warnings */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Active warnings list */}
          <GlassCard className="p-6">
            <h2 className="text-sm font-bold font-orbitron text-accent-red tracking-wider uppercase mb-4 flex items-center gap-1.5">
              <ShieldAlert size={16} />
              <span>Active Disaster Warnings ({activeAlerts.length})</span>
            </h2>
            {activeAlerts.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No active major disaster warnings logged in the country.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {activeAlerts.map((a) => (
                  <div
                    key={a.id}
                    className={`p-4 rounded-xl border flex flex-col gap-2 relative overflow-hidden ${
                      a.risk_level === 'severe'
                        ? 'bg-red-500/10 border-red-500/40 text-red-100'
                        : a.risk_level === 'high'
                        ? 'bg-orange-500/10 border-orange-500/40 text-orange-100'
                        : 'bg-yellow-500/10 border-yellow-500/40 text-yellow-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-orbitron font-extrabold text-sm uppercase tracking-wide">
                          {a.alert_type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-black/40">
                          {a.risk_level}
                        </span>
                      </div>
                      <span className="text-xs font-orbitron font-bold text-neon-blue">{a.state}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-200 mt-1">{a.message}</p>
                    <div className="text-[10px] text-gray-400 text-right mt-1">
                      Issued: {new Date(a.created_at).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Historical warning logs */}
          <GlassCard className="p-6">
            <h2 className="text-sm font-bold font-orbitron text-[#8BB8D4] tracking-wider uppercase mb-4">
              Historical Threat Log
            </h2>
            <div className="max-h-[300px] overflow-y-auto pr-2 flex flex-col gap-3">
              {historyAlerts.map((a) => (
                <div
                  key={a.id}
                  className="bg-[#050B14]/40 p-3 rounded-lg border border-dark-border/40 flex justify-between items-center text-xs"
                >
                  <div>
                    <span className="font-bold text-white uppercase tracking-wider block">
                      {a.alert_type.replace('_', ' ')} ({a.state})
                    </span>
                    <span className="text-gray-400 leading-relaxed block mt-0.5 text-[11px] max-w-md">
                      {a.message.slice(0, 80)}...
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`uppercase font-bold block mb-1 text-[10px] ${
                      a.is_active ? 'text-accent-red animate-pulse' : 'text-gray-500'
                    }`}>
                      {a.is_active ? 'Active' : 'Resolved'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(a.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Alerts Subscription & Warning Dispatcher */}
        <div className="flex flex-col gap-6">
          
          {/* Notifications Signup Form */}
          <GlassCard className="p-5 flex flex-col gap-4 border-l-4 border-l-neon-green">
            <h2 className="text-xs font-bold font-orbitron text-neon-green tracking-wider uppercase flex items-center gap-1.5">
              <BellRing size={14} />
              <span>Emergency Subscriptions</span>
            </h2>
            <p className="text-xs text-[#8BB8D4]">
              Register your email/phone to receive alerts when weather hazards are triggered in selected states.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3 mt-1">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Email Address (SMTP)*</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  className="input-neon text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Phone Number (Twilio SMS)</label>
                <input
                  type="tel"
                  placeholder="+91..."
                  value={subPhone}
                  onChange={(e) => setSubPhone(e.target.value)}
                  className="input-neon text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Subscribed States</label>
                <div className="grid grid-cols-2 gap-2 max-h-[110px] overflow-y-auto p-2 bg-[#050B14]/40 border border-dark-border rounded-lg mt-1">
                  {Object.keys(INDIAN_STATES).slice(0, 10).map((state) => (
                    <button
                      type="button"
                      key={state}
                      onClick={() => toggleSubState(state)}
                      className={`flex items-center gap-1.5 text-[10px] py-1 px-2 rounded-md border text-left ${
                        subStates.includes(state)
                          ? 'border-neon-green bg-neon-green/10 text-neon-green'
                          : 'border-dark-border text-[#8BB8D4] hover:border-gray-500'
                      }`}
                    >
                      {subStates.includes(state) ? <Check size={10} /> : <Plus size={10} />}
                      <span>{state}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-neon text-xs py-2 w-full mt-2 font-semibold">
                Subscribe to Feed
              </button>
            </form>
          </GlassCard>

          {/* Trigger Alert Panel (Interactive Judge Tool) */}
          <GlassCard className="p-5 flex flex-col gap-4 border-l-4 border-l-accent-red">
            <h2 className="text-xs font-bold font-orbitron text-accent-red tracking-wider uppercase flex items-center gap-1.5">
              <Send size={14} />
              <span>Simulate Warning Dispatch</span>
            </h2>
            <p className="text-xs text-[#8BB8D4]">
              Simulate an extreme weather event to broadcast automated warnings to subscribers.
            </p>
            <form onSubmit={handleTriggerAlert} className="flex flex-col gap-3 mt-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">State Target</label>
                  <select
                    value={triggerState}
                    onChange={(e) => setTriggerState(e.target.value)}
                    className="input-neon text-xs py-1.5"
                  >
                    {Object.keys(INDIAN_STATES).map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Hazard Type</label>
                  <select
                    value={triggerType}
                    onChange={(e) => setTriggerType(e.target.value)}
                    className="input-neon text-xs py-1.5"
                  >
                    {alertTypes.map((t) => (
                      <option key={t} value={t}>
                        {t.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Severity Level</label>
                  <select
                    value={triggerSeverity}
                    onChange={(e) => setTriggerSeverity(e.target.value)}
                    className="input-neon text-xs py-1.5"
                  >
                    {riskLevels.map((r) => (
                      <option key={r} value={r}>
                        {r.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Emergency Message</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Type advisory details..."
                  value={triggerMsg}
                  onChange={(e) => setTriggerMsg(e.target.value)}
                  className="input-neon text-xs py-2"
                />
              </div>
              <button
                type="submit"
                disabled={triggering}
                className="w-full text-center text-xs py-2 font-bold tracking-widest text-[#050B14] bg-accent-red rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {triggering ? <LoadingSpinner /> : <Send size={12} />}
                <span>Trigger Emergency Broadcast</span>
              </button>
            </form>
          </GlassCard>
        </div>

      </div>
    </div>
  )
}
