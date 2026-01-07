/**
 * Valida username do Sleeper
 * - Mínimo 3 caracteres
 * - Máximo 25 caracteres
 * - Apenas letras, números e underscore
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  const trimmed = username.trim()
  
  if (!trimmed) {
    return { valid: false, error: 'Digite um username' }
  }
  
  if (trimmed.length < 3) {
    return { valid: false, error: 'Username deve ter pelo menos 3 caracteres' }
  }
  
  if (trimmed.length > 25) {
    return { valid: false, error: 'Username deve ter no máximo 25 caracteres' }
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return { valid: false, error: 'Username pode conter apenas letras, números e _' }
  }
  
  return { valid: true }
}

/**
 * Sanitiza input removendo caracteres perigosos
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>'"&]/g, '') // Remove caracteres HTML perigosos
    .slice(0, 25) // Limita tamanho
}
