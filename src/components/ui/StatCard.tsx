import { memo } from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

interface StatCardProps {
  label: string
  value: string | number
  icon?: string | LucideIcon
  trend?: number | 'up' | 'down' | 'neutral'
  onClick?: () => void
  highlight?: boolean
  premium?: boolean
}

export const StatCard = memo(function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  onClick,
  highlight = false,
  premium = false,
}: StatCardProps) {
  // Determinar cor do trend
  const getTrendColor = () => {
    if (typeof trend === 'number') {
      if (trend > 0) return 'text-emerald-400'
      if (trend < 0) return 'text-rose-400'
      return 'text-slate-400'
    }
    if (trend === 'up') return 'text-emerald-400'
    if (trend === 'down') return 'text-rose-400'
    return 'text-slate-400'
  }

  // Formatar trend numérico
  const formatTrend = () => {
    if (typeof trend === 'number') {
      return `${trend > 0 ? '+' : ''}${trend}%`
    }
    return null
  }

  const content = (
    <>
      {/* Header com ícone e badge premium */}
      <div className="flex items-center justify-between mb-3">
        <div className={cn(
          "p-2 rounded-xl",
          highlight ? "bg-gold-500/20" : "bg-primary/10"
        )}>
          {typeof Icon === 'string' ? (
            <span className="text-lg">{Icon}</span>
          ) : Icon ? (
            <Icon size={18} className={highlight ? "text-gold-500" : "text-primary"} />
          ) : null}
        </div>
        {premium && (
          <span className="text-[10px] font-black uppercase tracking-widest text-gold-500 bg-gold-500/10 px-2 py-1 rounded-md">
            Pro
          </span>
        )}
      </div>

      {/* Label */}
      <p className={cn(
        "text-xs font-medium uppercase tracking-wider mb-1",
        highlight ? "text-gold-400" : "text-muted-foreground"
      )}>
        {label}
      </p>

      {/* Value com trend */}
      <div className="flex items-baseline gap-2">
        <h3 className={cn(
          "text-2xl font-bold tracking-tight",
          highlight ? "text-gold-400 group-hover:text-gold-300" : "text-foreground"
        )}>
          {value}
        </h3>
        {trend !== undefined && (
          <span className={cn("text-xs font-medium", getTrendColor())}>
            {formatTrend() || (trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→')}
          </span>
        )}
      </div>

      {/* Glossy overlay sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-2xl" />
    </>
  )

  const baseClasses = cn(
    "relative overflow-hidden rounded-2xl border p-4 transition-smooth",
    highlight
      ? "border-gold-500/30 bg-gradient-to-br from-gold-900/20 to-amber-900/10"
      : "border-white/5 bg-slate-900/60",
    onClick && "cursor-pointer hover:border-primary/50 hover:shadow-premium group"
  )

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn(baseClasses, "text-left w-full focus:outline-none focus:ring-2 focus:ring-primary/50")}
      >
        {content}
      </button>
    )
  }

  return (
    <div className={baseClasses}>
      {content}
    </div>
  )
})
