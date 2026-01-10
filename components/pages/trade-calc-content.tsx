'use client'

/**
 * Trade Calculator Page Content
 * Página pública para calcular trades de dynasty
 */

import { TradeCalculator } from '@/features/trade-calc'
import { Footer } from '@/components/Footer'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { BottomNav } from '@/components/layout/BottomNav'

export function TradeCalcContent() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PublicHeader />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 pb-20 md:pb-6">
        <TradeCalculator />
      </main>

      {/* Footer - hidden on mobile due to BottomNav */}
      <div className="hidden md:block">
        <Footer />
      </div>

      <BottomNav />
    </div>
  )
}
