'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, TrendingUp, Users, Calculator, Settings, Crown, ChevronLeft, ChevronRight, Trophy, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavigationProps {
  isCollapsed: boolean
  onToggle: () => void
}

const navItems = [
  { href: '/', label: 'Início', icon: Home },
  { href: '/free-dash', label: 'Free Dash', icon: LayoutDashboard },
  { href: '/leagues', label: 'Minhas Ligas', icon: Trophy },
  { href: '/trade-calc', label: 'Trade Calc', icon: Calculator },
  { href: '/rankings', label: 'Rankings', icon: TrendingUp },
  { href: '/players', label: 'Players', icon: Users, premium: true },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Navigation({ isCollapsed, onToggle }: NavigationProps) {
  const pathname = usePathname()
  const isPremium = false // TODO: Hook into auth context

  return (
    <div className="flex flex-col h-full p-4">
      {/* Logo */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3 px-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <svg className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          {!isCollapsed && <span className="font-bold text-xl">Fantasy Intel</span>}
        </div>
        <button
          onClick={onToggle}
          className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
          aria-label={isCollapsed ? 'Expandir menu' : 'Colapsar menu'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              <Icon size={20} />
              {!isCollapsed && <span className="text-sm font-medium flex-1">{item.label}</span>}
              {!isCollapsed && item.premium && !isPremium && <Crown size={14} className="text-gold" />}
            </Link>
          )
        })}
      </nav>

      {/* Premium Upgrade Card */}
      {!isPremium && !isCollapsed && (
        <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-gold/10 to-accent/5 border border-gold/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-gold mb-2">
            <Crown size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">Upgrade</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Desbloqueie análises avançadas e insights premium</p>
          <button className="w-full bg-gold hover:bg-gold/90 text-gold-foreground py-2 rounded-lg text-xs font-semibold transition-colors shadow-lg shadow-gold/20">
            Seja Pro
          </button>
        </div>
      )}

      {/* Collapsed Upgrade Icon */}
      {!isPremium && isCollapsed && (
        <div className="mt-auto flex justify-center">
          <button className="p-2 rounded-xl bg-gold/10 text-gold hover:bg-gold/20 transition-colors">
            <Crown size={20} />
          </button>
        </div>
      )}
    </div>
  )
}
