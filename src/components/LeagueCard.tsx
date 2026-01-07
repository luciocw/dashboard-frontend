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

function getDraftPickBadgeColor(round: number) {
  if (round === 1) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
  if (round === 2) return 'bg-slate-300/20 text-slate-300 border-slate-400/40'
  if (round === 3) return 'bg-amber-700/20 text-amber-500 border-amber-600/40'
  return 'bg-slate-600/20 text-slate-400 border-slate-600/40'
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

// Calcula status do roster (atual vs máximo)
function getRosterStatus(roster: SleeperRoster | null | undefined, maxRosterSize: number) {
  if (!roster) return null
  
  const players = roster.players?.length || 0
  const taxi = roster.taxi?.length || 0
  const ir = roster.reserve?.length || 0
  const total = players
  
  const percentage = maxRosterSize > 0 ? (total / maxRosterSize) * 100 : 0
  
  let status: 'full' | 'warning' | 'ok' = 'ok'
  let emoji = '✅'
  let color = 'text-green-400'
  
  if (percentage >= 100) {
    status = 'full'
    emoji = '🔴'
    color = 'text-red-400'
  } else if (percentage >= 90) {
    status = 'warning'
    emoji = '⚠️'
    color = 'text-yellow-400'
  }
  
  return { total, max: maxRosterSize, taxi, ir, status, emoji, color }
}

// Agrupa picks por ano/round
function groupPicks(picks: any[] | undefined) {
  if (!picks || picks.length === 0) return { total: 0, summary: [] }
  
  const byYearRound: Record<string, number> = {}
  picks.forEach(pick => {
    const key = `'${String(pick.season).slice(2)} R${pick.round}`
    byYearRound[key] = (byYearRound[key] || 0) + 1
  })
  
  const summary = Object.entries(byYearRound)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(0, 4)
    .map(([pick, count]) => count > 1 ? `${pick} ×${count}` : pick)
  
  return { total: picks.length, summary }
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
  const lineupPositions = formatLineupPositions(league.roster_positions)
  const teamSize = league.total_rosters || 12
  
  // Tamanho máximo do roster = total de posições no roster_positions
  const maxRosterSize = league.roster_positions?.length || 0
  const rosterStatus = getRosterStatus(myRoster, maxRosterSize)
  const picksInfo = groupPicks(picks)
  
  const wins = myRoster?.settings?.wins || 0
  const losses = myRoster?.settings?.losses || 0
  const avgPoints = myRoster?.settings?.fpts 
    ? (myRoster.settings.fpts / Math.max(wins + losses, 1)).toFixed(1)
    : null

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
              {lineupPositions.slice(0, 12).map((position, idx) => (
                <span
                  key={idx}
                  className="rounded border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-300"
                >
                  {position}
                </span>
              ))}
              {lineupPositions.length > 12 && (
                <span className="text-[10px] text-slate-500">+{lineupPositions.length - 12}</span>
              )}
            </div>
          </div>
        )}

        {/* Roster Status + Draft Picks Row */}
        <div className="flex items-center gap-4 pt-2 border-t border-slate-700/50">
          {/* Roster Status */}
          {rosterStatus && (
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{rosterStatus.emoji}</span>
              <span className={cn('text-sm font-bold', rosterStatus.color)}>
                {rosterStatus.total}/{rosterStatus.max}
              </span>
              {(rosterStatus.ir > 0 || rosterStatus.taxi > 0) && (
                <span className="text-[10px] text-slate-500">
                  {rosterStatus.ir > 0 && `${rosterStatus.ir} IR`}
                  {rosterStatus.ir > 0 && rosterStatus.taxi > 0 && ' · '}
                  {rosterStatus.taxi > 0 && `${rosterStatus.taxi} Taxi`}
                </span>
              )}
            </div>
          )}

          {/* Separator */}
          {rosterStatus && picksInfo.total > 0 && (
            <div className="h-4 w-px bg-slate-600" />
          )}

          {/* Draft Picks */}
          {picksInfo.total > 0 && (
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="text-sm">📋</span>
              <span className="text-sm font-bold text-cyan-400">{picksInfo.total}</span>
              <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                {picksInfo.summary.map((pick, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      'rounded border px-1 py-0.5 text-[9px] font-semibold',
                      getDraftPickBadgeColor(parseInt(pick.split('R')[1]) || 4)
                    )}
                  >
                    {pick}
                  </span>
                ))}
                {picksInfo.total > 4 && (
                  <span className="text-[9px] text-slate-500">+{picksInfo.total - 4}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
