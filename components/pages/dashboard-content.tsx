'use client'

import { Trophy, TrendingUp, Users, Calendar, Crown, ArrowUpRight, ChevronRight } from 'lucide-react'
import { MainLayout } from '@/components/layout'
import { StatCardPremium } from '@/components/ui/StatCardPremium'
import { PlayerCardPremium } from '@/components/ui/PlayerCardPremium'
import { MatchupCardPremium } from '@/components/ui/MatchupCardPremium'

export function DashboardContent() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
              Welcome back, <span className="text-primary">Champion</span>
            </h1>
            <p className="text-muted-foreground mt-1">Here's your team overview for Week 12</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Record</div>
              <div className="text-2xl font-bold">8-3-0</div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Trophy className="text-primary" size={24} />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCardPremium label="Projected Points" value="124.8" trend={8.5} icon={TrendingUp} />
          <StatCardPremium label="Team Value" value="$2,450" trend={12.3} icon={Trophy} />
          <StatCardPremium label="Active Players" value="9/9" icon={Users} />
          <StatCardPremium label="Next Game" value="2h 45m" icon={Calendar} premium />
        </div>

        {/* This Week's Matchup */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">This Week's Matchup</h2>
            <button className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
              View Details
              <ChevronRight size={16} />
            </button>
          </div>
          <MatchupCardPremium
            week={12}
            myTeam={{
              name: 'The Champions',
              initials: 'TC',
              record: '8-3-0',
              projected: 124.8,
            }}
            opponent={{
              name: 'Rival Runners',
              initials: 'RR',
              record: '7-4-0',
              projected: 118.3,
            }}
            winProbability={64}
          />
        </section>

        {/* Starting Lineup */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Starting Lineup</h2>
            <button className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
              Optimize
              <Crown size={16} className="text-gold" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PlayerCardPremium name="Josh Allen" team="BUF" position="QB" projected={24.5} status="active" trend="up" />
            <PlayerCardPremium name="Christian McCaffrey" team="SF" position="RB" projected={22.8} status="active" trend="up" />
            <PlayerCardPremium name="Tyreek Hill" team="MIA" position="WR" projected={18.2} status="questionable" trend="down" />
            <PlayerCardPremium name="Travis Kelce" team="KC" position="TE" projected={15.4} status="active" trend="neutral" />
            <PlayerCardPremium name="Breece Hall" team="NYJ" position="RB" projected={16.7} status="active" trend="up" />
            <PlayerCardPremium name="CeeDee Lamb" team="DAL" position="WR" projected={19.3} status="active" trend="up" />
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 to-accent/5 p-6 backdrop-blur-xl">
            <div className="absolute top-0 right-0 h-32 w-32 bg-primary/20 blur-3xl rounded-full translate-x-16 -translate-y-8" />
            <div className="relative z-10">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <TrendingUp className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Trade Analyzer</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get instant insights on potential trades with AI-powered analysis
              </p>
              <button className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80">
                Analyze Trade
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-gold/10 to-accent/5 p-6 backdrop-blur-xl">
            <div className="absolute top-0 right-0 h-32 w-32 bg-gold/20 blur-3xl rounded-full translate-x-16 -translate-y-8" />
            <div className="relative z-10">
              <div className="h-12 w-12 rounded-xl bg-gold/20 flex items-center justify-center mb-4">
                <Crown className="text-gold" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Weekly Insights Report</h3>
              <p className="text-sm text-muted-foreground mb-4">Premium analytics and recommendations for your roster</p>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-gold/10 text-gold px-2 py-1 rounded-full font-black uppercase tracking-wider">
                  Pro
                </span>
                <button className="flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold/80">
                  Unlock Now
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
