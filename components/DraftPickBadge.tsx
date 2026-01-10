import { memo } from 'react'

interface DraftPickBadgeProps {
  season: string
  round: number
  isOwn?: boolean  // true = pick própria, false = pick adquirida
}

const roundColors: Record<number, string> = {
  1: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
  2: 'bg-slate-700 text-slate-200 border-slate-600',
  3: 'bg-slate-800 text-slate-300 border-slate-700',
  4: 'bg-slate-800 text-slate-400 border-slate-700',
  5: 'bg-slate-900 text-slate-500 border-slate-800',
}

export const DraftPickBadge = memo(function DraftPickBadge({ 
  season, 
  round,
  isOwn = true 
}: DraftPickBadgeProps) {
  const colorClass = roundColors[round] || roundColors[5]
  const year = season.slice(-2) // "2025" -> "25"
  
  return (
    <span 
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border ${colorClass} ${!isOwn ? 'ring-1 ring-blue-500' : ''}`}
      title={isOwn ? `Pick própria: ${season} Round ${round}` : `Pick adquirida: ${season} Round ${round}`}
    >
      '{year} R{round}
    </span>
  )
})
