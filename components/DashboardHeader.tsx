'use client'

import { memo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, LogOut, Scale, LayoutDashboard, Gem } from 'lucide-react'

interface DashboardHeaderProps {
  username: string
  displayName?: string
  avatarUrl?: string
  selectedSeason: string
  availableSeasons: string[]
  onSeasonChange: (season: string) => void
  onLogout: () => void
}

export const DashboardHeader = memo(function DashboardHeader({
  username,
  displayName,
  avatarUrl,
  selectedSeason,
  availableSeasons,
  onSeasonChange,
  onLogout,
}: DashboardHeaderProps) {
  const pathname = usePathname()
  const isTradeCalc = pathname === '/trade-calc'
  const isFreeDash = pathname === '/'
  const isLeagues = pathname === '/leagues'

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-card/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo + Nav */}
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">
              <span className="bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent">
                Fantasy Intel
              </span>
            </h1>

            {/* Navigation */}
            <nav className="hidden sm:flex items-center gap-1">
              <Link
                href="/trade-calc"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isTradeCalc
                    ? 'bg-cyan-600/20 text-cyan-400'
                    : 'text-muted-foreground hover:text-cyan-400 hover:bg-cyan-600/10'
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>Trade Calc</span>
              </Link>
              <Link
                href="/"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isFreeDash
                    ? 'bg-emerald-600/20 text-emerald-400'
                    : 'text-muted-foreground hover:text-emerald-400 hover:bg-emerald-600/10'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Free Dash</span>
              </Link>
            </nav>
          </div>

          {/* Center - Season Selector */}
          <div className="hidden md:flex items-center">
            <span className="text-sm text-muted-foreground mr-2">Temporada:</span>
            <div className="relative">
              <select
                value={selectedSeason}
                onChange={(e) => onSeasonChange(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 bg-card/50 border border-border/60 rounded-lg text-sm font-medium hover:bg-card/80 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer transition-all"
              >
                {availableSeasons.map((season) => (
                  <option key={season} value={season}>
                    {season}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Mobile Season Selector */}
            <div className="relative md:hidden">
              <select
                value={selectedSeason}
                onChange={(e) => onSeasonChange(e.target.value)}
                className="appearance-none px-3 py-1.5 pr-7 bg-card/50 border border-border/60 rounded-lg text-sm font-medium hover:bg-card/80 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer transition-all"
              >
                {availableSeasons.map((season) => (
                  <option key={season} value={season}>
                    {season}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Ligas Premium */}
            <Link
              href="/leagues"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                isLeagues
                  ? 'bg-purple-600/20 text-purple-400'
                  : 'text-muted-foreground hover:text-purple-400 hover:bg-purple-600/10'
              }`}
            >
              <Gem className="w-4 h-4" />
              <span>Ligas</span>
            </Link>

            {/* User Avatar and Name */}
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/30 px-2 py-1.5 md:px-3 md:py-2">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={username}
                  className="h-7 w-7 md:h-8 md:w-8 rounded-full"
                />
              ) : (
                <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {username.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="hidden text-sm font-medium md:inline">
                {displayName || username}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              aria-label="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Decorative gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </header>
  )
})
