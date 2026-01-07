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
import { LeagueCard } from '@/components/LeagueCard'
import { StatCard } from '@/components/ui/StatCard'
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
  if (!rosters) return { wins: 0, losses: 0, winRate: 0 }
  
  let totalWins = 0
  let totalLosses = 0
  
  Object.values(rosters).forEach(roster => {
    if (roster) {
      totalWins += roster.settings.wins || 0
      totalLosses += roster.settings.losses || 0
    }
  })
  
  const totalGames = totalWins + totalLosses
  const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0
  
  return { wins: totalWins, losses: totalLosses, winRate }
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
  
  const { data: players, error: playersError } = usePlayers()
  
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
  const recordDisplay = `${record.wins}-${record.losses}`
  const winRateDisplay = `${record.winRate.toFixed(0)}%`

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏈</span>
            <h1 className="font-bold text-lg">Dynasty Dashboard</h1>
          </div>
          
          {effectiveUser && (
            <div className="flex items-center gap-4">
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                aria-label="Selecionar temporada"
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {availableSeasons.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              
              <div className="flex items-center gap-2">
                {effectiveUser.avatar && (
                  <img 
                    src={`https://sleepercdn.com/avatars/thumbs/${effectiveUser.avatar}`}
                    className="w-8 h-8 rounded-full"
                    alt={`Avatar de ${effectiveUser.display_name || effectiveUser.username}`}
                    loading="lazy"
                  />
                )}
                <span className="text-sm font-medium hidden sm:inline">{effectiveUser.display_name || effectiveUser.username}</span>
              </div>

              <button
                onClick={handleLogout}
                aria-label="Sair da conta"
                className="text-xs text-slate-400 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-2 py-1"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {!effectiveUser && (
          <div className="max-w-md mx-auto mt-20">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🏈</div>
              <h2 className="text-2xl font-bold mb-2">Dynasty Dashboard</h2>
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
                  className={`w-full px-4 py-3 bg-slate-900 border rounded-xl focus:outline-none focus:ring-2 transition ${
                    errorMessage 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'
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
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                ❌ {errorMessage}
              </div>
            )}
          </div>
        )}

        {effectiveUser && (
          <>
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Ligas" value={stats.total} icon="📋" />
                <StatCard label="Dynasty" value={stats.dynasty} icon="👑" />
                <StatCard 
                  label={`Record ${selectedSeason}`} 
                  value={recordDisplay} 
                  icon="📊" 
                />
                <StatCard 
                  label="Títulos" 
                  value={loadingTitles ? '...' : titlesCount} 
                  icon="🏆"
                  highlight={titlesCount > 0}
                  onClick={() => setShowTitlesModal(true)}
                />
              </div>
            )}

            {record.wins + record.losses > 0 && (
              <div className="flex justify-center mb-6">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  record.winRate >= 60 
                    ? 'bg-green-900/30 text-green-400 border border-green-800/50' 
                    : record.winRate >= 50 
                      ? 'bg-blue-900/30 text-blue-400 border border-blue-800/50'
                      : 'bg-red-900/30 text-red-400 border border-red-800/50'
                }`}>
                  <span>Win Rate: {winRateDisplay}</span>
                  <span className="text-xs opacity-70">({record.wins}W - {record.losses}L)</span>
                </div>
              </div>
            )}

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
                      players={players}
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
