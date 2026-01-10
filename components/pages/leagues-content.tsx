'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSleeperUser, useSleeperLeagues } from '@/hooks/useSleeperUser'
import { useAppStore } from '@/store/use-app-store'
import { usePlayers } from '@/hooks/usePlayers'
import { useAllMyRosters } from '@/hooks/useAllMyRosters'
import { useAllDraftPicks } from '@/hooks/useAllDraftPicks'
import { useAllUserLeagues } from '@/hooks/useAllUserLeagues'
import { useUserTitles } from '@/hooks/useUserTitles'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { DashboardHeader } from '@/components/DashboardHeader'
import { HeroSection } from '@/components/HeroSection'
import { LeagueCard } from '@/components/LeagueCard'
import { ErrorCard } from '@/components/ui/ErrorCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { TitlesModal } from '@/components/TitlesModal'
import { Footer } from '@/components/Footer'
import { MainLayout } from '@/components/layout'
import { getAvailableSeasons } from '@/utils/nfl'
import { validateUsername, sanitizeInput } from '@/utils/validation'
import { isApiError } from '@/utils/errors'
import type { SleeperLeague, SleeperRoster } from '@/types/sleeper'

function calculateStats(leagues: SleeperLeague[]) {
  const total = leagues.length
  const dynasty = leagues.filter(l => l.settings?.type === 2).length
  return { total, dynasty }
}

function calculateRecord(rosters: Record<string, SleeperRoster | null> | undefined) {
  if (!rosters) return { wins: 0, losses: 0 }

  let totalWins = 0
  let totalLosses = 0

  Object.values(rosters).forEach(roster => {
    if (roster) {
      totalWins += roster.settings.wins || 0
      totalLosses += roster.settings.losses || 0
    }
  })

  return { wins: totalWins, losses: totalLosses }
}

