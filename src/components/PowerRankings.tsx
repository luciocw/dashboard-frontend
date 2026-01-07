import { memo } from 'react'
import { cn } from '@/utils/cn'
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface PowerRankingEntry {
  rank: number
  manager: {
    name: string
    avatar?: string
  }
  record: {
    wins: number
    losses: number
  }
  totalPoints: number
  averagePoints: number
  powerScore: number
  trend: 'up' | 'down' | 'stable'
}

interface PowerRankingsProps {
  entries: PowerRankingEntry[]
  className?: string
}

export const PowerRankings = memo(function PowerRankings({ 
  entries, 
  className 
}: PowerRankingsProps) {
  
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 ring-2 ring-yellow-500/50 shadow-lg shadow-yellow-500/30">
          <Trophy className="h-6 w-6 text-slate-900" />
        </div>
      )
    }
    if (rank === 2) {
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 ring-2 ring-slate-400/50 shadow-lg shadow-slate-400/20">
          <Medal className="h-6 w-6 text-slate-900" />
        </div>
      )
    }
    if (rank === 3) {
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 ring-2 ring-amber-700/50 shadow-lg shadow-amber-700/20">
          <Award className="h-6 w-6 text-slate-900" />
        </div>
      )
    }
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 ring-1 ring-slate-700">
        <span className="text-lg font-bold text-slate-400">{rank}</span>
      </div>
    )
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-5 w-5 text-green-400" />
      case 'down':
        return <TrendingDown className="h-5 w-5 text-red-400" />
      case 'stable':
        return <Minus className="h-5 w-5 text-slate-500" />
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 backdrop-blur-sm p-6">
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-white">Power Rankings</h2>
        <p className="text-sm leading-relaxed text-slate-400">
          Rankings dinâmicos baseados em performance, forma recente e força geral do time.
        </p>
      </div>

      {/* Rankings List */}
      <div className="space-y-3">
        {entries.map((entry) => {
          const isTopThree = entry.rank <= 3

          return (
            <div
              key={entry.rank}
              className={cn(
                'group relative overflow-hidden rounded-xl border bg-slate-800/50 backdrop-blur-sm transition-all duration-300',
                // Top 3 special styling
                isTopThree && [
                  'border-2',
                  entry.rank === 1 && 'border-yellow-500/60 bg-gradient-to-br from-yellow-500/10 via-transparent to-transparent',
                  entry.rank === 2 && 'border-slate-400/60 bg-gradient-to-br from-slate-400/10 via-transparent to-transparent',
                  entry.rank === 3 && 'border-amber-600/60 bg-gradient-to-br from-amber-600/10 via-transparent to-transparent',
                ],
                // Regular styling
                !isTopThree && 'border-slate-700/60',
                // Hover effects
                'hover:scale-[1.01] hover:shadow-xl cursor-pointer',
              )}
            >
              <div className="relative flex flex-col gap-4 p-4 md:flex-row md:items-center">
                {/* Left section: Rank + Avatar + Info */}
                <div className="flex flex-1 items-center gap-4">
                  {/* Rank Badge */}
                  <div className="shrink-0">{getRankBadge(entry.rank)}</div>

                  {/* Avatar */}
                  <div
                    className={cn(
                      'relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 transition-all duration-300',
                      isTopThree
                        ? [
                            entry.rank === 1 && 'border-yellow-500 ring-2 ring-yellow-500/30',
                            entry.rank === 2 && 'border-slate-400 ring-2 ring-slate-400/30',
                            entry.rank === 3 && 'border-amber-600 ring-2 ring-amber-600/30',
                          ]
                        : 'border-slate-600'
                    )}
                  >
                    {entry.manager.avatar ? (
                      <img
                        src={entry.manager.avatar}
                        alt={entry.manager.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-slate-700 flex items-center justify-center text-slate-400 text-sm font-bold">
                        {entry.manager.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Manager Info */}
                  <div className="flex flex-col overflow-hidden min-w-0">
                    <span className="truncate text-lg font-bold text-white">{entry.manager.name}</span>
                    <div className="flex items-center gap-2 text-sm text-slate-400 flex-wrap">
                      <span className="font-semibold">
                        {entry.record.wins}-{entry.record.losses}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span>
                        <span className="font-medium text-cyan-400">{entry.totalPoints.toFixed(1)}</span> pts
                      </span>
                      <span className="text-slate-600 hidden sm:inline">•</span>
                      <span className="hidden sm:inline">
                        ø <span className="font-medium text-white">{entry.averagePoints.toFixed(1)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right section: Power Score + Trend */}
                <div className="flex items-center gap-4 md:gap-6">
                  {/* Trend Indicator */}
                  <div className="flex shrink-0 items-center gap-1.5">
                    {getTrendIcon(entry.trend)}
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-500 hidden sm:inline">
                      {entry.trend === 'up' ? 'Subindo' : entry.trend === 'down' ? 'Caindo' : 'Estável'}
                    </span>
                  </div>

                  {/* Power Score */}
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Power
                    </span>
                    <span
                      className={cn(
                        'text-3xl font-extrabold tabular-nums tracking-tight',
                        isTopThree
                          ? [
                              entry.rank === 1 && 'text-yellow-400',
                              entry.rank === 2 && 'text-slate-300',
                              entry.rank === 3 && 'text-amber-500',
                            ]
                          : 'text-cyan-400'
                      )}
                    >
                      {entry.powerScore}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
