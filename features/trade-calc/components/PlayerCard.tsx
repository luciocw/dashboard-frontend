/**
 * PlayerCard Component
 * Card de jogador no trade
 */

import { memo } from 'react'
import { X } from 'lucide-react'
import type { TradePlayer } from '../types'
import { POSITION_COLORS, POSITION_BG } from '../constants'

interface PlayerCardProps {
  player: TradePlayer
  onRemove?: () => void
  compact?: boolean
}

export const PlayerCard = memo(function PlayerCard({
  player,
  onRemove,
  compact = false,
}: PlayerCardProps) {
  const posColor = POSITION_COLORS[player.position] || 'text-slate-400'
  const posBg = POSITION_BG[player.position] || 'bg-slate-700/50'

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50 group">
        <span className={`text-xs font-bold ${posColor}`}>{player.position}</span>
        <span className="text-sm text-slate-200 truncate flex-1">{player.name}</span>
        <span className="text-xs text-slate-500">{player.team}</span>
        <span className="text-sm font-bold text-cyan-400">{player.value}</span>
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-0.5 text-slate-500 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition group">
      {/* Posição */}
      <div className={`px-2 py-1 rounded text-xs font-bold ${posBg} ${posColor}`}>
        {player.position}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-slate-200 truncate">{player.name}</div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{player.team || 'FA'}</span>
          {player.age && <span>• {player.age} anos</span>}
        </div>
      </div>

      {/* Valor */}
      <div className="text-right">
        <div className="text-lg font-bold text-cyan-400">{player.value}</div>
        <div className="text-[10px] text-slate-500 uppercase">valor</div>
      </div>

      {/* Remover */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition opacity-0 group-hover:opacity-100"
          title="Remover"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
})
