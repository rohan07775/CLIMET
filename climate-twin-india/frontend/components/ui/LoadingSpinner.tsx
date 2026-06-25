'use client'

import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  message?: string
}

export default function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizes = {
    sm: { outer: 32, mid: 24, inner: 16, dot: 4, text: 'text-xs' },
    md: { outer: 56, mid: 42, inner: 28, dot: 6, text: 'text-sm' },
    lg: { outer: 80, mid: 60, inner: 40, dot: 8, text: 'text-base' },
    xl: { outer: 120, mid: 90, inner: 60, dot: 10, text: 'text-lg' },
  }

  const s = sizes[size]

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className="relative flex items-center justify-center"
        style={{ width: s.outer, height: s.outer }}
      >
        {/* Outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full"
          style={{
            border: `1px solid rgba(0, 212, 255, 0.1)`,
            borderTop: `2px solid #00D4FF`,
            borderRight: `2px solid rgba(0, 212, 255, 0.5)`,
          }}
        />

        {/* Mid ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute rounded-full"
          style={{
            width: s.mid,
            height: s.mid,
            border: `1px solid rgba(99, 102, 241, 0.1)`,
            borderTop: `2px solid #6366F1`,
            borderLeft: `2px solid rgba(99, 102, 241, 0.5)`,
          }}
        />

        {/* Inner ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="absolute rounded-full"
          style={{
            width: s.inner,
            height: s.inner,
            border: `1px solid rgba(0, 255, 136, 0.1)`,
            borderBottom: `2px solid #00FF88`,
          }}
        />

        {/* Center pulse */}
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="rounded-full"
          style={{
            width: s.dot,
            height: s.dot,
            background: '#00D4FF',
            boxShadow: '0 0 10px rgba(0, 212, 255, 0.8)',
          }}
        />

        {/* Ring expand effect */}
        <motion.div
          animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full"
          style={{ border: '1px solid rgba(0, 212, 255, 0.3)' }}
        />
      </div>

      {message && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className={`${s.text} text-[#8BB8D4] font-medium tracking-wider uppercase`}
        >
          {message}
        </motion.p>
      )}
    </div>
  )
}
