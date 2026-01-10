'use client'

/**
 * Premium Badge
 * Badge indicando feature premium com efeito shimmer
 */

import { memo } from 'react'
import { Crown, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PremiumBadgeProps {
  variant?: 'default' | 'small' | 'inline'
  showLock?: boolean
  className?: string
}

export const PremiumBadge = memo(function PremiumBadge({
  variant = 'default',
  showLock = false,
  className,
}: PremiumBadgeProps) {
  const Icon = showLock ? Lock : Crown

  if (variant === 'inline') {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 text-gold",
        className
      )}>
        <Icon size={12} />
        <span className="text-[10px] font-bold uppercase">Pro</span>
      </span>
    )
  }

  if (variant === 'small') {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider",
        "bg-gold/10 text-gold border border-gold/20",
        className
      )}>
        <Icon size={10} />
        Pro
      </span>
    )
  }

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider",
      "bg-gradient-to-r from-gold/20 to-amber-500/20 text-gold",
      "border border-gold/30 shimmer",
      className
    )}>
      <Icon size={14} />
      Premium
    </span>
  )
})
