import { memo } from 'react'
import { ChevronDown, LogOut } from 'lucide-react'

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
  return (
    <header className="sticky top-0 z-50 border-b border-slate-700/40 bg-slate-900/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Dynasty Dashboard
            </span>
          </h1>

          {/* Right side controls */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Season Selector */}
            <div className="relative">
              <select
                value={selectedSeason}
                onChange={(e) => onSeasonChange(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 bg-slate-800/50 border border-slate-700/60 rounded-lg text-sm font-medium text-white hover:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer transition-all"
              >
                {availableSeasons.map((season) => (
                  <option key={season} value={season}>
                    {season}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>

            {/* User Avatar and Name */}
            <div className="flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-800/30 px-2 py-1.5 md:px-3 md:py-2">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={username}
                  className="h-7 w-7 md:h-8 md:w-8 rounded-full"
                />
              ) : (
                <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-cyan-600 flex items-center justify-center text-white text-xs font-bold">
                  {username.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="hidden text-sm font-medium md:inline text-white">
                {displayName || username}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
              aria-label="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Decorative gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
    </header>
  )
})
