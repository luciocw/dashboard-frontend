import { usePlayers, getPlayerInfo, sortPlayersByPosition } from '@/hooks/usePlayers'
import { PlayerCard } from './PlayerCard'
import { Badge } from './ui/Badge'
import type { SleeperRoster, SleeperUser, SleeperLeague } from '@/types/sleeper'

interface RosterViewProps {
  roster: SleeperRoster
  owner: SleeperUser | undefined
  league: SleeperLeague
}

// Agrupar jogadores por posição
function groupByPosition(playerIds: string[], players: Record<string, any>): Record<string, string[]> {
  const groups: Record<string, string[]> = {}
  
  playerIds.forEach(id => {
    const player = players[id]
    if (player) {
      const pos = player.position || 'UNKNOWN'
      if (!groups[pos]) groups[pos] = []
      groups[pos].push(id)
    }
  })
  
  return groups
}

// Calcular idade média
function calculateAvgAge(playerIds: string[], players: Record<string, any>): number {
  const ages = playerIds
    .map(id => players[id]?.age)
    .filter((age): age is number => typeof age === 'number')
  
  if (ages.length === 0) return 0
  return ages.reduce((sum, age) => sum + age, 0) / ages.length
}

// Obter tags da liga
function getLeagueTags(league: SleeperLeague): { label: string; variant: 'default' | 'success' | 'warning' | 'info' | 'error' }[] {
  const tags: { label: string; variant: 'default' | 'success' | 'warning' | 'info' | 'error' }[] = []
  const positions = league.roster_positions || []
  
  // Tipo
  if (league.settings?.type === 2) tags.push({ label: 'DYNASTY', variant: 'success' })
  else if (league.settings?.type === 1) tags.push({ label: 'KEEPER', variant: 'warning' })
  else tags.push({ label: 'REDRAFT', variant: 'default' })
  
  // PPR (assumir que é PPR por padrão)
  tags.push({ label: 'PPR', variant: 'info' })
  
  // Superflex
  if (positions.includes('SUPER_FLEX')) tags.push({ label: 'SF', variant: 'error' })
  
  // IDP
  if (positions.some(p => ['DL', 'LB', 'DB', 'IDP_FLEX'].includes(p))) {
    tags.push({ label: 'IDP', variant: 'warning' })
  }
  
  // Times
  tags.push({ label: `${league.total_rosters}T`, variant: 'default' })
  
  return tags
}

// Formatar lineup positions
function formatLineup(positions: string[]): string[] {
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

const positionOrder = ['QB', 'RB', 'WR', 'TE', 'K', 'DL', 'LB', 'DB', 'DEF']

export function RosterView({ roster, owner, league }: RosterViewProps) {
  const { data: players, isLoading } = usePlayers()

  const ownerName = owner?.display_name || owner?.username || 'Meu Time'
  const leagueAvatar = league.avatar 
    ? `https://sleepercdn.com/avatars/thumbs/${league.avatar}`
    : null

  // Dados do roster
  const allPlayers = roster.players || []
  const starters = roster.starters || []
  const taxi = roster.taxi || []
  const ir = roster.reserve || []
  const bench = allPlayers.filter(p => !starters.includes(p) && !taxi.includes(p) && !ir.includes(p))

  // Tags e lineup
  const tags = getLeagueTags(league)
  const lineupPositions = formatLineup(league.roster_positions || [])

  if (isLoading || !players) {
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

  // Agrupar por posição
  const grouped = groupByPosition(allPlayers, players)
  const avgAge = calculateAvgAge(allPlayers, players)

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      {/* Header com logo e tags */}
      <div className="p-4 border-b border-slate-800 bg-slate-800/50">
        <div className="flex items-start gap-4">
          {/* Logo da liga */}
          {leagueAvatar ? (
            <img src={leagueAvatar} alt={league.name} className="w-14 h-14 rounded-lg" />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-slate-700 flex items-center justify-center text-2xl">
              🏈
            </div>
          )}
          
          <div className="flex-1">
            <h3 className="font-bold text-lg">{league.name}</h3>
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tag, i) => (
                <Badge key={i} variant={tag.variant}>{tag.label}</Badge>
              ))}
            </div>
          </div>
          
          {/* Record e Idade */}
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

      {/* Lineup Positions */}
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

      {/* Contadores */}
      <div className="px-4 py-3 border-b border-slate-800 flex gap-4 text-sm">
        <span className="text-yellow-500">⚠ {allPlayers.length}</span>
        <span className="text-red-500">{ir.length} IR</span>
        <span className="text-yellow-400">{taxi.length} TAXI</span>
      </div>

      {/* Jogadores agrupados por posição */}
      <div className="p-4 space-y-4">
        {positionOrder.map(pos => {
          const playersInPos = grouped[pos]
          if (!playersInPos || playersInPos.length === 0) return null
          
          const sortedPlayers = sortPlayersByPosition(playersInPos, players)
          
          return (
            <div key={pos}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`font-bold text-sm ${
                  pos === 'QB' ? 'text-red-400' :
                  pos === 'RB' ? 'text-green-400' :
                  pos === 'WR' ? 'text-blue-400' :
                  pos === 'TE' ? 'text-yellow-400' :
                  'text-slate-400'
                }`}>
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
}
