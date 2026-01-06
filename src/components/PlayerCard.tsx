import type { NFLPlayer } from '@/hooks/usePlayers'

interface PlayerCardProps {
  player: NFLPlayer | null
  isStarter?: boolean
}

const positionColors: Record<string, string> = {
  QB: 'text-red-400',
  RB: 'text-green-400',
  WR: 'text-blue-400',
  TE: 'text-yellow-400',
  K: 'text-purple-400',
  DEF: 'text-orange-400',
}

export function PlayerCard({ player, isStarter = false }: PlayerCardProps) {
  if (!player) {
    return (
      <div className="flex items-center justify-between py-1.5 px-2 text-slate-500 text-sm">
        <span>— Vazio —</span>
      </div>
    )
  }

  const posColor = positionColors[player.position] || 'text-slate-400'
  const name = player.full_name || `${player.first_name} ${player.last_name}`

  return (
    <div className={`flex items-center justify-between py-1.5 px-2 rounded ${isStarter ? 'bg-slate-800/50' : 'bg-slate-800/20'} hover:bg-slate-800/70 transition`}>
      <div className="flex items-center gap-3">
        <span className={`font-bold text-xs w-8 ${posColor}`}>{player.position}</span>
        <span className="text-sm text-slate-200">{name}</span>
        {player.injury_status && (
          <span className="text-xs px-1 py-0.5 bg-red-900/50 text-red-400 rounded">
            {player.injury_status}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span>{player.team || 'FA'}</span>
        {player.age && <span>{player.age}y</span>}
      </div>
    </div>
  )
}
