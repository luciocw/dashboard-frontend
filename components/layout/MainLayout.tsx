'use client'

import { useState, type ReactNode } from 'react'
import { Navigation } from './Navigation'
import { BottomNav } from './BottomNav'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'sticky top-0 h-screen bg-card/40 backdrop-blur-xl border-r border-border/50 z-50 hidden md:flex flex-col transition-all duration-300',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <Navigation isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0 overflow-x-hidden">
        <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">{children}</div>
      </main>

      {/* Mobile Navigation */}
      <BottomNav />
    </div>
  )
}
