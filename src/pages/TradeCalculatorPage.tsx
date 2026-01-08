/**
 * Trade Calculator Page
 * Página pública para calcular trades de dynasty
 */

import { Link } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'
import { TradeCalculator } from '@/features/trade-calc'
import { Footer } from '@/components/Footer'
import { useAppStore } from '@/store/useAppStore'

export function TradeCalculatorPage() {
  const currentUser = useAppStore((state) => state.currentUser)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Simple Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo / Back */}
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="flex items-center gap-2 text-slate-400 hover:text-white transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Voltar</span>
              </Link>
              <div className="w-px h-5 bg-slate-700" />
              <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Dynasty Dashboard
              </span>
            </div>

            {/* User Info or Login Link */}
            {currentUser ? (
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-sm text-slate-300 hover:bg-slate-700 transition"
              >
                <Home className="w-4 h-4" />
                <span>Minhas Ligas</span>
              </Link>
            ) : (
              <Link
                to="/"
                className="px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm rounded-lg hover:from-cyan-500 hover:to-blue-500 transition"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <TradeCalculator />
      </main>

      <Footer />
    </div>
  )
}
