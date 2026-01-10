'use client'

/**
 * Premium Gate
 * Wrapper que protege conteúdo premium e mostra modal de upgrade
 */

import { memo, useState, ReactNode } from 'react'
import { Lock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { UpgradeModal } from './UpgradeModal'
import { cn } from '@/lib/utils'

interface PremiumGateProps {
  children: ReactNode
  feature: string
  /** Se true, mostra blur + overlay ao invés de esconder completamente */
  showPreview?: boolean
  className?: string
}

export const PremiumGate = memo(function PremiumGate({
  children,
  feature,
  showPreview = true,
  className,
}: PremiumGateProps) {
  const { isPremium } = useAuth()
  const [showModal, setShowModal] = useState(false)

  // Se é premium, mostra o conteúdo normalmente
  if (isPremium) {
    return <>{children}</>
  }

  // Se não é premium
  if (showPreview) {
    return (
      <>
        <div className={cn("relative", className)}>
          {/* Conteúdo com blur */}
          <div className="blur-sm pointer-events-none select-none">
            {children}
          </div>

          {/* Overlay com CTA */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm rounded-xl cursor-pointer transition-smooth hover:bg-card/70"
            onClick={() => setShowModal(true)}
          >
            <div className="p-3 rounded-full bg-gold/20 mb-3">
              <Lock className="w-6 h-6 text-gold" />
            </div>
            <p className="text-sm font-medium mb-1">Recurso Premium</p>
            <p className="text-xs text-muted-foreground">{feature}</p>
            <button className="mt-3 px-4 py-2 bg-gold text-gold-foreground text-sm font-bold rounded-lg hover:bg-gold/90 transition-smooth">
              Desbloquear
            </button>
          </div>
        </div>

        <UpgradeModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          feature={feature}
        />
      </>
    )
  }

  // Sem preview - só mostra botão de upgrade
  return (
    <>
      <div
        className={cn(
          "flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-gold/30 bg-gold/5 cursor-pointer transition-smooth hover:border-gold/50 hover:bg-gold/10",
          className
        )}
        onClick={() => setShowModal(true)}
      >
        <div className="p-3 rounded-full bg-gold/20 mb-3">
          <Lock className="w-6 h-6 text-gold" />
        </div>
        <p className="text-sm font-medium text-gold mb-1">{feature}</p>
        <p className="text-xs text-muted-foreground">Clique para desbloquear</p>
      </div>

      <UpgradeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        feature={feature}
      />
    </>
  )
})
