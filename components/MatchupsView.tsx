import { memo, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { MatchupCard } from '@/components/MatchupCard'
import { cn } from '@/lib/utils'
import { API_URL, CACHE_TIMES } from '@/constants'
import type { SleeperLeague, SleeperRoster, SleeperUser } from '@/types/sleeper'

interface MatchupData {
  roster_id: number
  matchup_id: number
  points: number
  starters_points?: number[]
}

interface MatchupsViewProps {
  league: SleeperLeague
  rosters: SleeperRoster[]
  users: SleeperUser[]
  currentUserId?: string
}

async function fetchMatchups(leagueId: string, week: number): Promise<MatchupData[]> {
  const res = await fetch(`${API_URL}/league/${leagueId}/matchups/${week}`)
  if (!res.ok) throw new Error('Failed to fetch matchups')
  return res.json()
}

export const MatchupsView = memo(function MatchupsView({
  league,
  rosters,
  users,
  currentUserId,
}: MatchupsViewProps) {
  // Semana atual da liga (ou 1 se não definido)
  const currentWeek = league.settings?.leg || 1
  const [selectedWeek, setSelectedWeek] = useState(currentWeek)

  const { data: matchups, isLoading, error } = useQuery({
    queryKey: ['matchups', league.league_id, selectedWeek],
    queryFn: () => fetchMatchups(league.league_id, selectedWeek),
    staleTime: CACHE_TIMES.LEAGUE_DATA,
  })

  // Mapear roster_id para user info
  const rosterToUser = new Map<number, { name: string; avatar?: string; rosterId: number }>()
  rosters.forEach(roster => {
    const user = users.find(u => u.user_id === roster.owner_id)
    rosterToUser.set(roster.roster_id, {
      name: user?.display_name || user?.username || `Time ${roster.roster_id}`,
      avatar: user?.avatar ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}` : undefined,
      rosterId: roster.roster_id,
    })
  })

  // Encontrar roster do usuário atual
  const myRoster = rosters.find(r => r.owner_id === currentUserId)
  const myRosterId = myRoster?.roster_id

  // Agrupar matchups por matchup_id
  const matchupPairs = new Map<number, MatchupData[]>()
  matchups?.forEach(m => {
    const existing = matchupPairs.get(m.matchup_id) || []
    existing.push(m)
    matchupPairs.set(m.matchup_id, existing)
  })

  // Converter para array de pares
  const pairs = Array.from(matchupPairs.values())
    .filter(pair => pair.length === 2)
    .sort((a, b) => {
      // Meu matchup primeiro
      const aHasMe = a.some(m => m.roster_id === myRosterId)
      const bHasMe = b.some(m => m.roster_id === myRosterId)
      if (aHasMe && !bHasMe) return -1
      if (!aHasMe && bHasMe) return 1
      return 0
    })

  const handlePrevWeek = () => {
    if (selectedWeek > 1) setSelectedWeek(selectedWeek - 1)
  }

  const handleNextWeek = () => {
    if (selectedWeek < 18) setSelectedWeek(selectedWeek + 1)
  }

  return (
    <div className="space-y-6">
      {/* Week Selector */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handlePrevWeek}
          disabled={selectedWeek <= 1}
          className={cn(
            'p-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50',
            selectedWeek <= 1
              ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed'
              : 'bg-slate-800/50 border border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-cyan-500/40'
          )}
          aria-label="Semana anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 px-6 py-2 bg-slate-800/50 border border-slate-700/60 rounded-xl">
          <span className="text-sm text-slate-400">Semana</span>
          <span className="text-2xl font-bold text-cyan-400">{selectedWeek}</span>
          {selectedWeek === currentWeek && (
            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-green-500/20 text-green-400 rounded-full border border-green-500/40">
              Atual
            </span>
          )}
        </div>

        <button
          onClick={handleNextWeek}
          disabled={selectedWeek >= 18}
          className={cn(
            'p-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50',
            selectedWeek >= 18
              ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed'
              : 'bg-slate-800/50 border border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-cyan-500/40'
          )}
          aria-label="Próxima semana"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-6 text-center">
          <p className="text-red-400">Erro ao carregar matchups</p>
        </div>
      )}

      {/* Matchups Grid */}
      {!isLoading && !error && (
        <div className="grid gap-4 md:grid-cols-2">
          {pairs.map((pair, index) => {
            const [team1Data, team2Data] = pair
            const team1 = rosterToUser.get(team1Data.roster_id)
            const team2 = rosterToUser.get(team2Data.roster_id)

            if (!team1 || !team2) return null

            const roster1 = rosters.find(r => r.roster_id === team1Data.roster_id)
            const roster2 = rosters.find(r => r.roster_id === team2Data.roster_id)

            const isUserMatchup = team1Data.roster_id === myRosterId || team2Data.roster_id === myRosterId

            return (
              <MatchupCard
                key={`${team1Data.matchup_id}-${index}`}
                homeManager={{
                  name: team1.name,
                  avatar: team1.avatar,
                  score: team1Data.points || 0,
                  record: {
                    wins: roster1?.settings?.wins || 0,
                    losses: roster1?.settings?.losses || 0,
                  },
                  isCurrentUser: team1Data.roster_id === myRosterId,
                }}
                awayManager={{
                  name: team2.name,
                  avatar: team2.avatar,
                  score: team2Data.points || 0,
                  record: {
                    wins: roster2?.settings?.wins || 0,
                    losses: roster2?.settings?.losses || 0,
                  },
                  isCurrentUser: team2Data.roster_id === myRosterId,
                }}
                isUserMatchup={isUserMatchup}
              />
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && pairs.length === 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/60 p-8 text-center">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-lg font-semibold mb-2 text-white">Sem matchups</h3>
          <p className="text-slate-400">Não há matchups para a semana {selectedWeek}.</p>
        </div>
      )}
    </div>
  )
})
