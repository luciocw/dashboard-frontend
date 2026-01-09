/**
 * Free Dash Page
 * Landing page - renderiza o dashboard legacy via iframe
 */

import { Link, useLocation } from 'react-router-dom'
import { Scale, LayoutDashboard, Gem } from 'lucide-react'
import { Footer } from '@/components/Footer'

export function FreeDash() {
  const location = useLocation()
  const isFreeDash = location.pathname === '/'
  const isTradeCalc = location.pathname === '/trade-calc'
  const isLeagues = location.pathname === '/leagues'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Public Header */}
      <header className="sticky top-0 z-50 border-b border-slate-700/40 bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            {/* Logo + Nav */}
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                  Dynasty Dashboard
                </span>
              </h1>

              {/* Navigation */}
              <nav className="hidden sm:flex items-center gap-1">
                <Link
                  to="/trade-calc"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isTradeCalc
                      ? 'bg-cyan-600/20 text-cyan-400'
                      : 'text-slate-400 hover:text-cyan-400 hover:bg-cyan-600/10'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span>Trade Calc</span>
                </Link>
                <Link
                  to="/"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isFreeDash
                      ? 'bg-emerald-600/20 text-emerald-400'
                      : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-600/10'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Free Dash</span>
                </Link>
              </nav>
            </div>

            {/* Right side - Ligas Premium */}
            <div className="flex items-center gap-3">
              <Link
                to="/leagues"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isLeagues
                    ? 'bg-purple-600/20 text-purple-400'
                    : 'text-slate-400 hover:text-purple-400 hover:bg-purple-600/10'
                }`}
              >
                <Gem className="w-4 h-4" />
                <span>Ligas</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      </header>

      {/* Iframe Container - fullscreen */}
      <main className="flex-1 flex flex-col">
        <iframe
          src="/legacy/index.html"
          title="Dynasty Dashboard Legacy"
          className="flex-1 w-full border-0"
          style={{
            minHeight: 'calc(100vh - 57px - 73px)', // header (57px) + footer (73px approx)
          }}
        />
      </main>

      <Footer />
    </div>
  )
}