export function LeaguesContent() {
  const router = useRouter()
  const isOnline = useOnlineStatus()

  const currentUser = useAppStore((state) => state.currentUser)
  const setCurrentUser = useAppStore((state) => state.setCurrentUser)
  const selectedSeason = useAppStore((state) => state.selectedSeason)
  const setSelectedSeason = useAppStore((state) => state.setSelectedSeason)
  const logout = useAppStore((state) => state.logout)

  const [inputValue, setInputValue] = useState('')
  const [searchUsername, setSearchUsername] = useState(currentUser?.username || '')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [showTitlesModal, setShowTitlesModal] = useState(false)

  const {
    data: user,
    isLoading: loadingUser,
    error: userError,
  } = useSleeperUser(searchUsername)

  const {
    data: leagues,
    isLoading: loadingLeagues,
    error: leaguesError,
    refetch: refetchLeagues
  } = useSleeperLeagues(user?.user_id, selectedSeason)

  const { data: allLeagues } = useAllUserLeagues(currentUser?.user_id)

  const { error: playersError } = usePlayers()

  const leagueIds = leagues?.map(l => l.league_id) || []
  const { data: rostersByLeague } = useAllMyRosters(leagueIds, currentUser?.user_id)
  const { data: picksByLeague } = useAllDraftPicks(leagueIds)

  const { data: userTitles, isLoading: loadingTitles } = useUserTitles(allLeagues, currentUser?.user_id)

  useEffect(() => {
    if (user && user.user_id !== currentUser?.user_id) {
      setCurrentUser(user)
    }
  }, [user, currentUser, setCurrentUser])

  useEffect(() => {
    if (currentUser?.username && !searchUsername) {
      setSearchUsername(currentUser.username)
    }
  }, [currentUser, searchUsername])

  const availableSeasons = getAvailableSeasons()
  const stats = leagues ? calculateStats(leagues) : null
  const record = calculateRecord(rostersByLeague)
  const titlesCount = userTitles?.length || 0

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeInput(e.target.value)
    setInputValue(sanitized)
    setValidationError(null)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!isOnline) {
      setValidationError('Você está offline')
      return
    }

    const validation = validateUsername(inputValue)
    if (!validation.valid) {
      setValidationError(validation.error || 'Username inválido')
      return
    }

    setValidationError(null)
    setSearchUsername(inputValue.trim())
  }

  const handleLogout = () => {
    setSearchUsername('')
    setInputValue('')
    setValidationError(null)
    logout()
  }

  const effectiveUser = currentUser || user

  const getErrorMessage = () => {
    if (validationError) return validationError
    if (userError) {
      if (isApiError(userError) && userError.statusCode === 404) {
        return 'Usuário não encontrado'
      }
      return 'Erro ao buscar usuário'
    }
    return null
  }

  const errorMessage = getErrorMessage()

  // Login Screen - antes de autenticar
  if (!effectiveUser) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <main className="flex-1">
          <div className="max-w-md mx-auto mt-20 px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent">
                  Fantasy Intel
                </span>
              </h1>
              <p className="text-muted-foreground">Entre com seu username do Sleeper</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Username do Sleeper"
                  maxLength={25}
                  aria-label="Username do Sleeper"
                  aria-describedby={errorMessage ? 'error-message' : undefined}
                  aria-invalid={!!errorMessage}
                  className={`w-full px-4 py-3 bg-card/50 border rounded-xl backdrop-blur-sm focus:outline-none focus:ring-2 transition ${
                    errorMessage
                      ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                      : 'border-border focus:border-primary focus:ring-primary/20'
                  }`}
                  disabled={loadingUser}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  3-25 caracteres (letras, números e _)
                </p>
              </div>

              <button
                type="submit"
                disabled={loadingUser || !inputValue.trim() || !isOnline}
                className="w-full px-4 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500 disabled:from-muted disabled:to-muted disabled:cursor-not-allowed rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {loadingUser ? 'Carregando...' : 'Entrar'}
              </button>
            </form>

            {errorMessage && (
              <div
                id="error-message"
                role="alert"
                className="mt-4 p-4 bg-destructive/20 border border-destructive/40 rounded-xl text-destructive text-sm text-center"
              >
                {errorMessage}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Dashboard - quando logado, usa MainLayout
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header com info do usuário */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {effectiveUser.avatar ? (
              <img
                src={`https://sleepercdn.com/avatars/thumbs/${effectiveUser.avatar}`}
                alt={effectiveUser.display_name || effectiveUser.username}
                className="h-14 w-14 rounded-full border-2 border-primary/40 object-cover"
              />
            ) : (
              <div className="h-14 w-14 rounded-full border-2 border-border bg-muted flex items-center justify-center text-muted-foreground font-bold text-xl">
                {(effectiveUser.display_name || effectiveUser.username)?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {effectiveUser.display_name || effectiveUser.username}
              </h1>
              <p className="text-muted-foreground text-sm">@{effectiveUser.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="px-4 py-2 bg-card/50 border border-border/60 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {availableSeasons.map(season => (
                <option key={season} value={season}>{season}</option>
              ))}
            </select>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm font-medium hover:bg-destructive/20 transition"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-4">
              <div className="text-sm text-muted-foreground font-medium">Ligas</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-4">
              <div className="text-sm text-muted-foreground font-medium">Dynasty</div>
              <div className="text-2xl font-bold">{stats.dynasty}</div>
            </div>
            <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-4">
              <div className="text-sm text-muted-foreground font-medium">Vitórias</div>
              <div className="text-2xl font-bold text-emerald-500">{record.wins}</div>
            </div>
            <div
              className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-4 cursor-pointer hover:border-gold/40 transition"
              onClick={() => setShowTitlesModal(true)}
            >
              <div className="text-sm text-muted-foreground font-medium">Títulos</div>
              <div className="text-2xl font-bold text-gold">{loadingTitles ? '...' : titlesCount}</div>
            </div>
          </div>
        )}

        {/* Warnings */}
        {playersError && (
          <div className="p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg text-yellow-400 text-sm" role="alert">
            Erro ao carregar dados dos jogadores. Algumas informações podem estar incompletas.
          </div>
        )}

        {/* Leagues List */}
        <section>
          {loadingLeagues && (
            <>
              <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
                Carregando ligas...
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1,2,3,4,5,6].map(i => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </>
          )}

          {leaguesError && !loadingLeagues && (
            <ErrorCard
              message="Erro ao carregar ligas"
              onRetry={() => refetchLeagues()}
            />
          )}

          {!loadingLeagues && !leaguesError && leagues && leagues.length > 0 && (
            <>
              <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
                Suas Ligas ({leagues.length})
              </h2>
              <div
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                role="list"
                aria-label="Lista de ligas"
              >
                {leagues.map(league => (
                  <LeagueCard
                    key={league.league_id}
                    league={league}
                    myRoster={rostersByLeague?.[league.league_id]}
                    picks={picksByLeague?.[league.league_id]}
                    onClick={() => router.push(`/league/${league.league_id}`)}
                  />
                ))}
              </div>
            </>
          )}

          {!loadingLeagues && !leaguesError && leagues && leagues.length === 0 && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🤷</div>
              <p className="text-muted-foreground">Nenhuma liga encontrada para {selectedSeason}</p>
            </div>
          )}
        </section>
      </div>

      <TitlesModal
        titles={userTitles || []}
        isOpen={showTitlesModal}
        onClose={() => setShowTitlesModal(false)}
      />
    </MainLayout>
  )
}
