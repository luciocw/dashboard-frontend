import { memo } from 'react'
import { Trophy, Users, Crown, Target } from 'lucide-react'
import { cn } from '@/utils/cn'

interface HeroSectionProps {
  username: string
  leagues: number
  dynasty: number
  wins: number
  losses: number
  titles: number
  onTitlesClick?: () => void
}

export const HeroSection = memo(function HeroSection({
  username,
  leagues,
  dynasty,
  wins,
  losses,
  titles,
  onTitlesClick,
}: HeroSectionProps) {
  const totalGames = wins + losses
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0

  const getWinRateColor = () => {
    if (winRate >= 60) return 'bg-green-500/20 text-green-400 border-green-500/40'
    if (winRate >= 50) return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
    return 'bg-red-500/20 text-red-400 border-red-500/40'
  }

  const stats = [
    {
      id: 'leagues',
      label: 'Ligas',
      value: leagues,
      icon: Users,
      color: 'text-cyan-400',
    },
    {
      id: 'dynasty',
      label: 'Dynasty',
      value: dynasty,
      icon: Crown,
      color: 'text-purple-400',
    },
    {
      id: 'record',
      label: 'Record',
      value: `${wins}-${losses}`,
      icon: Target,
      color: 'text-blue-400',
    },
    {
      id: 'titles',
      label: 'Títulos',
      value: titles,
      icon: Trophy,
      color: 'text-yellow-400',
      isGolden: titles > 0,
      onClick: onTitlesClick,
    },
  ]

  return (
    <section className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute left-0 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-0 top-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8 lg:py-12">
        {/* Greeting */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Olá, <span className="text-cyan-400">{username}</span>
          </h2>
          <p className="mt-2 text-slate-400 md:text-lg">
            Bem-vindo ao seu centro de comando do fantasy football
          </p>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.id}
                onClick={stat.onClick}
                className={cn(
                  'group relative overflow-hidden rounded-xl border border-slate-700/60 bg-slate-800/50 backdrop-blur-sm p-5 transition-all duration-300 hover:scale-[1.02] hover:border-slate-600',
                  stat.isGolden && 'border-yellow-500/40 shadow-lg shadow-yellow-500/10',
                  stat.onClick && 'cursor-pointer'
                )}
              >
                {/* Golden glow effect */}
                {stat.isGolden && (
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-50" />
                )}

                <div className="relative">
                  {/* Icon */}
                  <div className="mb-3 flex items-center justify-between">
                    <Icon className={cn('h-7 w-7', stat.color)} strokeWidth={1.5} />
                    {stat.isGolden && (
                      <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50" />
                    )}
                  </div>

                  {/* Value */}
                  <div className="text-3xl font-bold tracking-tight text-white mb-1">
                    {stat.value}
                  </div>

                  {/* Label */}
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {stat.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Win Rate Badge */}
        {totalGames > 0 && (
          <div className="mt-6 flex justify-center">
            <div
              className={cn(
                'inline-flex items-center gap-3 rounded-full border px-5 py-2.5 backdrop-blur-sm',
                getWinRateColor()
              )}
            >
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" strokeWidth={2} />
                <span className="text-xs font-semibold uppercase tracking-wide">Win Rate</span>
              </div>
              <div className="h-4 w-px bg-current opacity-30" />
              <span className="text-xl font-bold">{winRate}%</span>
              <span className="text-xs opacity-70">({wins}W - {losses}L)</span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
})
