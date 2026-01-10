'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Calendar } from 'lucide-react'
import { useLeagueData } from '@/hooks/useSleeperUser'
import { calculateStandings } from '@/utils/standings'
import { RosterView } from '@/components/RosterView'
import { ChampionsHistory } from '@/components/ChampionsHistory'
import { MatchupsView } from '@/components/MatchupsView'
import { TradesView } from '@/components/TradesView'
import { StandingsTable } from '@/components/StandingsTable'
import { PowerRankings } from '@/components/PowerRankings'
import { SkeletonTable } from '@/components/ui/SkeletonTable'
import { IDPExplorerView } from '@/features/idp'
import { MainLayout } from '@/components/layout'
import { useAppStore } from '@/store/use-app-store'
import { cn } from '@/lib/utils'
import type { StandingTeam } from '@/types/sleeper'

type Tab = 'roster' | 'matchups' | 'standings' | 'power' | 'trades' | 'history' | 'idp'

interface LeagueDetailsContentProps {
  leagueId: string
}

export function LeagueDetailsContent({ leagueId }: LeagueDetailsContentProps) {
  const { data, isLoading, isError, refetch } = useLeagueData(leagueId)
  const [activeTab, setActiveTab] = useState<Tab>('roster')
  const currentUser = useAppStore((state) => state.currentUser)

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [leagueId])

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-muted rounded-lg w-10 h-10 animate-pulse" />
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-muted rounded-full animate-pulse" />
              <div>
                <div className="h-6 bg-muted rounded w-48 mb-2 animate-pulse" />
                <div className="h-4 bg-muted rounded w-32 animate-pulse" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-9 w-28 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
          <SkeletonTable rows={10} />
        </div>
      </MainLayout>
    )
  }

  if (isError || !data) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md bg-card/50 backdrop-blur-sm p-8 rounded-xl border border-destructive/40">
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-destructive mb-2">Erro ao carregar</h2>
            <p className="text-muted-foreground mb-6">Não conseguimos carregar os dados da liga.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => refetch()}
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500 px-5 py-2.5 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Tentar Novamente
              </button>
              <Link
                href="/leagues"
                className="bg-muted px-5 py-2.5 rounded-lg hover:bg-muted/80 transition focus:outline-none focus:ring-2 focus:ring-muted/50"
              >
                Voltar
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  const standings: StandingTeam[] = calculateStandings(data.rosters, data.users)

  const myRoster = data.rosters.find(r => r.owner_id === currentUser?.user_id)
  const myUser = data.users.find(u => u.user_id === currentUser?.user_id)

  // Converter standings para o formato do StandingsTable
  const standingsEntries = standings.map((team, index) => ({
    rank: index + 1,
    manager: {
      name: team.name,
      avatar: team.avatar ? `https://sleepercdn.com/avatars/thumbs/${team.avatar}` : undefined,
    },
    record: {
      wins: team.wins,
      losses: team.losses,
    },
    points: team.fpts,
    isCurrentUser: team.name === myUser?.display_name || team.name === myUser?.username,
  }))

  // Converter standings para o formato do PowerRankings
  // Power Score baseado em: win% (40%) + pontos médios normalizados (60%)
  const powerRankingsEntries = standings
    .map((team, index) => {
      const totalGames = team.wins + team.losses
      const avgPoints = totalGames > 0 ? team.fpts / totalGames : 0
      const winRate = totalGames > 0 ? (team.wins / totalGames) : 0
      const powerScore = Math.round((winRate * 40) + (avgPoints / 2.5))

      return {
        originalRank: index + 1,
        manager: {
          name: team.name,
          avatar: team.avatar ? `https://sleepercdn.com/avatars/thumbs/${team.avatar}` : undefined,
        },
        record: { wins: team.wins, losses: team.losses },
        totalPoints: team.fpts,
        averagePoints: avgPoints,
        powerScore,
      }
    })
    .sort((a, b) => b.powerScore - a.powerScore)
    .map((entry, index) => {
      // Tendência: diferença entre ranking atual e power ranking
      const rankDiff = entry.originalRank - (index + 1)
      let trend: 'up' | 'down' | 'stable' = 'stable'
      if (rankDiff >= 2) trend = 'up'
      else if (rankDiff <= -2) trend = 'down'

      return {
        rank: index + 1,
        manager: entry.manager,
        record: entry.record,
        totalPoints: entry.totalPoints,
        averagePoints: entry.averagePoints,
        powerScore: entry.powerScore,
        trend,
      }
    })

  const tabs = [
    { id: 'roster' as Tab, label: 'Roster', icon: '👤' },
    { id: 'matchups' as Tab, label: 'Matchups', icon: '🏈' },
    { id: 'standings' as Tab, label: 'Classificação', icon: '📊' },
    { id: 'power' as Tab, label: 'Power', icon: '⚡' },
    { id: 'trades' as Tab, label: 'Trades', icon: '🔄' },
    { id: 'history' as Tab, label: 'Histórico', icon: '🏆' },
    { id: 'idp' as Tab, label: 'IDP', icon: '🛡️' },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* League Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/leagues"
              className="p-2.5 bg-card/50 border border-border/60 rounded-lg hover:bg-card hover:border-primary/40 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label="Voltar para lista de ligas"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Link>

            {/* League Avatar + Info */}
            <div className="flex items-center gap-3">
              {data.league.avatar ? (
                <img
                  src={`https://sleepercdn.com/avatars/thumbs/${data.league.avatar}`}
                  alt={data.league.name}
                  className="h-12 w-12 rounded-full border-2 border-primary/40 object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full border-2 border-border bg-muted flex items-center justify-center text-muted-foreground font-bold text-lg">
                  {data.league.name?.charAt(0) || '?'}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{data.league.name}</h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {data.league.total_rosters} times
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {data.league.season}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Visualização da liga">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary/50',
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary to-blue-600 text-primary-foreground shadow-lg shadow-primary/20'
                  : 'bg-card/50 border border-border/60 text-muted-foreground hover:bg-card hover:text-foreground hover:border-border'
              )}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="mt-6">
          {/* Tab: Meu Roster */}
          {activeTab === 'roster' && (
            <div className="max-w-2xl mx-auto">
              {myRoster ? (
                <RosterView roster={myRoster} league={data.league} />
              ) : (
                <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/60 p-8 text-center">
                  <div className="text-5xl mb-4">🤷</div>
                  <h3 className="text-lg font-semibold mb-2">Roster não encontrado</h3>
                  <p className="text-muted-foreground">Você não parece ter um time nesta liga.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Matchups */}
          {activeTab === 'matchups' && (
            <MatchupsView
              league={data.league}
              rosters={data.rosters}
              users={data.users}
              currentUserId={currentUser?.user_id}
            />
          )}

          {/* Tab: Standings */}
          {activeTab === 'standings' && (
            <div className="max-w-4xl mx-auto">
              <StandingsTable entries={standingsEntries} />
            </div>
          )}

          {/* Tab: Power Rankings */}
          {activeTab === 'power' && (
            <div className="max-w-3xl mx-auto">
              <PowerRankings entries={powerRankingsEntries} />
            </div>
          )}

          {/* Tab: Trades */}
          {activeTab === 'trades' && (
            <TradesView
              leagueId={data.league.league_id}
              rosters={data.rosters}
              users={data.users}
              currentUserId={currentUser?.user_id}
            />
          )}

          {/* Tab: Histórico */}
          {activeTab === 'history' && (
            <div className="max-w-2xl mx-auto">
              <ChampionsHistory leagueId={data.league.league_id} />
            </div>
          )}

          {/* Tab: IDP Explorer */}
          {activeTab === 'idp' && (
            <IDPExplorerView
              myRosterPlayerIds={myRoster?.players || []}
              scoringSettings={data.league.scoring_settings}
            />
          )}
        </div>
      </div>
    </MainLayout>
  )
}
