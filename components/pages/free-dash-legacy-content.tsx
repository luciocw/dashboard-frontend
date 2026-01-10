'use client'

/**
 * Free Dash Legacy Content
 * O dashboard original - single page HTML via iframe
 */

import { Footer } from '@/components/Footer'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { BottomNav } from '@/components/layout/BottomNav'

export function FreeDashLegacyContent() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PublicHeader />

      {/* Iframe Container - fullscreen */}
      <main className="flex-1 flex flex-col pb-16 md:pb-0">
        <iframe
          src="/legacy/index.html"
          title="Dynasty Dashboard Legacy"
          className="flex-1 w-full border-0"
          style={{
            minHeight: 'calc(100vh - 57px - 64px)',
          }}
        />
      </main>

      {/* Footer - hidden on mobile due to BottomNav */}
      <div className="hidden md:block">
        <Footer />
      </div>

      <BottomNav />
    </div>
  )
}
