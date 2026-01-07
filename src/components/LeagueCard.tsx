import { memo } from 'react'
import { cn } from '@/utils/cn'
import type { SleeperLeague, SleeperRoster } from '@/types/sleeper'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface LeagueCardProps {
  league: SleeperLeague
  players?: any
  myRoster?: SleeperRoster | null
  picks?: any[]
  onClick?: () => void
}

// Helpers
function getLeagueType(type?: number): 'DYNASTY' | 'REDRAFT' | 'KEEPER' {
  if (type === 2) return 'DYNASTY'
  if (type === 1) return 'KEEPER'
  return 'REDRAFT'
}

function getLeagueTypeBadgeColor(type: string) {
  switch (type) {
    case 'DYNASTY': return 'bg-purple-500/20 text-purple-300 border-purple-500/40'
    case 'KEEPER': return 'bg-orange-500/20 text-orange-300 border-orange-500/40'
    default: return 'bg-slate-500/20 text-slate-300 border-slate-500/40'
  }
}

function getFormatBadgeColor(format: string) {
  switch (format) {
    case 'PPR': return 'bg-blue-500/20 text-blue-300 border-blue-500/40'
    case 'SF': return 'bg-green-500/20 text-green-300 border-green-500/40'
    case 'IDP': return 'bg-red-500/20 text-red-300 border-red-500/40'
    default: return 'bg-slate-500/20 text-slate-300 border-slate-500/40'
  }
}

function getPositionColor(position: string) {
  switch (position) {
    case 'QB': return 'text-red-400'
    case 'RB': return 'text-green-400'
    case 'WR': return 'text-blue-400'
    case 'TE': return 'text-yellow-400'
    case 'K': return 'text-purple-400'
    case 'DEF': return 'text-orange-400'
    default: return 'text-slate-400'
  }
}

