import { memo } from 'react'
import { cn } from '@/utils/cn'
import { Trophy } from 'lucide-react'

interface Manager {
  name: string
  avatar?: string
  score: number
  record: { wins: number; losses: number }
  isCurrentUser?: boolean
}

interface MatchupCardProps {
  homeManager: Manager
  awayManager: Manager
  isUserMatchup?: boolean
  onClick?: () => void
}

export const MatchupCard = memo(function MatchupCard({ 
  homeManager, 
  awayManager, 
  isUserMatchup = false, 
  onClick 
}: MatchupCardProps) {
  const homeScore = homeManager.score
  const awayScore = awayManager.score

  const isTied = homeScore === awayScore
  const homeWinning = homeScore > awayScore
  const awayWinning = awayScore > homeScore

  const getTeamClasses = (isWinning: boolean, isTied: boolean) => {
    if (isTied) {
      return 'border-yellow-500/40 bg-yellow-500/5'
    }
    if (isWinning) {
      return 'border-green-500/40 bg-green-500/5 shadow-lg shadow-green-500/10'
    }
    return 'border-slate-700/40 bg-slate-800/20'
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-xl border bg-slate-800/50 backdrop-blur-sm p-6 transition-all duration-300',
        'hover:scale-[1.02] hover:shadow-2xl',
        isUserMatchup 
          ? 'border-cyan-500/60 bg-cyan-500/5 shadow-xl shadow-cyan-500/20' 
          : 'border-slate-700/60',
        isTied && 'border-yellow-500/50 shadow-lg shadow-yellow-500/20'
      )}
    >
      {/* Special indicator for user's matchup */}
      {isUserMatchup && (
        <div className="absolute right-3 top-3">
          <Trophy className="h-5 w-5 text-cyan-400" />
        </div>
      )}

      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex items-center gap-4">
        {/* Home Team (Left Side) */}
        <div
          className={cn(
            'flex flex-1 flex-col items-center rounded-lg border-2 p-4 transition-all duration-300',
            getTeamClasses(homeWinning, isTied)
          )}
        >
          {/* Manager Avatar */}
          <div className="relative mb-3 h-16 w-16 overflow-hidden rounded-full border-2 border-slate-600">
            {homeManager.avatar ? (
              <img
                src={homeManager.avatar}
                alt={homeManager.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-slate-700 flex items-center justify-center text-slate-400 text-lg font-bold">
                {homeManager.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            {/* Winning glow effect */}
            {homeWinning && !isTied && (
              <div className="absolute inset-0 rounded-full bg-green-500/20 ring-2 ring-green-500/50" />
            )}
          </div>

          {/* Manager Name */}
          <h3
            className={cn(
              'text-center text-sm font-bold leading-tight text-white',
              homeManager.isCurrentUser && 'text-cyan-400'
            )}
          >
            {homeManager.name}
          </h3>

          {/* Record */}
          <p className="mt-1 text-xs text-slate-400">
            ({homeManager.record.wins}-{homeManager.record.losses})
          </p>

          {/* Score */}
          <div
            className={cn(
              'mt-3 text-4xl font-bold transition-colors duration-300',
              homeWinning && !isTied 
                ? 'text-green-400' 
                : isTied 
                  ? 'text-yellow-400' 
                  : 'text-slate-400'
            )}
          >
            {homeScore.toFixed(2)}
          </div>
        </div>

        {/* Center Divider with VS */}
        <div className="relative flex flex-col items-center">
          {/* VS Text */}
          <div
            className={cn(
              'relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold transition-all duration-300',
              isTied
                ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400 shadow-lg shadow-yellow-500/30'
                : 'border-slate-600 bg-slate-800 text-slate-400'
            )}
          >
            <span className="text-sm">VS</span>
          </div>

          {/* Decorative line */}
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-slate-600 to-transparent" />
        </div>

        {/* Away Team (Right Side) */}
        <div
          className={cn(
            'flex flex-1 flex-col items-center rounded-lg border-2 p-4 transition-all duration-300',
            getTeamClasses(awayWinning, isTied)
          )}
        >
          {/* Manager Avatar */}
          <div className="relative mb-3 h-16 w-16 overflow-hidden rounded-full border-2 border-slate-600">
            {awayManager.avatar ? (
              <img
                src={awayManager.avatar}
                alt={awayManager.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-slate-700 flex items-center justify-center text-slate-400 text-lg font-bold">
                {awayManager.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            {/* Winning glow effect */}
            {awayWinning && !isTied && (
              <div className="absolute inset-0 rounded-full bg-green-500/20 ring-2 ring-green-500/50" />
            )}
          </div>

          {/* Manager Name */}
          <h3
            className={cn(
              'text-center text-sm font-bold leading-tight text-white',
              awayManager.isCurrentUser && 'text-cyan-400'
            )}
          >
            {awayManager.name}
          </h3>

          {/* Record */}
          <p className="mt-1 text-xs text-slate-400">
            ({awayManager.record.wins}-{awayManager.record.losses})
          </p>

          {/* Score */}
          <div
            className={cn(
              'mt-3 text-4xl font-bold transition-colors duration-300',
              awayWinning && !isTied 
                ? 'text-green-400' 
                : isTied 
                  ? 'text-yellow-400' 
                  : 'text-slate-400'
            )}
          >
            {awayScore.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Tied game indicator */}
      {isTied && (
        <div className="mt-4 text-center">
          <span className="inline-block rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">
            Empate
          </span>
        </div>
      )}
    </div>
  )
})
