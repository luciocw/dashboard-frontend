const API_BASE = 'https://api.sleeper.app/v1'

export interface SleeperUser {
  user_id: string
  username: string
  display_name: string
  avatar?: string
}

export interface SleeperLeague {
  league_id: string
  name: string
  avatar?: string
  season: string
  total_rosters: number
  settings: {
    type?: number
    wins?: number
    losses?: number
    ties?: number
  }
}

export class SleeperAPI {
  private baseURL: string

  constructor() {
    this.baseURL = API_BASE
  }

  async getUser(username: string): Promise<SleeperUser> {
    const response = await fetch(`${this.baseURL}/user/${username}`)
    if (!response.ok) {
      throw new Error('Usuário não encontrado')
    }
    return response.json()
  }

  async getUserLeagues(userId: string, season: string): Promise<SleeperLeague[]> {
    const response = await fetch(`${this.baseURL}/user/${userId}/leagues/nfl/${season}`)
    if (!response.ok) {
      throw new Error('Erro ao buscar ligas')
    }
    return response.json()
  }
}

export const sleeperAPI = new SleeperAPI()