function getDraftPickBadgeColor(round: number) {
  if (round === 1) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
  if (round === 2) return 'bg-slate-300/20 text-slate-300 border-slate-400/40'
  if (round === 3) return 'bg-amber-700/20 text-amber-500 border-amber-600/40'
  return 'bg-slate-600/20 text-slate-400 border-slate-600/40'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function countPlayersByPosition(roster: SleeperRoster | null | undefined, players?: any) {
  const counts: Record<string, number> = { QB: 0, RB: 0, WR: 0, TE: 0 }
  
  if (!roster?.players || !players) return counts
  
  roster.players.forEach((playerId: string) => {
    const player = players[playerId]
    if (player?.position && counts[player.position] !== undefined) {
      counts[player.position]++
    }
  })
  
  return counts
}

function getFormats(league: SleeperLeague): string[] {
  const formats: string[] = []
  
  const positions = league.roster_positions || []
  if (positions.includes('SUPER_FLEX')) formats.push('SF')
  if (positions.some(p => ['IDP_FLEX', 'DL', 'LB', 'DB'].includes(p))) formats.push('IDP')
  
  return formats
}

function formatLineupPositions(positions: string[] | undefined): string[] {
  if (!positions) return []
  
  const counts: Record<string, number> = {}
  positions.forEach(pos => {
    if (pos !== 'BN') {
      counts[pos] = (counts[pos] || 0) + 1
    }
  })
  
  return Object.entries(counts).map(([pos, count]) => 
    count > 1 ? `${count}${pos}` : pos
  )
}

export const LeagueCard = memo(function LeagueCard({
  league,
  players,
  myRoster,
  picks,
  onClick,
}: LeagueCardProps) {
  const leagueType = getLeagueType(league.settings?.type)
  const formats = getFormats(league)
  const playerCounts = countPlayersByPosition(myRoster, players)
  const lineupPositions = formatLineupPositions(league.roster_positions)
  const teamSize = league.total_rosters || 12
  
  const wins = myRoster?.settings?.wins || 0
  const losses = myRoster?.settings?.losses || 0
  const avgPoints = myRoster?.settings?.fpts 
    ? (myRoster.settings.fpts / Math.max(wins + losses, 1)).toFixed(1)
    : null

  // Group picks by year and round
  const picksByYear = picks?.reduce<Record<string, number>>((acc, pick) => {
    const key = `'${String(pick.season).slice(2)} R${pick.round}`
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {}) || {}

  return (
    <div
      onClick={onClick}
      role="listitem"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-xl border border-slate-700/60 bg-slate-800/50 backdrop-blur-sm p-5 transition-all duration-300',
        'hover:scale-[1.02] hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10',
        'focus:outline-none focus:ring-2 focus:ring-cyan-500/50'
      )}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative">
        {/* Header with Avatar, Name, and Record */}
        <div className="mb-4 flex items-start gap-3">
          {league.avatar ? (
            <img
              src={`https://sleepercdn.com/avatars/thumbs/${league.avatar}`}
              alt=""
              className="h-14 w-14 flex-shrink-0 rounded-full border-2 border-cyan-500/40 object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-14 w-14 flex-shrink-0 rounded-full border-2 border-slate-600 bg-slate-700 flex items-center justify-center text-slate-400 text-lg font-bold">
              {league.name?.charAt(0) || '?'}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold leading-tight text-white truncate group-hover:text-cyan-400 transition-colors">
              {league.name}
            </h3>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-cyan-400">
                {wins}-{losses}
              </span>
              {avgPoints && (
                <span className="text-sm text-slate-400">
                  ø {avgPoints}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Badges Row */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          <span className={cn(
            'rounded-md border px-2 py-0.5 text-xs font-semibold uppercase',
            getLeagueTypeBadgeColor(leagueType)
          )}>
            {leagueType}
          </span>

          {formats.map((fmt) => (
            <span
              key={fmt}
              className={cn(
                'rounded-md border px-2 py-0.5 text-xs font-semibold uppercase',
                getFormatBadgeColor(fmt)
              )}
            >
              {fmt}
            </span>
          ))}

          <span className="rounded-md border border-slate-600 bg-slate-700/50 px-2 py-0.5 text-xs font-semibold text-slate-300">
            {teamSize}T
          </span>
        </div>

        {/* Lineup Section */}
        {lineupPositions.length > 0 && (
          <div className="mb-3">
            <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Lineup
            </h4>
            <div className="flex flex-wrap gap-1">
              {lineupPositions.slice(0, 8).map((position, idx) => (
                <span
                  key={idx}
                  className="rounded border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-300"
                >
                  {position}
                </span>
              ))}
              {lineupPositions.length > 8 && (
                <span className="text-[10px] text-slate-500">+{lineupPositions.length - 8}</span>
              )}
            </div>
          </div>
        )}

        {/* Player Count by Position */}
        {myRoster && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-3">
              {Object.entries(playerCounts).map(([position, count]) => (
                <div key={position} className="flex items-baseline gap-0.5">
                  <span className={cn('text-xs font-bold', getPositionColor(position))}>
                    {position}
                  </span>
                  <span className={cn('text-sm font-bold', getPositionColor(position))}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Draft Picks Section */}
        {Object.keys(picksByYear).length > 0 && (
          <div>
            <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Picks
            </h4>
            <div className="flex flex-wrap gap-1">
              {Object.entries(picksByYear).slice(0, 6).map(([pick, count]) => {
                const round = parseInt(pick.split('R')[1]) || 4
                return (
                  <span
                    key={pick}
                    className={cn(
                      'rounded-md border px-1.5 py-0.5 text-[10px] font-semibold',
                      getDraftPickBadgeColor(round)
                    )}
                  >
                    {pick}{count > 1 ? ` ×${count}` : ''}
                  </span>
                )
              })}
              {Object.keys(picksByYear).length > 6 && (
                <span className="text-[10px] text-slate-500">+{Object.keys(picksByYear).length - 6}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
})
