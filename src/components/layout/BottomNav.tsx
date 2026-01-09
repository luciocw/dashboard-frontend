/**
 * Mobile Bottom Navigation
 * Navegação fixa no rodapé para dispositivos móveis
 */

import { memo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Scale, Gem } from 'lucide-react'
import { cn } from '@/utils/cn'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  activeColor: string
}

const navItems: NavItem[] = [
  {
    to: '/',
    label: 'Free Dash',
    icon: LayoutDashboard,
    activeColor: 'text-emerald-400',
  },
  {
    to: '/trade-calc',
    label: 'Trade Calc',
    icon: Scale,
    activeColor: 'text-cyan-400',
  },
  {
    to: '/leagues',
    label: 'Ligas',
    icon: Gem,
    activeColor: 'text-purple-400',
  },
]

export const BottomNav = memo(function BottomNav() {
  const location = useLocation()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to
          const Icon = item.icon

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 touch-target transition-smooth",
                isActive ? item.activeColor : "text-muted-foreground"
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {/* Indicador ativo */}
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-current" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
})
