'use client'

import { ArrowUpRight, ArrowDownRight, Minus, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlayerCardPremiumProps {
  name: string
  team: string
  position: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF'
  projected: number
  status: 'active' | 'questionable' | 'out' | 'injured'
  trend: 'up' | 'down' | 'neutral'
}

const statusColors = {
  active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  questionable: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  out: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  injured: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
}

const positionColors = {
  QB: 'bg-red-500/10 text-red-500 border-red-500/20',
  RB: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  WR: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  TE: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  K: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  DEF: 'bg-green-500/10 text-green-500 border-green-500/20',
}

export function PlayerCardPremium({ name, team, position, projected, status, trend }: PlayerCardPremiumProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="relative z-10 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg leading-tight mb-1">{name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">{team}</span>
              <span
                className={cn(
                  'text-[9px] font-black uppercase px-2 py-0.5 rounded-md border',
                  positionColors[position]
                )}
              >
                {position}
              </span>
            </div>
          </div>
          <div
            className={cn(
              'text-xs font-semibold px-2 py-1 rounded-lg border flex items-center gap-1',
              statusColors[status]
            )}
          >
            {status === 'questionable' && <AlertCircle size={12} />}
            {status === 'active' ? 'Active' : status === 'questionable' ? 'Q' : 'Out'}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">Projected</div>
            <div className="text-2xl font-bold">{projected.toFixed(1)}</div>
          </div>
          <div className="flex items-center gap-1.5">
            {trend === 'up' && (
              <div className="flex items-center gap-1 text-emerald-500">
                <ArrowUpRight size={16} />
                <span className="text-xs font-semibold">Trending</span>
              </div>
            )}
            {trend === 'down' && (
              <div className="flex items-center gap-1 text-rose-500">
                <ArrowDownRight size={16} />
                <span className="text-xs font-semibold">Trending</span>
              </div>
            )}
            {trend === 'neutral' && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Minus size={16} />
                <span className="text-xs font-semibold">Steady</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
