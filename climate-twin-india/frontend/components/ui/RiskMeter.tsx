'use client'

import { motion } from 'framer-motion'

type RiskLevel = 'low' | 'moderate' | 'high' | 'severe'

interface RiskMeterProps {
  level: RiskLevel
  score?: number // 0-100
  label?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const riskConfig = {
  low: {
    color: '#00FF88',
    bg: 'rgba(0, 255, 136, 0.1)',
    border: 'rgba(0, 255, 136, 0.3)',
    label: 'LOW',
    score: 20,
    segments: 1,
  },
  moderate: {
    color: '#FFC800',
    bg: 'rgba(255, 200, 0, 0.1)',
    border: 'rgba(255, 200, 0, 0.3)',
    label: 'MODERATE',
    score: 50,
    segments: 2,
  },
  high: {
    color: '#FF6B35',
    bg: 'rgba(255, 107, 53, 0.1)',
    border: 'rgba(255, 107, 53, 0.3)',
    label: 'HIGH',
    score: 75,
    segments: 3,
  },
  severe: {
    color: '#FF2D55',
    bg: 'rgba(255, 45, 85, 0.1)',
    border: 'rgba(255, 45, 85, 0.3)',
    label: 'SEVERE',
    score: 95,
    segments: 4,
  },
}

export default function RiskMeter({
  level,
  score,
  label,
  showLabel = true,
  size = 'md',
}: RiskMeterProps) {
  const config = riskConfig[level]
  const displayScore = score ?? config.score

  const sizeMap = {
    sm: { gap: 2, segH: 12, text: 'text-xs', scoreText: 'text-sm' },
    md: { gap: 3, segH: 18, text: 'text-xs', scoreText: 'text-base' },
    lg: { gap: 4, segH: 24, text: 'text-sm', scoreText: 'text-xl' },
  }
  const sz = sizeMap[size]

  const allLevels: RiskLevel[] = ['low', 'moderate', 'high', 'severe']
  const levelIndex = allLevels.indexOf(level)

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <p className={`${sz.text} text-[#8BB8D4] font-medium uppercase tracking-wider`}>
          {label}
        </p>
      )}
      <div className="flex items-end gap-1.5">
        {allLevels.map((lvl, i) => {
          const isActive = i <= levelIndex
          const lvlConfig = riskConfig[lvl]
          return (
            <motion.div
              key={lvl}
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: sz.segH + i * (sz.segH * 0.25),
                opacity: 1,
              }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
              className="flex-1 rounded-sm"
              style={{
                background: isActive ? lvlConfig.color : 'rgba(26, 39, 68, 0.6)',
                boxShadow: isActive
                  ? `0 0 8px ${lvlConfig.color}60`
                  : 'none',
              }}
            />
          )
        })}
      </div>

      {showLabel && (
        <div className="flex items-center justify-between">
          <motion.span
            animate={
              level === 'severe'
                ? { opacity: [0.7, 1, 0.7] }
                : { opacity: 1 }
            }
            transition={{ duration: 1.5, repeat: level === 'severe' ? Infinity : 0 }}
            className={`${sz.text} font-bold tracking-widest`}
            style={{ color: config.color }}
          >
            {config.label}
          </motion.span>
          <span
            className={`font-orbitron font-bold ${sz.scoreText} tabular-nums`}
            style={{ color: config.color, fontFamily: 'var(--font-orbitron)' }}
          >
            {displayScore}
          </span>
        </div>
      )}
    </div>
  )
}
