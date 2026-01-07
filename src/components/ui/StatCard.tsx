import { memo } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  icon?: string
  trend?: 'up' | 'down' | 'neutral'
  onClick?: () => void
  highlight?: boolean
}

const trendColors = {
  up: 'text-green-400',
  down: 'text-red-400',
  neutral: 'text-slate-400',
}

export const StatCard = memo(function StatCard({ 
  label, 
  value, 
  icon, 
  trend,
  onClick,
  highlight = false
}: StatCardProps) {
  const baseClasses = "bg-slate-900 border rounded-lg p-4"
  const highlightClasses = highlight 
    ? "border-yellow-800/50 bg-gradient-to-br from-yellow-900/20 to-amber-900/20" 
    : "border-slate-800"
  const clickableClasses = onClick 
    ? "cursor-pointer hover:bg-slate-800/70 transition group" 
    : ""

  const content = (
    <>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs uppercase tracking-wide ${highlight ? 'text-yellow-500' : 'text-slate-400'}`}>
          {label}
        </span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className={`text-2xl font-bold ${
        highlight 
          ? 'text-yellow-400 group-hover:text-yellow-300' 
          : trend 
            ? trendColors[trend] 
            : 'text-white'
      }`}>
        {value}
      </div>
    </>
  )

  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className={`${baseClasses} ${highlightClasses} ${clickableClasses} text-left w-full focus:outline-none focus:ring-2 focus:ring-yellow-500/50`}
      >
        {content}
      </button>
    )
  }

  return (
    <div className={`${baseClasses} ${highlightClasses}`}>
      {content}
    </div>
  )
})
