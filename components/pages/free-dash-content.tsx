'use client'

/**
 * Free Dash Content
 * Dashboard gratuito - onde tudo começou!
 * Usa o HTML legado original após login.
 * Username é descartado quando o usuário sai da página.
 */

import { useState, FormEvent, useEffect } from 'react'
import { useSleeperUser } from '@/hooks/useSleeperUser'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { Footer } from '@/components/Footer'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { BottomNav } from '@/components/layout/BottomNav'
import { validateUsername, sanitizeInput } from '@/utils/validation'
import { isApiError } from '@/utils/errors'
import { Sparkles, Shield, Trash2, LogOut } from 'lucide-react'

const LEGACY_USER_KEY = 'dynasty_user'

function NostalgicBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/20 p-4 mb-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="relative flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-amber-400 flex items-center gap-2">
            Dashboard Original
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
              v1.0
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Onde tudo começou! A primeira versão do Fantasy Intel.
          </p>
        </div>
      </div>
    </div>
  )
}

function PrivacyNotice() {
  return (
    <div className="mt-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
      <div className="flex items-start gap-3">
        <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-2">
          <h3 className="font-semibold text-emerald-400 text-sm">Sua privacidade é importante</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <Trash2 className="w-3 h-3" />
              <span>Seu username <strong>não é salvo</strong> permanentemente</span>
            </li>
            <li className="flex items-center gap-2">
              <LogOut className="w-3 h-3" />
              <span>Ao sair desta página, todos os dados são descartados</span>
            </li>
            <li className="flex items-center gap-2">
              <Shield className="w-3 h-3" />
              <span>Dados obtidos diretamente da API pública do Sleeper</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export function FreeDashContent() {
  const isOnline = useOnlineStatus()

  const [inputValue, setInputValue] = useState('')
  const [searchUsername, setSearchUsername] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [showLegacyDash, setShowLegacyDash] = useState(false)

  const {
    data: user,
    isLoading: loadingUser,
    error: userError,
  } = useSleeperUser(searchUsername)

  // Quando user é carregado, salvar no localStorage e mostrar iframe
  useEffect(() => {
    if (user) {
      // Salvar no localStorage para o HTML legado ler
      localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(user))
      setShowLegacyDash(true)
    }
  }, [user])

  // Limpar localStorage quando sair da página
  useEffect(() => {
    return () => {
      localStorage.removeItem(LEGACY_USER_KEY)
      // Também limpar o cache do legacy
      localStorage.removeItem('dynasty_cache')
    }
  }, [])

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
    // Limpar tudo
    localStorage.removeItem(LEGACY_USER_KEY)
    localStorage.removeItem('dynasty_cache')
    setSearchUsername('')
    setInputValue('')
    setValidationError(null)
    setShowLegacyDash(false)
  }

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

  // Mostrar o dashboard legado em iframe
  if (showLegacyDash && user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Header minimalista com botão de sair */}
        <header className="sticky top-0 z-50 border-b border-border/40 bg-card/80 backdrop-blur-xl safe-area-top">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex h-12 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold text-amber-400">Free Dash</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    v1.0
                  </span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {user.display_name || user.username}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </header>

        {/* Iframe do dashboard legado */}
        <main className="flex-1 flex flex-col">
          <iframe
            src="/legacy/index.html"
            title="Dynasty Dashboard Legacy"
            className="flex-1 w-full border-0"
            style={{
              minHeight: 'calc(100vh - 48px)',
            }}
          />
        </main>
      </div>
    )
  }

  // Tela de login
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PublicHeader />

      <main className="flex-1 pb-24 md:pb-8">
        <div className="max-w-md mx-auto mt-8 px-4">
          <NostalgicBanner />

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Free Dash
              </span>
            </h1>
            <p className="text-muted-foreground">
              Visualize todas suas ligas Sleeper em um só lugar.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Rápido, gratuito e sem cadastro.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Digite seu username do Sleeper"
                maxLength={25}
                aria-label="Username do Sleeper"
                aria-describedby={errorMessage ? 'error-message' : undefined}
                aria-invalid={!!errorMessage}
                className={`w-full px-4 py-3 bg-card/50 border rounded-xl backdrop-blur-sm focus:outline-none focus:ring-2 transition ${
                  errorMessage
                    ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                    : 'border-border focus:border-emerald-500 focus:ring-emerald-500/20'
                }`}
                disabled={loadingUser}
              />
              <p className="text-xs text-muted-foreground mt-1">
                3-25 caracteres (letras, números e _)
              </p>
            </div>

            <button
              type="submit"
              disabled={loadingUser || !inputValue.trim() || !isOnline}
              className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:from-muted disabled:to-muted disabled:cursor-not-allowed rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white"
            >
              {loadingUser ? 'Carregando...' : 'Ver Minhas Ligas'}
            </button>
          </form>

          {errorMessage && (
            <div
              id="error-message"
              role="alert"
              className="mt-4 p-4 bg-destructive/20 border border-destructive/40 rounded-xl text-destructive text-sm text-center"
            >
              {errorMessage}
            </div>
          )}

          <PrivacyNotice />
        </div>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>

      <BottomNav />
    </div>
  )
}
