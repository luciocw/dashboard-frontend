'use client'

/**
 * Landing Page Content
 * Página inicial do Fantasy Intel com trending players e features
 */

import Link from 'next/link'
import { TrendingUp, TrendingDown, Calculator, Shield, Trophy, Zap, ChevronRight, Crown } from 'lucide-react'
import { Footer } from '@/components/Footer'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { BottomNav } from '@/components/layout/BottomNav'
import { useTrendingPlayersWithInfo } from '@/hooks/useTrendingPlayers'
import { cn } from '@/lib/utils'

const positionColors: Record<string, string> = {
  QB: 'text-red-400 bg-red-500/10',
  RB: 'text-cyan-400 bg-cyan-500/10',
  WR: 'text-blue-400 bg-blue-500/10',
  TE: 'text-yellow-400 bg-yellow-500/10',
  K: 'text-purple-400 bg-purple-500/10',
  DEF: 'text-green-400 bg-green-500/10',
}

const features = [
  {
    icon: Calculator,
    title: 'Trade Calculator',
    description: 'Analise trades com valores KTC atualizados',
    href: '/trade-calc',
    color: 'from-cyan-500/20 to-blue-500/10',
    iconColor: 'text-cyan-400',
  },
  {
    icon: Shield,
    title: 'IDP Explorer',
    description: 'Descubra os melhores jogadores defensivos',
    href: '/leagues',
    color: 'from-orange-500/20 to-red-500/10',
    iconColor: 'text-orange-400',
  },
  {
    icon: Trophy,
    title: 'Power Rankings',
    description: 'Veja quem domina sua liga com analytics',
    href: '/leagues',
    color: 'from-gold/20 to-yellow-500/10',
    iconColor: 'text-gold',
  },
  {
    icon: Zap,
    title: 'Matchups Live',
    description: 'Acompanhe seus matchups em tempo real',
    href: '/leagues',
    color: 'from-emerald-500/20 to-green-500/10',
    iconColor: 'text-emerald-400',
  },
]

function TrendingPlayerCard({
  player,
  type,
}: {
  player: { player_id: string; count: number; info?: { full_name: string; position: string; team: string | null } }
  type: 'add' | 'drop'
}) {
  const posColor = player.info?.position ? positionColors[player.info.position] || 'text-muted-foreground bg-muted' : 'text-muted-foreground bg-muted'

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card/40 border border-border/50 hover:border-border transition-colors">
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold', posColor)}>
        {player.info?.position || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{player.info?.full_name || `Player ${player.player_id}`}</div>
        <div className="text-xs text-muted-foreground">{player.info?.team || 'FA'}</div>
      </div>
      <div className={cn('flex items-center gap-1 text-sm font-semibold', type === 'add' ? 'text-emerald-400' : 'text-rose-400')}>
        {type === 'add' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span>{player.count.toLocaleString()}</span>
      </div>
    </div>
  )
}

function TrendingSection() {
  const { adds, drops, isLoading } = useTrendingPlayersWithInfo(5)

  if (isLoading) {
    return (
      <section className="grid md:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            {[1, 2, 3, 4, 5].map((j) => (
              <div key={j} className="h-16 bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ))}
      </section>
    )
  }

  return (
    <section className="grid md:grid-cols-2 gap-6">
      {/* Trending Adds */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-emerald-400" size={20} />
          <h3 className="font-bold text-lg">Trending Adds</h3>
          <span className="text-xs text-muted-foreground">(24h)</span>
        </div>
        <div className="space-y-2">
          {adds.map((player) => (
            <TrendingPlayerCard key={player.player_id} player={player} type="add" />
          ))}
        </div>
      </div>

      {/* Trending Drops */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingDown className="text-rose-400" size={20} />
          <h3 className="font-bold text-lg">Trending Drops</h3>
          <span className="text-xs text-muted-foreground">(24h)</span>
        </div>
        <div className="space-y-2">
          {drops.map((player) => (
            <TrendingPlayerCard key={player.player_id} player={player} type="drop" />
          ))}
        </div>
      </div>
    </section>
  )
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-card/50 to-accent/10 border border-border/50 p-8 md:p-12">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-semibold mb-4">
          <Crown size={12} />
          <span>Dynasty Fantasy Football</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
          Domine sua{' '}
          <span className="bg-gradient-to-r from-primary via-blue-500 to-accent bg-clip-text text-transparent">
            Dynasty League
          </span>
        </h1>

        <p className="text-lg text-muted-foreground mb-8 max-w-xl">
          Análises avançadas, trade calculator, power rankings e muito mais.
          Conecte sua conta Sleeper e leve seu time ao próximo nível.
        </p>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/leagues"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all shadow-lg shadow-primary/20"
          >
            Entrar com Sleeper
            <ChevronRight size={18} />
          </Link>
          <Link
            href="/trade-calc"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card/50 hover:bg-card border border-border/60 hover:border-border font-semibold transition-all"
          >
            <Calculator size={18} />
            Trade Calculator
          </Link>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Ferramentas Pro</h2>
        <p className="text-muted-foreground">Tudo que você precisa para dominar seu dynasty</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Link
              key={feature.title}
              href={feature.href}
              className={cn(
                'group relative overflow-hidden rounded-2xl border border-border/50 p-5 transition-all hover:border-border hover:shadow-lg',
                `bg-gradient-to-br ${feature.color}`
              )}
            >
              <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center mb-3', feature.iconColor, 'bg-background/50')}>
                <Icon size={20} />
              </div>
              <h3 className="font-bold mb-1 group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
              <ChevronRight
                size={16}
                className="absolute top-5 right-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export function LandingContent() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PublicHeader />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 pb-24 md:pb-8 space-y-10">
        <HeroSection />
        <TrendingSection />
        <FeaturesSection />
      </main>

      {/* Footer - hidden on mobile due to BottomNav */}
      <div className="hidden md:block">
        <Footer />
      </div>

      <BottomNav />
    </div>
  )
}
