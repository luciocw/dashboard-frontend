'use client'

/**
 * Public Header
 * Header reutilizável para páginas públicas (Free Dash, Trade Calc)
 */

import { memo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Scale, LayoutDashboard, Gem, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UpgradeModal } from '@/components/premium'

interface NavItem {
  href: string
  label: string
  icon: typeof Scale
  activeClass: string
  hoverClass: string
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Free Dash',
    icon: LayoutDashboard,
    activeClass: 'bg-emerald-600/20 text-emerald-400',
    hoverClass: 'hover:text-emerald-400 hover:bg-emerald-600/10',
  },
  {
    href: '/trade-calc',
    label: 'Trade Calc',
    icon: Scale,
    activeClass: 'bg-cyan-600/20 text-cyan-400',
    hoverClass: 'hover:text-cyan-400 hover:bg-cyan-600/10',
  },
]

export const PublicHeader = memo(function PublicHeader() {
  const pathname = usePathname()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-card/80 backdrop-blur-xl safe-area-top">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo + Nav */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent">
                  Fantasy Intel
                </span>
              </h1>
            </Link>

            {/* Navigation - Desktop */}
            <nav className="hidden sm:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-smooth",
                      isActive ? item.activeClass : `text-muted-foreground ${item.hoverClass}`
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right side - Pro + Ligas */}
          <div className="flex items-center gap-2">
            {/* Botão Pro */}
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-smooth bg-gold/10 text-gold hover:bg-gold/20 border border-gold/30"
            >
              <Crown className="w-4 h-4" />
              <span className="hidden sm:inline">Pro</span>
            </button>

            {/* Ligas */}
            <Link
              href="/leagues"
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-smooth",
                pathname === '/leagues'
                  ? 'bg-purple-600/20 text-purple-400'
                  : 'text-muted-foreground hover:text-purple-400 hover:bg-purple-600/10'
              )}
            >
              <Gem className="w-4 h-4" />
              <span className="hidden sm:inline">Ligas</span>
              <span className="sm:hidden">💎</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </header>
  )
})
