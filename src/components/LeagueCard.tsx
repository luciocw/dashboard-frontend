import { memo } from 'react'
import { Badge } from './ui/Badge'
import { DraftPickBadge } from './DraftPickBadge'
import { POSITION_COLORS, DISPLAY_POSITIONS } from '@/constants'
import { getLeagueTags, formatLineup } from '@/utils/league'
import { countByPosition, calculateAvgAge } from '@/utils/roster'
import { getPicksForRoster } from '@/hooks/useDraftPicks'
import type { SleeperLeague, SleeperRoster } from '@/types/sleeper'
import type { PlayersMap } from '@/hooks/usePlayers'
import type { TradedPick } from '@/hooks/useDraftPicks'

interface LeagueCardProps {
  league: SleeperLeague
  players?: PlayersMap
  myRoster?: SleeperRoster | null
  picks?: TradedPick[]
  onClick?: () => void
}

export const LeagueCard = memo(function LeagueCard({ 
  league, 
  players, 
  myRoster,
  picks,
  onClick 
}: LeagueCardProps) {
  const tags = getLeagueTags(league)
  const avatarUrl = league.avatar 
    ? `https://sleepercdn.com/avatars/thumbs/${league.avatar}`
    : null

  const lineup = formatLineup(league.roster_positions || [])
  
  const allPlayers = myRoster?.players || []
  const taxi = myRoster?.taxi || []
  const ir = myRoster?.reserve || []
  
  const positionCounts = players ? countByPosition(allPlayers, players) : {}
  const avgAge = players ? calculateAvgAge(allPlayers, players) : 0

  // Pegar picks do meu roster (próximas 3 temporadas)
  const currentYear = new Date().getFullYear()
  const futureSeasons = [currentYear + 1, currentYear + 2, currentYear + 3].map(String)
  const myPicks = myRoster 
    ? getPicksForRoster(picks, myRoster.roster_id, futureSeasons)
    : []

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      role="listitem"
      tabIndex={0}
      aria-label={`Liga ${league.name}, ${myRoster ? `${myRoster.settings.wins} vitórias e ${myRoster.settings.losses} derrotas` : 'carregando roster'}`}
      className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
    >
      <div className="flex items-start gap-3 mb-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-12 h-12 rounded-lg" loading="lazy" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-xl" aria-hidden="true">
            🏈
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white truncate group-hover:text-blue-400 transition-colors">
            {league.name}
          </h3>
          <div className="flex flex-wrap gap-1 mt-1">
            {tags.map((tag, i) => (
              <Badge key={i} variant={tag.variant}>{tag.label}</Badge>
            ))}
          </div>
        </div>

        {myRoster && (
          <div className="text-right">
            <div className="text-xl font-bold">
              {myRoster.settings.wins}-{myRoster.settings.losses}
            </div>
            <div className="text-xs text-slate-400">
              ⌀ {avgAge.toFixed(1)}
            </div>
          </div>
        )}
      </div>

      <div className="mb-3">
        <div className="text-xs text-slate-500 mb-1">LINEUP</div>
        <div className="flex flex-wrap gap-1">
          {lineup.slice(0, 12).map((pos, i) => (
            <span 
              key={i} 
              className={`px-1.5 py-0.5 rounded text-xs font-medium ${
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

      {myRoster && (
        <div className="flex gap-3 text-xs mb-3">
          <span className="text-yellow-500">⚠ {allPlayers.length}</span>
          <span className="text-red-500">{ir.length} IR</span>
          <span className="text-yellow-400">{taxi.length} TAXI</span>
        </div>
      )}

      {myRoster && players && (
        <div className="flex gap-3 text-sm mb-3">
          {DISPLAY_POSITIONS.map(pos => (
            <div key={pos} className="flex items-center gap-1">
              <span className={`font-bold ${POSITION_COLORS[pos] || 'text-slate-400'}`}>
                {pos}
              </span>
              <span className="text-slate-400">{positionCounts[pos] || 0}</span>
            </div>
          ))}
        </div>
      )}

      {/* Draft Picks */}
      {myPicks.length > 0 && (
        <div>
          <div className="text-xs text-slate-500 mb-1">DRAFT PICKS</div>
          <div className="flex flex-wrap gap-1">
            {myPicks.slice(0, 10).map((pick, i) => (
              <DraftPickBadge 
                key={i} 
                season={pick.season} 
                round={pick.round}
                isOwn={pick.previous_owner_id === pick.owner_id}
              />
            ))}
            {myPicks.length > 10 && (
              <span className="text-xs text-slate-500">+{myPicks.length - 10}</span>
            )}
          </div>
        </div>
      )}

      {myRoster === undefined && (
        <div className="text-xs text-slate-500">Carregando roster...</div>
      )}
    </div>
  )
})
