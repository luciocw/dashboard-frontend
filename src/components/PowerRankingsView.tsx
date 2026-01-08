import { memo } from 'react'
import { calculatePowerRankings, type PowerRanking } from '@/utils/powerRankings'
import type { SleeperRoster, SleeperUser } from '@/types/sleeper'

interface PowerRankingsViewProps {
  rosters: SleeperRoster[]
  users: SleeperUser[]
  currentUserId?: string
}

const TrendIcon = ({ trend }: { trend: PowerRanking['trend'] }) => {
  if (trend === 'up') return <span className="text-green-400">↑</span>
  if (trend === 'down') return <span className="text-red-400">↓</span>
  return <span className="text-slate-500">−</span>
}

const RankBadge = ({ rank }: { rank: number }) => {
  const colors = {
    1: 'bg-yellow-500 text-black',
    2: 'bg-slate-400 text-black',
    3: 'bg-amber-700 text-white',
  }
  
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
      colors[rank as keyof typeof colors] || 'bg-slate-700 text-white'
    }`}>
      {rank}
    </div>
  )
}

export const PowerRankingsView = memo(function PowerRankingsView({
  rosters,
  users,
  currentUserId
}: PowerRankingsViewProps) {
  const rankings = calculatePowerRankings(rosters, users)

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      {/* Header com explicação */}
      <div className="p-4 border-b border-slate-800">
        <h2 className="font-semibold mb-2">⚡ Power Rankings</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Ranking alternativo que mede a força real do time, não apenas vitórias e derrotas. 
          Times podem ter azar nos matchups mas ter um roster forte. 
          Útil para identificar times perigosos que estão abaixo na classificação mas são fortes.
        </p>
      </div>

      {/* Rankings */}
      <div className="divide-y divide-slate-800">
        {rankings.map((team) => {
          const isMe = team.owner?.user_id === currentUserId
          
          return (
            <div 
              key={team.rosterId}
              className={`p-4 flex items-center gap-4 ${isMe ? 'bg-blue-900/20' : ''}`}
            >
              {/* Rank */}
              <RankBadge rank={team.rank} />

              {/* Avatar */}
              {team.owner?.avatar ? (
                <img
                  src={`https://sleepercdn.com/avatars/thumbs/${team.owner.avatar}`}
                  alt={team.owner?.display_name || team.owner?.username}
                  className="w-10 h-10 rounded-full"
                  loading="lazy"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                  {team.owner?.display_name?.charAt(0) || '?'}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-medium truncate ${isMe ? 'text-blue-400' : 'text-white'}`}>
                    {team.owner?.display_name || team.owner?.username || 'Time ' + team.rosterId}
                  </span>
                  {isMe && <span className="text-xs text-blue-400">(você)</span>}
                  <TrendIcon trend={team.trend} />
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>{team.wins}-{team.losses}</span>
                  <span>•</span>
                  <span>{team.totalPoints.toFixed(1)} pts</span>
                  <span>•</span>
                  <span>⌀ {team.avgPoints.toFixed(1)}</span>
                </div>
              </div>

              {/* Power Score */}
              <div className="text-right">
                <div className="text-lg font-bold text-blue-400">
                  {team.powerScore.toFixed(1)}
                </div>
                <div className="text-xs text-slate-500">PWR</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
