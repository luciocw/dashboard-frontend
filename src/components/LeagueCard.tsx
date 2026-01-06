import { Badge } from './ui/Badge'
import { useAppStore } from '@/store/useAppStore'
import { useMyRoster } from '@/hooks/useMyRoster'
import { usePlayers } from '@/hooks/usePlayers'
import type { SleeperLeague } from '@/types/sleeper'

interface LeagueCardProps {
  league: SleeperLeague
  onClick?: () => void
}

function getLeagueType(settings: SleeperLeague['settings']): string {
  switch (settings?.type) {
    case 0: return 'Redraft'
    case 1: return 'Keeper'
    case 2: return 'Dynasty'
    default: return 'Redraft'
  }
}

function getLeagueTags(league: SleeperLeague): { label: string; variant: 'default' | 'success' | 'warning' | 'info' | 'error' }[] {
  const tags: { label: string; variant: 'default' | 'success' | 'warning' | 'info' | 'error' }[] = []
  const positions = league.roster_positions || []
  
  // Tipo
  const type = getLeagueType(league.settings)
  if (type === 'Dynasty') tags.push({ label: 'DYNASTY', variant: 'success' })
  else if (type === 'Keeper') tags.push({ label: 'KEEPER', variant: 'warning' })
  else tags.push({ label: 'REDRAFT', variant: 'default' })
  
  // PPR
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

// Formatar lineup
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

// Contar por posição
function countByPosition(playerIds: string[], players: Record<string, any>): Record<string, number> {
  const counts: Record<string, number> = {}
  playerIds.forEach(id => {
    const player = players[id]
    if (player?.position) {
      counts[player.position] = (counts[player.position] || 0) + 1
    }
  })
  return counts
}

// Calcular idade média
function calculateAvgAge(playerIds: string[], players: Record<string, any>): number {
  const ages = playerIds
    .map(id => players[id]?.age)
    .filter((age): age is number => typeof age === 'number')
  if (ages.length === 0) return 0
  return ages.reduce((sum, age) => sum + age, 0) / ages.length
}

export function LeagueCard({ league, onClick }: LeagueCardProps) {
  const currentUser = useAppStore((state) => state.currentUser)
  const { data: rosterData } = useMyRoster(league.league_id, currentUser?.user_id)
  const { data: players } = usePlayers()
  
  const tags = getLeagueTags(league)
  const avatarUrl = league.avatar 
    ? `https://sleepercdn.com/avatars/thumbs/${league.avatar}`
    : null

  const lineup = formatLineup(league.roster_positions || [])
  
  // Dados do meu roster
  const myRoster = rosterData?.roster
  const allPlayers = myRoster?.players || []
  const taxi = myRoster?.taxi || []
  const ir = myRoster?.reserve || []
  
  // Stats do roster
  const positionCounts = players ? countByPosition(allPlayers, players) : {}
  const avgAge = players ? calculateAvgAge(allPlayers, players) : 0
  
  // Posições para mostrar
  const positionsToShow = ['QB', 'RB', 'WR', 'TE']

  return (
    <div
      onClick={onClick}
      className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all cursor-pointer group"
    >
      {/* Header: Logo + Nome + Record */}
      <div className="flex items-start gap-3 mb-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt={league.name} className="w-12 h-12 rounded-lg" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-xl">
            🏈
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white truncate group-hover:text-blue-400 transition-colors">
            {league.name}
          </h3>
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-1">
            {tags.map((tag, i) => (
              <Badge key={i} variant={tag.variant}>{tag.label}</Badge>
            ))}
          </div>
        </div>

        {/* Record + Idade */}
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

      {/* Lineup */}
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

      {/* Contadores */}
      {myRoster && (
        <div className="flex gap-3 text-xs mb-3">
          <span className="text-yellow-500">⚠ {allPlayers.length}</span>
          <span className="text-red-500">{ir.length} IR</span>
          <span className="text-yellow-400">{taxi.length} TAXI</span>
        </div>
      )}

      {/* Contagem por posição */}
      {myRoster && players && (
        <div className="flex gap-3 text-sm">
          {positionsToShow.map(pos => (
            <div key={pos} className="flex items-center gap-1">
              <span className={`font-bold ${
                pos === 'QB' ? 'text-red-400' :
                pos === 'RB' ? 'text-green-400' :
                pos === 'WR' ? 'text-blue-400' :
                pos === 'TE' ? 'text-yellow-400' :
                'text-slate-400'
              }`}>
                {pos}
              </span>
              <span className="text-slate-400">{positionCounts[pos] || 0}</span>
            </div>
          ))}
        </div>
      )}

      {/* Loading state */}
      {!myRoster && (
        <div className="text-xs text-slate-500">Carregando roster...</div>
      )}
    </div>
  )
}
