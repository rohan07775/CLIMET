'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { chatbotApi } from '@/utils/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import GlassCard from '@/components/ui/GlassCard'
import { MessageSquare, Send, Mic, MicOff, Volume2, VolumeX, Sparkles, User, Cpu } from 'lucide-react'
import toast from 'react-hot-toast'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am ClimaTwin India, your climate digital twin assistant. Ask me questions about regional forecasts, disaster alerts, crop suitability, or carbon footprints in Hindi or English.',
    },
  ])
  const [inputMsg, setInputMsg] = useState<string>('')
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const [language, setLanguage] = useState<string>('en') // en | hi
  const [querying, setQuerying] = useState<boolean>(false)

  // Voice Assistant state
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState<boolean>(false)
  const [speechSupported, setSpeechSupported] = useState<boolean>(false)
  
  const chatEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      setSpeechSupported(true)
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = false
      
      rec.onstart = () => setIsRecording(true)
      rec.onend = () => setIsRecording(false)
      
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputMsg(transcript)
        toast.success(`Transcribed: "${transcript}"`)
      }
      
      rec.onerror = (err: any) => {
        console.error(err)
        setIsRecording(false)
        toast.error('Voice transcription error. Check microphone permissions.')
      }
      
      recognitionRef.current = rec
    }
  }, [])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Sync language for speech recognition
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
    }
  }, [language])

  const handleSend = async (messageText: string) => {
    if (!messageText.trim()) return

    const userMessage: Message = { role: 'user', content: messageText }
    setMessages((prev) => [...prev, userMessage])
    setInputMsg('')
    setQuerying(true)

    try {
      const res = await chatbotApi.query({
        message: messageText,
        session_id: sessionId,
        language: language,
      })

      setSessionId(res.session_id)
      
      const assistantMessage: Message = { role: 'assistant', content: res.response }
      setMessages((prev) => [...prev, assistantMessage])

      // Text-To-Speech Synthesis
      if (voiceOutputEnabled) {
        speakText(res.speech_output_text || res.response)
      }
    } catch (err) {
      toast.error('Failed to get a response from ClimaTwin assistant.')
    } finally {
      setQuerying(false)
    }
  }

  // Speaks output text using browser Web Speech API
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Cancel ongoing synthesis
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
      
      // Attempt to select a fitting voice
      const voices = window.speechSynthesis.getVoices()
      const matchedVoice = voices.find((v) => v.lang.startsWith(language))
      if (matchedVoice) {
        utterance.voice = matchedVoice
      }
      
      window.speechSynthesis.speak(utterance)
    }
  }

  const toggleRecording = () => {
    if (!speechSupported) {
      toast.error('Web Speech Recognition is not supported by your browser. Try Google Chrome.')
      return
    }
    
    if (isRecording) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }

  const suggestionPrompts = [
    { text: 'Will Gujarat receive heavy rainfall next week?', label: 'Gujarat Rain probability' },
    { text: 'What is the flood risk in Assam?', label: 'Assam Flood Telemetry' },
    { text: 'Show Delhi temperature trend.', label: 'Delhi Heatwave Risk' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col h-[85vh] gap-6 z-10 relative">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-neon-blue animate-pulse" />
          <div>
            <h1 className="text-2xl font-orbitron font-extrabold text-white">ClimaTwin AI Assistant</h1>
            <p className="text-xs text-[#8BB8D4]">Google Gemini-powered climate advisory chat.</p>
          </div>
        </div>
        
        {/* Controls: Speech & Language */}
        <div className="flex items-center gap-3">
          
          {/* Language Toggle */}
          <div className="flex bg-[#050B14] rounded-lg border border-dark-border p-0.5">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                language === 'en' ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/20' : 'text-gray-400'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                language === 'hi' ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/20' : 'text-gray-400'
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Voice Output Toggle */}
          <button
            onClick={() => {
              const enabled = !voiceOutputEnabled
              setVoiceOutputEnabled(enabled)
              if (!enabled && typeof window !== 'undefined') {
                window.speechSynthesis.cancel()
              }
              toast.success(enabled ? 'Voice synthesis enabled' : 'Voice synthesis disabled')
            }}
            className={`p-2 rounded-lg border transition-all ${
              voiceOutputEnabled
                ? 'border-neon-blue bg-neon-blue/10 text-neon-blue'
                : 'border-dark-border text-gray-400 hover:border-gray-500'
            }`}
            title="Toggle Voice Output"
          >
            {voiceOutputEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Suggestion Prompts */}
      <div className="flex flex-wrap gap-2">
        {suggestionPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.text)}
            className="text-[10px] sm:text-xs px-3.5 py-1.5 glass hover:bg-white/5 rounded-xl border border-dark-border/60 text-[#8BB8D4] hover:text-neon-blue text-left transition-colors font-medium"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Conversational Chat Window */}
      <GlassCard className="flex-1 flex flex-col overflow-hidden border border-dark-border p-4 relative">
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((m, idx) => {
              const isAssistant = m.role === 'assistant'
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}
                >
                  {/* Icon Avatar */}
                  <div className={`p-2 rounded-lg ${isAssistant ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20' : 'bg-neon-purple/10 text-neon-purple border border-neon-purple/20'}`}>
                    {isAssistant ? <Cpu size={16} /> : <User size={16} />}
                  </div>

                  {/* Speech Bubble */}
                  <div className={`max-w-[75%] p-3.5 rounded-xl text-sm leading-relaxed ${
                    isAssistant
                      ? 'bg-dark-surface/40 text-gray-200 border border-dark-border'
                      : 'bg-neon-blue/10 border border-neon-blue/20 text-[#E8F4FD]'
                  }`}>
                    {m.content}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          
          {querying && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20">
                <Cpu size={16} className="animate-spin" />
              </div>
              <div className="bg-dark-surface/40 p-4 rounded-xl border border-dark-border">
                <LoadingSpinner />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Control Box */}
        <div className="mt-4 pt-4 border-t border-dark-border flex gap-3 items-center">
          
          {/* Microphone recording */}
          <button
            onClick={toggleRecording}
            className={`p-3.5 rounded-xl border transition-all ${
              isRecording
                ? 'border-accent-red bg-accent-red/10 text-accent-red animate-pulse'
                : 'border-dark-border text-gray-400 hover:border-gray-500 hover:text-white'
            }`}
            title="Speech recognition mic"
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Text input */}
          <input
            type="text"
            placeholder={isRecording ? 'Listening...' : 'Type climate or crop query...'}
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend(inputMsg)
            }}
            className="input-neon flex-1 py-3 text-sm"
            disabled={querying}
          />

          {/* Send */}
          <button
            onClick={() => handleSend(inputMsg)}
            disabled={querying || !inputMsg.trim()}
            className="p-3.5 bg-neon-blue text-[#050B14] rounded-xl hover:bg-neon-cyan transition-colors disabled:opacity-50 flex items-center justify-center border border-neon-blue"
          >
            <Send size={18} />
          </button>
        </div>
      </GlassCard>

    </div>
  )
}
