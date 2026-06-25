'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassCardProps {
  title?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
  glowColor?: 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'none'
  animate?: boolean
  delay?: number
  onClick?: () => void
}

const glowStyles = {
  blue: {
    border: 'rgba(0, 212, 255, 0.2)',
    shadow: 'rgba(0, 212, 255, 0.15)',
    hoverShadow: 'rgba(0, 212, 255, 0.35)',
  },
  purple: {
    border: 'rgba(99, 102, 241, 0.2)',
    shadow: 'rgba(99, 102, 241, 0.15)',
    hoverShadow: 'rgba(99, 102, 241, 0.35)',
  },
  green: {
    border: 'rgba(0, 255, 136, 0.2)',
    shadow: 'rgba(0, 255, 136, 0.15)',
    hoverShadow: 'rgba(0, 255, 136, 0.35)',
  },
  orange: {
    border: 'rgba(255, 107, 53, 0.2)',
    shadow: 'rgba(255, 107, 53, 0.15)',
    hoverShadow: 'rgba(255, 107, 53, 0.35)',
  },
  red: {
    border: 'rgba(255, 45, 85, 0.2)',
    shadow: 'rgba(255, 45, 85, 0.15)',
    hoverShadow: 'rgba(255, 45, 85, 0.35)',
  },
  none: {
    border: 'rgba(26, 39, 68, 0.6)',
    shadow: 'transparent',
    hoverShadow: 'rgba(0, 212, 255, 0.1)',
  },
}

export default function GlassCard({
  title,
  icon,
  children,
  className = '',
  glowColor = 'blue',
  animate = true,
  delay = 0,
  onClick,
}: GlassCardProps) {
  const glow = glowStyles[glowColor]

  const cardContent = (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        background: 'rgba(10, 22, 40, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${glow.border}`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 0.5px ${glow.border}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Inner highlight */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${glow.border}, transparent)`,
        }}
      />

      {/* Header */}
      {(title || icon) && (
        <div className="flex items-center gap-3 p-5 pb-0">
          {icon && (
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${glow.shadow}, transparent)`,
                border: `1px solid ${glow.border}`,
              }}
            >
              {icon}
            </div>
          )}
          {title && (
            <h3
              className="font-semibold text-sm tracking-wide uppercase"
              style={{ color: glowColor === 'none' ? '#8BB8D4' : undefined }}
            >
              {title}
            </h3>
          )}
        </div>
      )}

      {/* Content */}
      <div className={title || icon ? 'p-5 pt-4' : 'p-5'}>{children}</div>
    </div>
  )

  if (!animate) return cardContent

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={{
        y: -4,
        boxShadow: `0 20px 60px ${glow.hoverShadow}`,
        scale: 1.01,
        transition: { duration: 0.2 },
      }}
      className="h-full"
    >
      {cardContent}
    </motion.div>
  )
}
