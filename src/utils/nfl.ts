/**
 * Retorna o ano da temporada NFL atual
 * A temporada NFL começa em setembro e vai até fevereiro do ano seguinte
 * Exemplo: Set/2025 - Fev/2026 = temporada 2025
 */
export function getCurrentNFLSeason(): string {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // JavaScript months são 0-indexed
  
  // Se estamos entre março e agosto, a próxima temporada ainda não começou
  // Então usamos o ano atual como temporada
  if (currentMonth >= 3 && currentMonth <= 8) {
    return String(currentYear)
  }
  
  // Se estamos entre setembro e dezembro, a temporada atual já começou
  if (currentMonth >= 9) {
    return String(currentYear)
  }
  
  // Se estamos entre janeiro e fevereiro, ainda estamos na temporada do ano anterior
  return String(currentYear - 1)
}

/**
 * Retorna lista de anos disponíveis para seleção
 * Inclui os últimos 5 anos + próximo ano
 */
export function getAvailableSeasons(): string[] {
  const currentSeason = parseInt(getCurrentNFLSeason())
  const seasons: string[] = []
  
  // Próximo ano (para drafts futuros)
  seasons.push(String(currentSeason + 1))
  
  // Anos anteriores (histórico)
  for (let i = 0; i <= 4; i++) {
    seasons.push(String(currentSeason - i))
  }
  
  return seasons
}
