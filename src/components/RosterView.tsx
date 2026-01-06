import { usePlayers, getPlayerInfo, sortPlayersByPosition } from '@/hooks/usePlayers'
import { PlayerCard } from './PlayerCard'
import type { SleeperRoster, SleeperUser } from '@/types/sleeper'

interface RosterViewProps {
  roster: SleeperRoster
  owner: SleeperUser | undefined
}

export function RosterView({ roster, owner }: RosterViewProps) {
  const { data: players, isLoading } = usePlayers()

  const ownerName = owner?.display_name || owner?.username || 'Meu Time'

  // Separar starters e bench
  const starters = roster.starters || []
  const allPlayers = roster.players || []
  const bench = allPlayers.filter(p => !starters.includes(p))
  const taxi = roster.taxi || []
  const ir = roster.reserve || []

  // Ordenar por posição
  const sortedStarters = players ? sortPlayersByPosition(starters, players) : starters
  const sortedBench = players ? sortPlayersByPosition(bench, players) : bench

  if (isLoading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-48 mb-4"></div>
          <div className="space-y-2">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="h-8 bg-slate-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">{ownerName}</h3>
          <span className="text-sm text-slate-400">
            {roster.settings.wins}-{roster.settings.losses} • {roster.settings.fpts.toFixed(1)} pts
          </span>
        </div>
      </div>

      {/* Starters */}
      <div className="p-4">
        <h4 className="text-xs uppercase tracking-wider text-green-500 mb-2 font-semibold">
          Titulares ({starters.length})
        </h4>
        <div className="space-y-1">
          {sortedStarters.map((playerId: string) => (
            <PlayerCard 
              key={playerId} 
              player={getPlayerInfo(players, playerId)} 
              isStarter={true}
            />
          ))}
        </div>
      </div>

      {/* Bench */}
      {bench.length > 0 && (
        <div className="p-4 border-t border-slate-800">
          <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-semibold">
            Banco ({bench.length})
          </h4>
          <div className="space-y-1">
            {sortedBench.map((playerId: string) => (
              <PlayerCard 
                key={playerId} 
                player={getPlayerInfo(players, playerId)} 
                isStarter={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Taxi */}
      {taxi.length > 0 && (
        <div className="p-4 border-t border-slate-800">
          <h4 className="text-xs uppercase tracking-wider text-yellow-500 mb-2 font-semibold">
            Taxi Squad ({taxi.length})
          </h4>
          <div className="space-y-1">
            {taxi.map((playerId: string) => (
              <PlayerCard key={playerId} player={getPlayerInfo(players, playerId)} />
            ))}
          </div>
        </div>
      )}

      {/* IR */}
      {ir.length > 0 && (
        <div className="p-4 border-t border-slate-800">
          <h4 className="text-xs uppercase tracking-wider text-red-500 mb-2 font-semibold">
            IR ({ir.length})
          </h4>
          <div className="space-y-1">
            {ir.map((playerId: string) => (
              <PlayerCard key={playerId} player={getPlayerInfo(players, playerId)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
