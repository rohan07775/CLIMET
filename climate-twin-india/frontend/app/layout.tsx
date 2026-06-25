import type { Metadata } from 'next'
import { Orbitron, Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { Toaster } from 'react-hot-toast'

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'ClimaTwin India — AI-Powered Digital Twin of India\'s Climate',
  description: 'Real-time AI-powered climate intelligence platform for India — monitoring, predictions, disaster alerts, and agricultural insights across all 36 states and union territories.',
  keywords: 'India climate, AI weather prediction, digital twin, monsoon forecast, disaster alerts, climate analytics',
  authors: [{ name: 'ClimaTwin India Team' }],
  openGraph: {
    title: 'ClimaTwin India',
    description: "India's AI-Powered Climate Digital Twin Platform",
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${orbitron.variable} ${inter.variable}`}>
      <body className="bg-dark-bg text-[#E8F4FD] font-inter antialiased overflow-x-hidden">
        {/* Global grid background */}
        <div className="fixed inset-0 grid-pattern opacity-50 pointer-events-none z-0" />

        {/* Ambient glow orbs */}
        <div className="fixed top-0 left-1/4 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-neon-purple/5 rounded-full blur-3xl pointer-events-none z-0" />

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 pt-16">
            {children}
          </main>
        </div>

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(10, 22, 40, 0.95)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              color: '#E8F4FD',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
            },
            success: {
              iconTheme: { primary: '#00D4FF', secondary: '#050B14' },
            },
            error: {
              iconTheme: { primary: '#FF2D55', secondary: '#050B14' },
            },
          }}
        />
      </body>
    </html>
  )
}
