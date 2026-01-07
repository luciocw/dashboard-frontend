/**
 * Erro customizado para chamadas de API
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Verifica se o erro é um ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/**
 * Mensagens de erro amigáveis por status code
 */
export function getErrorMessage(statusCode?: number): string {
  switch (statusCode) {
    case 404:
      return 'Não encontrado'
    case 429:
      return 'Muitas requisições. Aguarde um momento.'
    case 500:
      return 'Erro no servidor. Tente novamente.'
    case 503:
      return 'Serviço indisponível. Tente novamente.'
    default:
      return 'Erro ao carregar dados'
  }
}
