/**
 * PickCard Component
 * Card de draft pick no trade
 */

import { memo } from 'react'
import { X } from 'lucide-react'
import type { TradePick } from '../types'

interface PickCardProps {
  pick: TradePick
  onRemove?: () => void
  compact?: boolean
}

// Cores por round
const ROUND_COLORS: Record<number, string> = {
  1: 'text-yellow-400 bg-yellow-500/20',
  2: 'text-slate-300 bg-slate-500/20',
  3: 'text-orange-400 bg-orange-500/20',
  4: 'text-slate-500 bg-slate-600/20',
}

// Cores por range
const RANGE_COLORS: Record<string, string> = {
  early: 'text-green-400',
  mid: 'text-yellow-400',
  late: 'text-red-400',
}

export const PickCard = memo(function PickCard({
  pick,
  onRemove,
  compact = false,
}: PickCardProps) {
  const roundColor = ROUND_COLORS[pick.round] || ROUND_COLORS[4]

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50 group">
        <span className="text-xs">📋</span>
        <span className="text-sm text-slate-200 truncate flex-1">{pick.label}</span>
        <span className="text-sm font-bold text-cyan-400">{pick.value}</span>
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
      {/* Ícone */}
      <div className={`px-2 py-1 rounded text-xs font-bold ${roundColor}`}>
        R{pick.round}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-slate-200">{pick.year} Pick</div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Round {pick.round}</span>
          {pick.range && (
            <span className={RANGE_COLORS[pick.range]}>
              • {pick.range.charAt(0).toUpperCase() + pick.range.slice(1)}
            </span>
          )}
        </div>
      </div>

      {/* Valor */}
      <div className="text-right">
        <div className="text-lg font-bold text-cyan-400">{pick.value}</div>
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
