'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Globe,
  Brain,
  AlertTriangle,
  Wheat,
  BarChart3,
  MessageSquare,
  Info,
  Menu,
  X,
  Zap,
} from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Home', icon: Globe },
  { href: '/climate-twin', label: 'Climate Twin', icon: Globe },
  { href: '/predictions', label: 'Predictions', icon: Brain },
  { href: '/disasters', label: 'Disasters', icon: AlertTriangle },
  { href: '/agriculture', label: 'Agriculture', icon: Wheat },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/assistant', label: 'AI Assistant', icon: MessageSquare },
  { href: '/about', label: 'About', icon: Info },
]

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'glass shadow-[0_4px_30px_rgba(0,212,255,0.1)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <span className="text-2xl">🌍</span>
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-neon-blue rounded-full animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span
                  className="font-orbitron font-bold text-base neon-text leading-none tracking-wider"
                  style={{ fontFamily: 'var(--font-orbitron)' }}
                >
                  ClimaTwin
                </span>
                <span className="text-[10px] text-[#8BB8D4] tracking-widest uppercase leading-none">
                  India
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.slice(1).map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? 'text-neon-blue'
                        : 'text-[#8BB8D4] hover:text-[#E8F4FD]'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-neon-blue' : 'text-[#4A6B85] group-hover:text-[#8BB8D4]'} />
                    {label}
                    {isActive && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-blue rounded-full"
                        style={{ boxShadow: '0 0 8px rgba(0, 212, 255, 0.8)' }}
                      />
                    )}
                    {isActive && (
                      <div className="absolute inset-0 bg-neon-blue/5 rounded-lg" />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Live indicator */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 glass rounded-full">
                <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                <span className="text-xs text-neon-green font-medium">LIVE</span>
              </div>

              {/* AI Button */}
              <Link
                href="/assistant"
                className="hidden sm:flex items-center gap-1.5 btn-neon text-xs py-2 px-4"
              >
                <Zap size={12} />
                AI Chat
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg glass"
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X size={20} className="text-neon-blue" />
                ) : (
                  <Menu size={20} className="text-[#8BB8D4]" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          />
          <div
            className="fixed top-0 right-0 bottom-0 w-72 glass-dark z-50 lg:hidden overflow-y-auto transform translate-x-0 transition-transform duration-300"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <span
                  className="font-orbitron font-bold text-lg neon-text"
                  style={{ fontFamily: 'var(--font-orbitron)' }}
                >
                  ClimaTwin India
                </span>
                <button onClick={() => setMobileOpen(false)}>
                  <X size={20} className="text-[#8BB8D4]" />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                {navLinks.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-neon-blue/10 text-neon-blue neon-border'
                          : 'text-[#8BB8D4] hover:bg-white/5 hover:text-[#E8F4FD]'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="font-medium">{label}</span>
                    </Link>
                  )
                })}
              </div>

              <div className="mt-8 p-4 glass rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                  <span className="text-xs text-neon-green font-bold">SYSTEM LIVE</span>
                </div>
                <p className="text-xs text-[#4A6B85]">
                  Monitoring 36 states/UTs in real-time
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
