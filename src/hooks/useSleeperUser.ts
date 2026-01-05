import { useQuery } from '@tanstack/react-query'

// Funções auxiliares de busca (Fetchers)
const fetchUser = async (username: string) => {
  const res = await fetch(`https://api.sleeper.app/v1/user/${username}`)
  if (!res.ok) throw new Error('User not found')
  return res.json()
}

const fetchLeagues = async (userId: string, season: string) => {
  const res = await 
fetch(`https://api.sleeper.app/v1/user/${userId}/leagues/nfl/${season}`)
  if (!res.ok) throw new Error('Leagues not found')
  return res.json()
}

const fetchLeagueDetails = async (leagueId: string) => {
  // Busca em paralelo: Dados da Liga, Times (Rosters) e Usuários
  const [leagueRes, rostersRes, usersRes] = await Promise.all([
    fetch(`https://api.sleeper.app/v1/league/${leagueId}`),
    fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`),
    fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`)
  ])

  if (!leagueRes.ok || !rostersRes.ok || !usersRes.ok) {
    throw new Error('Failed to fetch league details')
  }

  const league = await leagueRes.json()
  const rosters = await rostersRes.json()
  const users = await usersRes.json()

  return { league, rosters, users }
}

// Hooks Oficiais
export function useSleeperUser(username: string) {
  return useQuery({
    queryKey: ['user', username],
    queryFn: () => fetchUser(username),
    enabled: !!username,
    retry: false
  })
}

export function useSleeperLeagues(userId: string | undefined, season: string) {
  return useQuery({
    queryKey: ['leagues', userId, season],
    queryFn: () => fetchLeagues(userId!, season),
    enabled: !!userId,
  })
}

export function useLeagueData(leagueId: string | undefined) {
  return useQuery({
    queryKey: ['league', leagueId],
    queryFn: () => fetchLeagueDetails(leagueId!),
    enabled: !!leagueId,
  })
}
