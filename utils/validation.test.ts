import { describe, it, expect } from 'vitest'
import { validateUsername, sanitizeInput } from './validation'

describe('validateUsername', () => {
  it('deve rejeitar username vazio', () => {
    const result = validateUsername('')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Digite um username')
  })

  it('deve rejeitar username muito curto', () => {
    const result = validateUsername('ab')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Username deve ter pelo menos 3 caracteres')
  })

  it('deve rejeitar username muito longo', () => {
    const result = validateUsername('a'.repeat(26))
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Username deve ter no máximo 25 caracteres')
  })

  it('deve rejeitar caracteres especiais', () => {
    const result = validateUsername('user@123')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Username pode conter apenas letras, números e _')
  })

  it('deve aceitar username válido', () => {
    const result = validateUsername('luciocw')
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('deve aceitar username com underscore', () => {
    const result = validateUsername('lucio_cw')
    expect(result.valid).toBe(true)
  })

  it('deve aceitar username com números', () => {
    const result = validateUsername('lucio123')
    expect(result.valid).toBe(true)
  })
})

describe('sanitizeInput', () => {
  it('deve remover espaços extras', () => {
    expect(sanitizeInput('  lucio  ')).toBe('lucio')
  })

  it('deve remover caracteres HTML', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert(xss)/script')
  })

  it('deve limitar a 25 caracteres', () => {
    const result = sanitizeInput('a'.repeat(50))
    expect(result.length).toBe(25)
  })
})
