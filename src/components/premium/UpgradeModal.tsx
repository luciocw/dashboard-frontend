/**
 * Premium Upgrade Modal
 * Modal de conversão para plano premium
 */

import { memo } from 'react'
import { X, Crown, Check, Sparkles, TrendingUp, Shield, Bell } from 'lucide-react'
import { cn } from '@/utils/cn'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  feature?: string // Qual feature tentou acessar
}

const features = [
  { icon: TrendingUp, text: 'Ver TODOS os rosters da liga' },
  { icon: Shield, text: 'IDP Explorer com projeções' },
  { icon: Bell, text: 'Alertas de lesões em tempo real' },
  { icon: Sparkles, text: 'Trade Analyzer avançado' },
]

export const UpgradeModal = memo(function UpgradeModal({
  isOpen,
  onClose,
  feature,
}: UpgradeModalProps) {
  if (!isOpen) return null

  const handleUpgradeClick = () => {
    // TODO: Integrar com Stripe/pagamento
    window.open('https://buymeacoffee.com/luciocw', '_blank')
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md">
        {/* Gold border gradient */}
        <div className="p-[1px] rounded-3xl bg-gradient-to-b from-gold-500/50 to-gold-600/20">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-smooth touch-target"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>

            {/* Crown icon */}
            <div className="mx-auto w-16 h-16 rounded-full bg-gold-500/20 flex items-center justify-center mb-6">
              <Crown className="text-gold-500 h-8 w-8" />
            </div>

            {/* Title */}
            <h2 id="upgrade-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-2">
              Seja <span className="text-gold-400">Pro</span>
            </h2>

            {/* Subtitle */}
            <p className="text-muted-foreground text-center mb-6 text-sm sm:text-base">
              {feature
                ? `Desbloqueie "${feature}" e domine sua liga.`
                : 'Domine sua liga com ferramentas profissionais.'}
            </p>

            {/* Features list */}
            <div className="space-y-3 mb-8">
              {features.map((item, index) => {
                const Icon = item.icon
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3"
                    style={{
                      animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    <div className="bg-gold-500/20 rounded-full p-1.5 flex-shrink-0">
                      <Check size={12} className="text-gold-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-muted-foreground" />
                      <span className="text-sm font-medium">{item.text}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* CTA Button */}
            <button
              onClick={handleUpgradeClick}
              className={cn(
                "w-full py-4 rounded-2xl font-bold text-white",
                "bg-gradient-to-r from-gold-500 to-gold-600",
                "hover:from-gold-400 hover:to-gold-500",
                "shadow-lg shadow-gold-500/20",
                "transition-smooth hover:scale-[1.02] active:scale-[0.98]",
                "flex items-center justify-center gap-2"
              )}
            >
              <Sparkles size={18} />
              Apoiar o Projeto
            </button>

            {/* Fine print */}
            <p className="text-[10px] text-muted-foreground text-center mt-4 italic">
              Em breve: assinatura mensal com mais recursos.
            </p>
          </div>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
})
