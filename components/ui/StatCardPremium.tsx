'use client'

import { type LucideIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardPremiumProps {
  label: string
  value: string | number
  trend?: number
  icon: LucideIcon
  premium?: boolean
}

export function StatCardPremium({ label, value, trend, icon: Icon, premium }: StatCardPremiumProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Icon size={20} />
          </div>
          {premium && (
            <span className="text-[9px] font-black uppercase tracking-widest text-gold bg-gold/10 px-2 py-1 rounded-md">
              Pro
            </span>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
            {trend !== undefined && (
              <div
                className={cn(
                  'flex items-center gap-1 text-sm font-semibold',
                  trend > 0 ? 'text-emerald-500' : trend < 0 ? 'text-rose-500' : 'text-muted-foreground'
                )}
              >
                {trend > 0 ? <TrendingUpIcon size={14} /> : trend < 0 ? <TrendingDownIcon size={14} /> : null}
                <span>
                  {trend > 0 ? '+' : ''}
                  {trend}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
