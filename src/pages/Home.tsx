import { useState, FormEvent, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSleeperUser, useSleeperLeagues } from '@/hooks/useSleeperUser'
import { useAppStore } from '@/store/useAppStore'
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

export function Home() {
  const navigate = useNavigate()
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header - só mostra quando logado */}
      {effectiveUser && (
        <DashboardHeader
          username={effectiveUser.username}
          displayName={effectiveUser.display_name}
          avatarUrl={effectiveUser.avatar ? `https://sleepercdn.com/avatars/thumbs/${effectiveUser.avatar}` : undefined}
          selectedSeason={selectedSeason}
          availableSeasons={availableSeasons}
          onSeasonChange={setSelectedSeason}
          onLogout={handleLogout}
        />
      )}

      <main className="flex-1">
        {/* Login Screen */}
        {!effectiveUser && (
          <div className="max-w-md mx-auto mt-20 px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                  Dynasty Dashboard
                </span>
              </h1>
              <p className="text-slate-400">Entre com seu username do Sleeper</p>
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
                  className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl backdrop-blur-sm focus:outline-none focus:ring-2 transition ${
                    errorMessage 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/20'
                  }`}
                  disabled={loadingUser}
                />
                <p className="text-xs text-slate-500 mt-1">
                  3-25 caracteres (letras, números e _)
                </p>
              </div>
              
              <button 
                type="submit"
                disabled={loadingUser || !inputValue.trim() || !isOnline} 
                className="w-full px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                {loadingUser ? 'Carregando...' : 'Entrar'}
              </button>
            </form>
            
            {errorMessage && (
              <div 
                id="error-message"
                role="alert"
                className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-xl text-red-400 text-sm text-center"
              >
                {errorMessage}
              </div>
            )}
          </div>
        )}

        {/* Dashboard - quando logado */}
        {effectiveUser && (
          <>
            {/* Hero Section com Stats */}
            {stats && (
              <HeroSection
                username={effectiveUser.display_name || effectiveUser.username}
                leagues={stats.total}
                dynasty={stats.dynasty}
                wins={record.wins}
                losses={record.losses}
                titles={loadingTitles ? 0 : titlesCount}
                onTitlesClick={() => setShowTitlesModal(true)}
              />
            )}

            {/* Leagues Section */}
            <section className="max-w-6xl mx-auto px-4 pb-8">
              {playersError && (
                <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg text-yellow-400 text-sm" role="alert">
                  ⚠️ Erro ao carregar dados dos jogadores. Algumas informações podem estar incompletas.
                </div>
              )}

              {loadingLeagues && (
                <>
                  <h2 className="text-lg font-semibold mb-4 text-slate-300">
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
                  <h2 className="text-lg font-semibold mb-4 text-slate-300">
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
                        onClick={() => navigate(`/league/${league.league_id}`)}
                      />
                    ))}
                  </div>
                </>
              )}

              {!loadingLeagues && !leaguesError && leagues && leagues.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🤷</div>
                  <p className="text-slate-400">Nenhuma liga encontrada para {selectedSeason}</p>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Footer />

      <TitlesModal 
        titles={userTitles || []}
        isOpen={showTitlesModal}
        onClose={() => setShowTitlesModal(false)}
      />
    </div>
  )
}
