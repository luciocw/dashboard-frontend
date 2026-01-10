import { describe, it, expect } from 'vitest'
import { countByPosition, calculateAvgAge, groupByPosition } from './roster'
import type { PlayersMap } from '@/hooks/usePlayers'

const mockPlayers: PlayersMap = {
  '1': { player_id: '1', first_name: 'Patrick', last_name: 'Mahomes', position: 'QB', team: 'KC', age: 28 },
  '2': { player_id: '2', first_name: 'Travis', last_name: 'Kelce', position: 'TE', team: 'KC', age: 34 },
  '3': { player_id: '3', first_name: 'Tyreek', last_name: 'Hill', position: 'WR', team: 'MIA', age: 30 },
  '4': { player_id: '4', first_name: 'Josh', last_name: 'Allen', position: 'QB', team: 'BUF', age: 27 },
}

describe('countByPosition', () => {
  it('deve contar jogadores por posição', () => {
    const result = countByPosition(['1', '2', '3', '4'], mockPlayers)
    expect(result.QB).toBe(2)
    expect(result.TE).toBe(1)
    expect(result.WR).toBe(1)
  })

  it('deve retornar objeto vazio para array vazio', () => {
    const result = countByPosition([], mockPlayers)
    expect(result).toEqual({})
  })
})

describe('calculateAvgAge', () => {
  it('deve calcular idade média corretamente', () => {
    const result = calculateAvgAge(['1', '2', '3', '4'], mockPlayers)
    expect(result).toBe(29.75) // (28 + 34 + 30 + 27) / 4
  })

  it('deve retornar 0 para array vazio', () => {
    const result = calculateAvgAge([], mockPlayers)
    expect(result).toBe(0)
  })
})

describe('groupByPosition', () => {
  it('deve agrupar jogadores por posição', () => {
    const result = groupByPosition(['1', '2', '3', '4'], mockPlayers)
    expect(result.QB).toEqual(['1', '4'])
    expect(result.TE).toEqual(['2'])
    expect(result.WR).toEqual(['3'])
  })
})
