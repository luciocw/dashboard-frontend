'use client'

import { Trophy, TrendingUp } from 'lucide-react'

interface MatchupCardPremiumProps {
  week?: number
  myTeam: {
    name: string
    initials: string
    record: string
    projected: number
  }
  opponent: {
    name: string
    initials: string
    record: string
    projected: number
  }
  winProbability: number
}

export function MatchupCardPremium({
  week = 12,
  myTeam,
  opponent,
  winProbability,
}: MatchupCardPremiumProps) {
  const pointDiff = (myTeam.projected - opponent.projected).toFixed(1)

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card/40 backdrop-blur-xl p-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 h-64 w-64 bg-primary blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 bg-accent blur-3xl rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Week Indicator */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <Trophy size={16} className="text-primary" />
            <span className="text-sm font-bold text-primary">Week {week}</span>
          </div>
        </div>

        {/* Teams */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 mb-6">
          {/* Your Team */}
          <div className="text-center space-y-2">
            <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-2 border-2 border-primary">
              <span className="text-2xl font-black text-primary">{myTeam.initials}</span>
            </div>
            <h3 className="font-bold">{myTeam.name}</h3>
            <div className="text-sm text-muted-foreground">{myTeam.record}</div>
            <div className="space-y-1">
              <div className="text-3xl font-black">{myTeam.projected.toFixed(1)}</div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Projected</div>
            </div>
          </div>

          {/* VS */}
          <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center border border-border">
            <span className="text-sm font-black text-muted-foreground">VS</span>
          </div>

          {/* Opponent */}
          <div className="text-center space-y-2">
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-2 border border-border">
              <span className="text-2xl font-black text-muted-foreground">{opponent.initials}</span>
            </div>
            <h3 className="font-bold">{opponent.name}</h3>
            <div className="text-sm text-muted-foreground">{opponent.record}</div>
            <div className="space-y-1">
              <div className="text-3xl font-black">{opponent.projected.toFixed(1)}</div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Projected</div>
            </div>
          </div>
        </div>

        {/* Win Probability */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Win Probability</span>
            <div className="flex items-center gap-1 text-primary">
              <TrendingUp size={14} />
              <span className="font-bold">{winProbability}%</span>
            </div>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
              style={{ width: `${winProbability}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            You're {Number(pointDiff) > 0 ? 'favored' : 'trailing'} by {Math.abs(Number(pointDiff))} points based on current projections
          </p>
        </div>
      </div>
    </div>
  )
}
