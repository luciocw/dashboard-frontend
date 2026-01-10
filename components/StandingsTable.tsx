import { memo } from 'react'
import { cn } from '@/lib/utils'
import { Trophy, Medal, Award } from 'lucide-react'

interface StandingsEntry {
  rank: number
  manager: {
    name: string
    avatar?: string
  }
  record: {
    wins: number
    losses: number
  }
  points: number
  isCurrentUser?: boolean
}

interface StandingsTableProps {
  entries: StandingsEntry[]
  className?: string
}

export const StandingsTable = memo(function StandingsTable({ 
  entries, 
  className 
}: StandingsTableProps) {
  
  const calculateWinPercentage = (wins: number, losses: number) => {
    const total = wins + losses
    if (total === 0) return '0.0'
    return ((wins / total) * 100).toFixed(1)
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex items-center justify-center">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <span className="ml-1 font-bold text-yellow-400">1</span>
        </div>
      )
    }
    if (rank === 2) {
      return (
        <div className="flex items-center justify-center">
          <Medal className="h-5 w-5 text-slate-300" />
          <span className="ml-1 font-bold text-slate-300">2</span>
        </div>
      )
    }
    if (rank === 3) {
      return (
        <div className="flex items-center justify-center">
          <Award className="h-5 w-5 text-amber-600" />
          <span className="ml-1 font-bold text-amber-600">3</span>
        </div>
      )
    }
    return <span className="font-semibold text-slate-400">{rank}</span>
  }

  return (
    <div className={cn(
      'overflow-hidden rounded-xl border border-slate-700/60 bg-slate-800/50 backdrop-blur-sm',
      className
    )}>
      {/* Table Header */}
      <div className="border-b border-slate-700/40 bg-slate-900/50 px-4 py-3">
        <div className="grid grid-cols-[40px_1fr_80px_80px] items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 md:grid-cols-[60px_1fr_100px_100px_80px]">
          <div className="text-center">#</div>
          <div>Manager</div>
          <div className="hidden md:block">Record</div>
          <div className="text-center">Pts</div>
          <div className="text-center hidden md:block">Win%</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-slate-700/30">
        {entries.map((entry, idx) => {
          const winPercentage = calculateWinPercentage(entry.record.wins, entry.record.losses)
          const isTopThree = entry.rank <= 3

          return (
            <div
              key={entry.rank}
              className={cn(
                'grid grid-cols-[40px_1fr_80px_80px] items-center gap-2 px-4 py-3 transition-all duration-200 md:grid-cols-[60px_1fr_100px_100px_80px]',
                // Alternating row colors
                idx % 2 === 0 ? 'bg-slate-800/30' : 'bg-transparent',
                // Current user highlight
                entry.isCurrentUser && 'bg-cyan-500/10 border-l-4 border-cyan-500',
                // Top 3 subtle highlight
                isTopThree && !entry.isCurrentUser && 'bg-gradient-to-r from-yellow-500/5 to-transparent',
                // Hover state
                'hover:bg-cyan-500/5'
              )}
            >
              {/* Rank Column */}
              <div className="flex justify-center">{getRankBadge(entry.rank)}</div>

              {/* Manager Column */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                  'relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full border-2',
                  isTopThree 
                    ? entry.rank === 1 
                      ? 'border-yellow-500/50' 
                      : entry.rank === 2 
                        ? 'border-slate-400/50' 
                        : 'border-amber-600/50'
                    : 'border-slate-600'
                )}>
                  {entry.manager.avatar ? (
                    <img
                      src={entry.manager.avatar}
                      alt={entry.manager.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-slate-700 flex items-center justify-center text-slate-400 text-xs font-bold">
                      {entry.manager.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex flex-col overflow-hidden min-w-0">
                  <span
                    className={cn(
                      'truncate text-sm font-semibold',
                      entry.isCurrentUser ? 'text-cyan-400' : 'text-white'
                    )}
                  >
                    {entry.manager.name}
                  </span>
                  {/* Mobile: Show record here */}
                  <span className="text-xs text-slate-400 md:hidden">
                    {entry.record.wins}-{entry.record.losses}
                  </span>
                </div>
              </div>

              {/* Record Column (Hidden on mobile) */}
              <div className="hidden font-semibold text-white md:block">
                {entry.record.wins}-{entry.record.losses}
              </div>

              {/* Points Column */}
              <div className="text-center font-bold text-cyan-400">
                {entry.points.toFixed(1)}
              </div>

              {/* Win % Column (Hidden on mobile) */}
              <div className="hidden md:flex justify-center">
                <span
                  className={cn(
                    'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold',
                    parseFloat(winPercentage) >= 60
                      ? 'bg-green-500/20 text-green-400'
                      : parseFloat(winPercentage) >= 50
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'bg-red-500/20 text-red-400'
                  )}
                >
                  {winPercentage}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
