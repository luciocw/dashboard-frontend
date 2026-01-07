import { describe, it, expect } from 'vitest'
import { getLeagueType, getLeagueTags, formatLineup } from './league'
import type { SleeperLeague } from '@/types/sleeper'

const createMockLeague = (overrides: Partial<SleeperLeague> = {}): SleeperLeague => ({
  league_id: '123',
  name: 'Test League',
  season: '2025',
  status: 'in_season',
  total_rosters: 12,
  settings: {},
  roster_positions: [],
  ...overrides,
})

describe('getLeagueType', () => {
  it('deve retornar Dynasty para type 2', () => {
    expect(getLeagueType({ type: 2 })).toBe('Dynasty')
  })

  it('deve retornar Keeper para type 1', () => {
    expect(getLeagueType({ type: 1 })).toBe('Keeper')
  })

  it('deve retornar Redraft para type 0', () => {
    expect(getLeagueType({ type: 0 })).toBe('Redraft')
  })

  it('deve retornar Redraft por padrão', () => {
    expect(getLeagueType({})).toBe('Redraft')
  })
})

describe('formatLineup', () => {
  it('deve formatar lineup corretamente', () => {
    const positions = ['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'FLEX', 'BN', 'BN']
    const result = formatLineup(positions)
    expect(result).toContain('QB')
    expect(result).toContain('2RB')
    expect(result).toContain('2WR')
    expect(result).toContain('TE')
    expect(result).toContain('FLEX')
    expect(result).not.toContain('BN')
  })

  it('deve retornar array vazio para positions vazio', () => {
    expect(formatLineup([])).toEqual([])
  })
})

describe('getLeagueTags', () => {
  it('deve incluir tag DYNASTY para liga dynasty', () => {
    const league = createMockLeague({ settings: { type: 2 } })
    const tags = getLeagueTags(league)
    expect(tags.some(t => t.label === 'DYNASTY')).toBe(true)
  })

  it('deve incluir tag SF para superflex', () => {
    const league = createMockLeague({ roster_positions: ['QB', 'SUPER_FLEX'], total_rosters: 10 })
    const tags = getLeagueTags(league)
    expect(tags.some(t => t.label === 'SF')).toBe(true)
  })

  it('deve incluir tag IDP para ligas IDP', () => {
    const league = createMockLeague({ roster_positions: ['QB', 'DL', 'LB'] })
    const tags = getLeagueTags(league)
    expect(tags.some(t => t.label === 'IDP')).toBe(true)
  })
})
