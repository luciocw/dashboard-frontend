import { memo } from 'react'
import { Users, Truck, ShieldPlus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/utils/cn'
import { API_URL, CACHE_TIMES } from '@/constants'
import type { SleeperLeague, SleeperRoster } from '@/types/sleeper'

interface Player {
  player_id: string
  first_name: string
  last_name: string
  full_name?: string
  position: string
  team: string | null
  age?: number
  status?: string
  injury_status?: string
}

type PlayersMap = Record<string, Player>

interface RosterViewProps {
  roster: SleeperRoster
  league: SleeperLeague
}

async function fetchPlayers(): Promise<PlayersMap> {
  const res = await fetch(`${API_URL}/players/nfl`)
  if (!res.ok) throw new Error('Failed to fetch players')
  return res.json()
}

function getPositionColor(position: string) {
  switch (position) {
    case 'QB': return 'bg-red-500/20 text-red-400 border-red-500/40'
    case 'RB': return 'bg-green-500/20 text-green-400 border-green-500/40'
    case 'WR': return 'bg-blue-500/20 text-blue-400 border-blue-500/40'
    case 'TE': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
    case 'K': return 'bg-purple-500/20 text-purple-400 border-purple-500/40'
    case 'DEF': return 'bg-orange-500/20 text-orange-400 border-orange-500/40'
    case 'DL': return 'bg-pink-500/20 text-pink-400 border-pink-500/40'
    case 'LB': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
    case 'DB': return 'bg-teal-500/20 text-teal-400 border-teal-500/40'
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/40'
  }
}

function getInjuryBadge(status?: string) {
  if (!status) return null
  
  const colors: Record<string, string> = {
    'Out': 'bg-red-500/20 text-red-400 border-red-500/40',
    'Doubtful': 'bg-red-500/20 text-red-400 border-red-500/40',
    'Questionable': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    'IR': 'bg-red-500/20 text-red-400 border-red-500/40',
    'PUP': 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    'Sus': 'bg-slate-500/20 text-slate-400 border-slate-500/40',
  }
  
  return colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/40'
}

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

const PlayerRow = memo(function PlayerRow({ 
  player, 
  isStarter,
  slotType,
}: { 
  player: Player
  isStarter: boolean
  slotType?: string
}) {
  const positionColor = getPositionColor(player.position)
  const injuryColor = getInjuryBadge(player.injury_status)
  
  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-lg transition-all',
      isStarter 
        ? 'bg-slate-800/50 border border-slate-700/60' 
        : 'bg-slate-900/30 border border-transparent hover:border-slate-700/40'
    )}>
      {/* Position Badge */}
      <div className={cn(
        'flex-shrink-0 w-10 h-10 rounded-lg border flex items-center justify-center font-bold text-xs',
        positionColor
      )}>
        {player.position}
      </div>
      
      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white truncate">
            {player.full_name || `${player.first_name} ${player.last_name}`}
          </span>
          {player.injury_status && injuryColor && (
            <span className={cn(
              'px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded border',
              injuryColor
            )}>
              {player.injury_status}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{player.team || 'FA'}</span>
          {player.age && (
            <>
              <span className="text-slate-600">•</span>
              <span>{player.age} anos</span>
            </>
          )}
          {slotType && (
            <>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400">{slotType}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
})

export const RosterView = memo(function RosterView({ roster, league }: RosterViewProps) {
  const { data: players, isLoading } = useQuery({
    queryKey: ['players'],
    queryFn: fetchPlayers,
    staleTime: CACHE_TIMES.PLAYERS,
  })

  const lineupPositions = formatLineup(league.roster_positions || [])
  const rosterPositions = league.roster_positions || []
  
  // Separar starters, bench, taxi e IR
  const starters = roster.starters || []
  const allPlayers = roster.players || []
  const taxi = roster.taxi || []
  const reserve = roster.reserve || []
  
  // Bench = players que não são starters, taxi ou reserve
  const startersSet = new Set(starters)
  const taxiSet = new Set(taxi)
  const reserveSet = new Set(reserve)
  const bench = allPlayers.filter(id => 
    !startersSet.has(id) && !taxiSet.has(id) && !reserveSet.has(id)
  )

  // Contar posições
  const rosterCount = allPlayers.length
  const maxRoster = rosterPositions.length

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/60 p-6">
          <div className="h-6 bg-slate-700 rounded w-32 mb-4 animate-pulse" />
          <div className="space-y-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-16 bg-slate-700/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/60 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-cyan-400" />
            <span className="font-semibold text-white">Roster</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-lg font-bold',
                rosterCount >= maxRoster ? 'text-red-400' : 'text-cyan-400'
              )}>
                {rosterCount}/{maxRoster}
              </span>
              <span className="text-xs text-slate-400">jogadores</span>
            </div>
            {taxi.length > 0 && (
              <div className="flex items-center gap-1.5 text-sm">
                <Truck className="h-4 w-4 text-amber-400" />
                <span className="text-amber-400 font-medium">{taxi.length}</span>
              </div>
            )}
            {reserve.length > 0 && (
              <div className="flex items-center gap-1.5 text-sm">
                <ShieldPlus className="h-4 w-4 text-red-400" />
                <span className="text-red-400 font-medium">{reserve.length}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Lineup Positions */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {lineupPositions.map((pos, idx) => (
            <span 
              key={idx}
              className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-slate-700/50 text-slate-300 rounded border border-slate-600/50"
            >
              {pos}
            </span>
          ))}
        </div>
      </div>

      {/* Starters */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700/40 bg-slate-900/50">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Starters ({starters.length})
          </h3>
        </div>
        <div className="p-3 space-y-2">
          {starters.map((playerId, idx) => {
            const player = players?.[playerId]
            const slotType = rosterPositions[idx]
            if (!player) {
              return (
                <div key={playerId} className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-lg text-slate-500">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-xs">?</div>
                  <span>Jogador não encontrado</span>
                </div>
              )
            }
            return (
              <PlayerRow 
                key={playerId} 
                player={player} 
                isStarter={true}
                slotType={slotType !== player.position ? slotType : undefined}
              />
            )
          })}
        </div>
      </div>

      {/* Bench */}
      {bench.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/60 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700/40 bg-slate-900/50">
            <h3 className="font-semibold text-slate-300">Bench ({bench.length})</h3>
          </div>
          <div className="p-3 space-y-2">
            {bench.map(playerId => {
              const player = players?.[playerId]
              if (!player) return null
              return <PlayerRow key={playerId} player={player} isStarter={false} />
            })}
          </div>
        </div>
      )}

      {/* Taxi Squad */}
      {taxi.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-amber-500/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-amber-500/30 bg-amber-500/10">
            <h3 className="font-semibold text-amber-400 flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Taxi Squad ({taxi.length})
            </h3>
          </div>
          <div className="p-3 space-y-2">
            {taxi.map(playerId => {
              const player = players?.[playerId]
              if (!player) return null
              return <PlayerRow key={playerId} player={player} isStarter={false} />
            })}
          </div>
        </div>
      )}

      {/* Injured Reserve */}
      {reserve.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-red-500/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-red-500/30 bg-red-500/10">
            <h3 className="font-semibold text-red-400 flex items-center gap-2">
              <ShieldPlus className="h-4 w-4" />
              Injured Reserve ({reserve.length})
            </h3>
          </div>
          <div className="p-3 space-y-2">
            {reserve.map(playerId => {
              const player = players?.[playerId]
              if (!player) return null
              return <PlayerRow key={playerId} player={player} isStarter={false} />
            })}
          </div>
        </div>
      )}
    </div>
  )
})
