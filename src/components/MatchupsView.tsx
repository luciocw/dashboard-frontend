import { memo, useState } from 'react'
import { useMatchups, groupMatchups, type Matchup } from '@/hooks/useMatchups'
import type { SleeperLeague, SleeperRoster, SleeperUser } from '@/types/sleeper'

interface MatchupsViewProps {
  league: SleeperLeague
  rosters: SleeperRoster[]
  users: SleeperUser[]
  currentUserId?: string
}

interface MatchupCardProps {
  matchup: Matchup
  currentUserId?: string
}

const MatchupCard = memo(function MatchupCard({ matchup, currentUserId }: MatchupCardProps) {
  const { team1, team2 } = matchup
  
  const isMyMatchup = team1.owner?.user_id === currentUserId || team2.owner?.user_id === currentUserId
  const team1Winning = team1.points > team2.points
  const team2Winning = team2.points > team1.points
  const isTied = team1.points === team2.points && team1.points > 0

  return (
    <div className={`bg-slate-900 rounded-xl border overflow-hidden ${
      isMyMatchup ? 'border-blue-500/50' : 'border-slate-800'
    }`}>
      {/* Team 1 */}
      <div className={`p-4 flex items-center justify-between ${
        team1Winning ? 'bg-green-900/20' : ''
      } ${team1.owner?.user_id === currentUserId ? 'bg-blue-900/20' : ''}`}>
        <div className="flex items-center gap-3">
          {team1.owner?.avatar ? (
            <img 
              src={`https://sleepercdn.com/avatars/thumbs/${team1.owner.avatar}`}
              alt=""
              className="w-10 h-10 rounded-full"
              loading="lazy"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm">
              {team1.owner?.display_name?.charAt(0) || '?'}
            </div>
          )}
          <div>
            <div className={`font-medium ${team1.owner?.user_id === currentUserId ? 'text-blue-400' : 'text-white'}`}>
              {team1.owner?.display_name || team1.owner?.username || 'Time ' + team1.roster_id}
            </div>
            <div className="text-xs text-slate-500">
              {team1.roster?.settings.wins || 0}-{team1.roster?.settings.losses || 0}
            </div>
          </div>
        </div>
        <div className={`text-2xl font-bold ${
          team1Winning ? 'text-green-400' : isTied ? 'text-yellow-400' : 'text-white'
        }`}>
          {team1.points.toFixed(2)}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-800 flex items-center justify-center py-1 bg-slate-800/50">
        <span className="text-xs text-slate-500">VS</span>
      </div>

      {/* Team 2 */}
      <div className={`p-4 flex items-center justify-between ${
        team2Winning ? 'bg-green-900/20' : ''
      } ${team2.owner?.user_id === currentUserId ? 'bg-blue-900/20' : ''}`}>
        <div className="flex items-center gap-3">
          {team2.owner?.avatar ? (
            <img 
              src={`https://sleepercdn.com/avatars/thumbs/${team2.owner.avatar}`}
              alt=""
              className="w-10 h-10 rounded-full"
              loading="lazy"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm">
              {team2.owner?.display_name?.charAt(0) || '?'}
            </div>
          )}
          <div>
            <div className={`font-medium ${team2.owner?.user_id === currentUserId ? 'text-blue-400' : 'text-white'}`}>
              {team2.owner?.display_name || team2.owner?.username || 'Time ' + team2.roster_id}
            </div>
            <div className="text-xs text-slate-500">
              {team2.roster?.settings.wins || 0}-{team2.roster?.settings.losses || 0}
            </div>
          </div>
        </div>
        <div className={`text-2xl font-bold ${
          team2Winning ? 'text-green-400' : isTied ? 'text-yellow-400' : 'text-white'
        }`}>
          {team2.points.toFixed(2)}
        </div>
      </div>
    </div>
  )
})

export const MatchupsView = memo(function MatchupsView({ 
  league, 
  rosters, 
  users,
  currentUserId 
}: MatchupsViewProps) {
  // Pegar semana atual do estado da liga ou usar 1
  const currentWeek = league.settings?.leg || 1
  const [selectedWeek, setSelectedWeek] = useState(currentWeek)
  
  const { data: matchupsData, isLoading, error } = useMatchups(league.league_id, selectedWeek)
  
  const matchups = groupMatchups(matchupsData, rosters, users)
  
  // Gerar array de semanas disponíveis (1-18 para NFL regular + playoffs)
  const maxWeeks = 18
  const weeks = Array.from({ length: maxWeeks }, (_, i) => i + 1)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="h-8 w-32 bg-slate-700 rounded animate-pulse" />
          <div className="h-8 w-24 bg-slate-700 rounded animate-pulse" />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 h-32 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-slate-900 rounded-xl border border-red-900/50 p-6 text-center">
        <div className="text-2xl mb-2">⚠️</div>
        <p className="text-red-400">Erro ao carregar matchups</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header com seletor de semana */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Matchups</h3>
        <div className="flex items-center gap-2">
          <label htmlFor="week-select" className="text-sm text-slate-400">Semana:</label>
          <select
            id="week-select"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(Number(e.target.value))}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          >
            {weeks.map(week => (
              <option key={week} value={week}>
                {week} {week === currentWeek ? '(atual)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Matchups */}
      {matchups.length === 0 ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center">
          <div className="text-4xl mb-2">📅</div>
          <p className="text-slate-400">Nenhum matchup para esta semana</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {matchups.map(matchup => (
            <MatchupCard 
              key={matchup.matchup_id} 
              matchup={matchup}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  )
})
