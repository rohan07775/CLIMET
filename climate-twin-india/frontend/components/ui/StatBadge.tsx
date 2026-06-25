'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatBadgeProps {
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'red'
  icon?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const colorMap = {
  blue: {
    text: '#00D4FF',
    bg: 'rgba(0, 212, 255, 0.08)',
    border: 'rgba(0, 212, 255, 0.2)',
    trend: 'rgba(0, 212, 255, 0.6)',
  },
  purple: {
    text: '#6366F1',
    bg: 'rgba(99, 102, 241, 0.08)',
    border: 'rgba(99, 102, 241, 0.2)',
    trend: 'rgba(99, 102, 241, 0.6)',
  },
  green: {
    text: '#00FF88',
    bg: 'rgba(0, 255, 136, 0.08)',
    border: 'rgba(0, 255, 136, 0.2)',
    trend: 'rgba(0, 255, 136, 0.6)',
  },
  orange: {
    text: '#FF6B35',
    bg: 'rgba(255, 107, 53, 0.08)',
    border: 'rgba(255, 107, 53, 0.2)',
    trend: 'rgba(255, 107, 53, 0.6)',
  },
  red: {
    text: '#FF2D55',
    bg: 'rgba(255, 45, 85, 0.08)',
    border: 'rgba(255, 45, 85, 0.2)',
    trend: 'rgba(255, 45, 85, 0.6)',
  },
}

export default function StatBadge({
  label,
  value,
  unit,
  trend,
  trendValue,
  color = 'blue',
  icon,
  size = 'md',
}: StatBadgeProps) {
  const c = colorMap[color]

  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  const trendColor =
    trend === 'up' ? '#00FF88' : trend === 'down' ? '#FF2D55' : '#8BB8D4'

  const sizeClasses = {
    sm: { container: 'p-3', value: 'text-xl', label: 'text-xs' },
    md: { container: 'p-4', value: 'text-2xl', label: 'text-xs' },
    lg: { container: 'p-5', value: 'text-3xl', label: 'text-sm' },
  }

  const sc = sizeClasses[size]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.03, transition: { duration: 0.15 } }}
      className={`rounded-xl ${sc.container}`}
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p
            className={`${sc.label} font-medium uppercase tracking-wider truncate`}
            style={{ color: '#8BB8D4' }}
          >
            {label}
          </p>
          <div className="flex items-baseline gap-1 mt-1">
            {icon && <span className="text-lg">{icon}</span>}
            <motion.span
              key={String(value)}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`font-bold font-orbitron ${sc.value} tabular-nums`}
              style={{ color: c.text, fontFamily: 'var(--font-orbitron)' }}
            >
              {value}
            </motion.span>
            {unit && (
              <span className="text-xs font-medium" style={{ color: '#4A6B85' }}>
                {unit}
              </span>
            )}
          </div>
        </div>

        {trend && (
          <div
            className="flex flex-col items-end gap-0.5 shrink-0"
            style={{ color: trendColor }}
          >
            <TrendIcon size={14} />
            {trendValue && (
              <span className="text-[10px] font-semibold">{trendValue}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
