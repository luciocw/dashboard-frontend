import { memo } from 'react'
import { usePlayers, getPlayerInfo, sortPlayersByPosition } from '@/hooks/usePlayers'
import { useDraftPicks, getPicksForRoster, getLostPicks } from '@/hooks/useDraftPicks'
import { POSITION_COLORS, POSITION_ORDER } from '@/constants'
import { getLeagueTags, formatLineup } from '@/utils/league'
import { calculateAvgAge, groupByPosition } from '@/utils/roster'
import { PlayerCard } from './PlayerCard'
import { DraftPickBadge } from './DraftPickBadge'
import { Badge } from './ui/Badge'
import type { SleeperRoster, SleeperUser, SleeperLeague } from '@/types/sleeper'

interface RosterViewProps {
  roster: SleeperRoster
  owner: SleeperUser | undefined
  league: SleeperLeague
}

export const RosterView = memo(function RosterView({ roster, owner, league }: RosterViewProps) {
  const { data: players, isLoading: loadingPlayers } = usePlayers()
  const { data: picks, isLoading: loadingPicks } = useDraftPicks(league.league_id)

  const leagueAvatar = league.avatar 
    ? `https://sleepercdn.com/avatars/thumbs/${league.avatar}`
    : null

  const allPlayers = roster.players || []
  const starters = roster.starters || []
  const taxi = roster.taxi || []
  const ir = roster.reserve || []

  const tags = getLeagueTags(league)
  const lineupPositions = formatLineup(league.roster_positions || [])

  // Picks
  const currentYear = new Date().getFullYear()
  const futureSeasons = [currentYear + 1, currentYear + 2, currentYear + 3].map(String)
  const myPicks = getPicksForRoster(picks, roster.roster_id, futureSeasons)
  const lostPicks = getLostPicks(picks, roster.roster_id).filter(p => futureSeasons.includes(p.season))

  if (loadingPlayers || !players) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <div className="animate-pulse">
          <div className="h-16 bg-slate-700 rounded mb-4"></div>
          <div className="space-y-2">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="h-8 bg-slate-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const grouped = groupByPosition(allPlayers, players)
  const avgAge = calculateAvgAge(allPlayers, players)

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-800/50">
        <div className="flex items-start gap-4">
          {leagueAvatar ? (
            <img src={leagueAvatar} alt={league.name} className="w-14 h-14 rounded-lg" loading="lazy" />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-slate-700 flex items-center justify-center text-2xl">
              🏈
            </div>
          )}
          
          <div className="flex-1">
            <h3 className="font-bold text-lg">{league.name}</h3>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tag, i) => (
                <Badge key={i} variant={tag.variant}>{tag.label}</Badge>
              ))}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold">
              {roster.settings.wins}-{roster.settings.losses}
            </div>
            <div className="text-sm text-slate-400">
              ⌀ {avgAge.toFixed(1)} anos
            </div>
          </div>
        </div>
      </div>

      {/* Lineup */}
      <div className="px-4 py-3 border-b border-slate-800">
        <div className="text-xs text-slate-500 mb-2">LINEUP</div>
        <div className="flex flex-wrap gap-2">
          {lineupPositions.map((pos, i) => (
            <span 
              key={i} 
              className={`px-2 py-1 rounded text-xs font-bold ${
                pos.includes('SF') || pos.includes('SUPER') 
                  ? 'bg-red-900/50 text-red-300' 
                  : pos.includes('FLEX')
                  ? 'bg-purple-900/50 text-purple-300'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {pos}
            </span>
          ))}
        </div>
      </div>

      {/* Counters */}
      <div className="px-4 py-3 border-b border-slate-800 flex gap-4 text-sm">
        <span className="text-yellow-500">⚠ {allPlayers.length}</span>
        <span className="text-red-500">{ir.length} IR</span>
        <span className="text-yellow-400">{taxi.length} TAXI</span>
      </div>

      {/* Draft Picks Section */}
      {(myPicks.length > 0 || lostPicks.length > 0) && (
        <div className="px-4 py-3 border-b border-slate-800">
          <div className="text-xs text-slate-500 mb-2">DRAFT PICKS ({currentYear + 1}-{currentYear + 3})</div>
          
          {/* Picks que tenho */}
          {myPicks.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-green-500 mb-1">✓ Picks ({myPicks.length})</div>
              <div className="flex flex-wrap gap-1">
                {myPicks.map((pick, i) => (
                  <DraftPickBadge 
                    key={i} 
                    season={pick.season} 
                    round={pick.round}
                    isOwn={pick.previous_owner_id === roster.roster_id}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Picks que perdi */}
          {lostPicks.length > 0 && (
            <div>
              <div className="text-xs text-red-500 mb-1">✗ Picks Negociadas ({lostPicks.length})</div>
              <div className="flex flex-wrap gap-1 opacity-50">
                {lostPicks.map((pick, i) => (
                  <DraftPickBadge 
                    key={i} 
                    season={pick.season} 
                    round={pick.round}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {loadingPicks && (
        <div className="px-4 py-3 border-b border-slate-800">
          <div className="text-xs text-slate-500">Carregando picks...</div>
        </div>
      )}

      {/* Players by Position */}
      <div className="p-4 space-y-4">
        {POSITION_ORDER.map(pos => {
          const playersInPos = grouped[pos]
          if (!playersInPos || playersInPos.length === 0) return null
          
          const sortedPlayers = sortPlayersByPosition(playersInPos, players)
          
          return (
            <div key={pos}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`font-bold text-sm ${POSITION_COLORS[pos] || 'text-slate-400'}`}>
                  {pos}
                </span>
                <span className="text-slate-500 text-sm">{playersInPos.length}</span>
              </div>
              <div className="space-y-1">
                {sortedPlayers.map((playerId: string) => {
                  const isStarter = starters.includes(playerId)
                  const isTaxi = taxi.includes(playerId)
                  const isIR = ir.includes(playerId)
                  
                  return (
                    <PlayerCard 
                      key={playerId} 
                      player={getPlayerInfo(players, playerId)} 
                      isStarter={isStarter}
                      isTaxi={isTaxi}
                      isIR={isIR}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
