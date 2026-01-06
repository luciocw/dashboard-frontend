# 🛠️ Guia de Implementação Detalhado - Passo a Passo

## **FASE A: Setup Inicial (Dias 1-2)**

### **Objetivo:**
- ✅ Repositório GitHub configurado
- ✅ Cloudflare Pages conectado
- ✅ Vite + React funcionando
- ✅ Deploy staging no ar

---

### **A.1: Criar Projeto Local**

**Comandos:**
```bash
# Criar pasta
mkdir dynasty-dashboard
cd dynasty-dashboard

# Inicializar Git
git init

# Criar estrutura básica
mkdir -p src/{core/{api,cache,state},components/ui,features,utils}
mkdir -p public .github/workflows
```

**Critério de sucesso:**
```bash
tree -L 2
# Deve mostrar a estrutura de pastas criada
```

---

### **A.2: Configurar Vite + React**

**Comandos:**
```bash
# Criar projeto Vite
npm create vite@latest . -- --template react-ts

# Instalar dependências core
npm install

# Instalar libs principais
npm install @tanstack/react-query zustand zod

# Instalar Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Arquivo: package.json**
```json
{
  "name": "dynasty-dashboard",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.17.19",
    "zustand": "^4.4.7",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.8",
    "vitest": "^1.1.0"
  }
}
```

**Critério de sucesso:**
```bash
npm run dev
# Deve abrir http://localhost:5173
```

---

### **A.3: Criar Cliente API Sleeper**

**Arquivo: src/core/api/sleeper.ts**
```typescript
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
  }
}

export interface SleeperRoster {
  roster_id: number
  owner_id: string
  players: string[]
  starters: string[]
  reserve?: string[]
  taxi?: string[]
  settings: {
    wins: number
    losses: number
    ties: number
    fpts: number
  }
}

export class SleeperAPI {
  private baseURL: string
  private cache: Map<string, { data: any; timestamp: number }>

  constructor() {
    this.baseURL = API_BASE
    this.cache = new Map()
  }

  private getCacheKey(endpoint: string): string {
    return `sleeper:${endpoint}`
  }

  private isCacheValid(timestamp: number, ttlHours: number = 4): boolean {
    const now = Date.now()
    const ttlMs = ttlHours * 60 * 60 * 1000
    return (now - timestamp) < ttlMs
  }

  private async fetchWithCache<T>(
    endpoint: string,
    ttlHours: number = 4
  ): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint)
    const cached = this.cache.get(cacheKey)

    if (cached && this.isCacheValid(cached.timestamp, ttlHours)) {
      console.log(`✅ Cache hit: ${endpoint}`)
      return cached.data as T
    }

    console.log(`🌐 Fetching: ${endpoint}`)
    const response = await fetch(`${this.baseURL}${endpoint}`)
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    const data = await response.json()
    this.cache.set(cacheKey, { data, timestamp: Date.now() })
    
    return data
  }

  async getUser(username: string): Promise<SleeperUser> {
    return this.fetchWithCache<SleeperUser>(`/user/${username}`)
  }

  async getUserLeagues(userId: string, season: string): Promise<SleeperLeague[]> {
    return this.fetchWithCache<SleeperLeague[]>(`/user/${userId}/leagues/nfl/${season}`)
  }

  async getLeagueRosters(leagueId: string): Promise<SleeperRoster[]> {
    return this.fetchWithCache<SleeperRoster[]>(`/league/${leagueId}/rosters`)
  }

  async getPlayers(): Promise<Record<string, any>> {
    return this.fetchWithCache<Record<string, any>>('/players/nfl', 24) // Cache 24h
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const sleeperAPI = new SleeperAPI()
```

**Critério de sucesso:**
```typescript
// Teste no console do navegador
import { sleeperAPI } from './core/api/sleeper'
const user = await sleeperAPI.getUser('luciocw')
console.log(user) // Deve mostrar seus dados
```

---

### **A.4: Criar Hooks React Query**

**Arquivo: src/hooks/useSleeperUser.ts**
```typescript
import { useQuery } from '@tanstack/react-query'
import { sleeperAPI } from '@/core/api/sleeper'

export function useSleeperUser(username: string) {
  return useQuery({
    queryKey: ['user', username],
    queryFn: () => sleeperAPI.getUser(username),
    enabled: username.length > 0,
    staleTime: 1000 * 60 * 60 * 4, // 4 horas
    retry: 1,
  })
}

export function useSleeperLeagues(userId: string | undefined, season: string) {
  return useQuery({
    queryKey: ['leagues', userId, season],
    queryFn: () => sleeperAPI.getUserLeagues(userId!, season),
    enabled: !!userId,
    staleTime: 1000 * 60 * 60 * 4,
  })
}

export function useLeagueRosters(leagueId: string | undefined) {
  return useQuery({
    queryKey: ['rosters', leagueId],
    queryFn: () => sleeperAPI.getLeagueRosters(leagueId!),
    enabled: !!leagueId,
    staleTime: 1000 * 60 * 60 * 2, // 2 horas
  })
}
```

---

### **A.5: Setup Tailwind**

**Arquivo: tailwind.config.js**
```javascript
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      },
    },
  },
  plugins: [],
}
```

**Arquivo: src/index.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
  }
}
```

---

### **A.6: Criar App Base**

**Arquivo: src/App.tsx**
```typescript
import { useState, FormEvent } from 'react'
import { useSleeperUser, useSleeperLeagues } from './hooks/useSleeperUser'

function App() {
  const [inputValue, setInputValue] = useState('')
  const [username, setUsername] = useState('')
  const [season, setSeason] = useState('2026')

  const { data: user, isLoading: loadingUser, error } = useSleeperUser(username)
  const { data: leagues, isLoading: loadingLeagues } = useSleeperLeagues(user?.user_id, season)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      setUsername(inputValue.trim())
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="container mx-auto p-6 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🏈 Dynasty Dashboard</h1>
          <p className="text-slate-400">v2.0.0 - React Edition</p>
        </header>

        {!user && (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Username do Sleeper"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg"
            />
            <button
              type="submit"
              disabled={loadingUser}
              className="w-full px-4 py-2 bg-blue-600 rounded-lg"
            >
              {loadingUser ? 'Carregando...' : 'Entrar'}
            </button>
          </form>
        )}

        {user && (
          <div>
            <h2 className="text-2xl mb-4">Bem-vindo, {user.display_name}!</h2>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="px-4 py-2 bg-slate-900 rounded-lg"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>

            {leagues && (
              <div className="mt-6 grid gap-4">
                {leagues.map(league => (
                  <div key={league.league_id} className="bg-slate-900 p-4 rounded-lg">
                    <h3 className="font-bold">{league.name}</h3>
                    <p className="text-sm text-slate-400">{league.total_rosters} times</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
```

---

### **A.7: GitHub + Cloudflare**

**Comandos:**
```bash
# Criar repo no GitHub (manual ou gh cli)
git add .
git commit -m "feat: setup inicial com Vite + React + Sleeper API"
git branch -M main
git remote add origin https://github.com/luciocw/dynasty-dashboard.git
git push -u origin main
```

**Cloudflare Pages (via dashboard):**
1. Pages → Create project
2. Connect GitHub → Selecionar repo
3. Build settings:
   - Framework: Vite
   - Build command: `npm run build`
   - Build output: `dist`
4. Deploy!

**Critério de sucesso:**
- ✅ Site no ar em `dynasty-dashboard.pages.dev`
- ✅ Auto-deploy em cada push

---

## **FASE B: Componentes Reutilizáveis (Dias 3-5)**

### **B.1: Criar LeagueCard Component**

**Arquivo: src/components/LeagueCard.tsx**
```typescript
interface LeagueCardProps {
  league: {
    league_id: string
    name: string
    avatar?: string
    total_rosters: number
    settings?: {
      wins?: number
      losses?: number
    }
  }
  onClick?: () => void
}

export function LeagueCard({ league, onClick }: LeagueCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer"
    >
      <div className="flex items-start gap-3">
        {league.avatar ? (
          <img
            src={`https://sleepercdn.com/avatars/thumbs/${league.avatar}`}
            alt={league.name}
            className="w-12 h-12 rounded-lg"
          />
        ) : (
          <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
            🏈
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{league.name}</h3>
          <p className="text-slate-400 text-sm">{league.total_rosters} times</p>
          {league.settings && (
            <p className="text-sm mt-1">
              {league.settings.wins || 0}-{league.settings.losses || 0}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Critério de sucesso:**
- ✅ Component renderiza corretamente
- ✅ Hover effect funciona
- ✅ Imagens carregam
- ✅ Fallback funciona sem avatar

---

## **FASE C: Cloudflare Workers Proxy (Dias 8-10)**

### **C.1: Criar Worker**

**Comandos:**
```bash
mkdir workers
cd workers
npm create cloudflare@latest sleeper-proxy
# Escolher: "Hello World" Worker
cd sleeper-proxy
```

**Arquivo: workers/sleeper-proxy/src/index.ts**
```typescript
export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    
    // Apenas proxy para /api/sleeper/*
    if (!url.pathname.startsWith('/api/sleeper')) {
      return new Response('Not found', { status: 404 })
    }

    // Remove /api/sleeper do path
    const sleeperPath = url.pathname.replace('/api/sleeper', '')
    const sleeperUrl = `https://api.sleeper.app/v1${sleeperPath}${url.search}`

    // Tentar cache primeiro
    const cache = caches.default
    const cacheKey = new Request(sleeperUrl, { method: 'GET' })
    let response = await cache.match(cacheKey)

    if (response) {
      console.log('Cache HIT:', sleeperPath)
      return response
    }

    // Cache MISS - buscar da API
    console.log('Cache MISS:', sleeperPath)
    response = await fetch(sleeperUrl)

    // Cachear por 1 hora
    if (response.ok) {
      response = new Response(response.body, {
        headers: {
          ...Object.fromEntries(response.headers),
          'Cache-Control': 'public, s-maxage=3600',
          'Access-Control-Allow-Origin': '*',
        },
      })
      ctx.waitUntil(cache.put(cacheKey, response.clone()))
    }

    return response
  },
}
```

**Deploy:**
```bash
wrangler deploy
```

**Atualizar app para usar proxy:**
```typescript
// src/core/api/sleeper.ts
const API_BASE = '/api/sleeper' // Agora aponta pro Worker
```

---

## **Troubleshooting Comum**

### **Problema: "Cannot find module '@/...'"**
**Solução:**
```typescript
// vite.config.ts
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### **Problema: Tailwind não funciona**
**Solução:**
```bash
# Verificar imports
# src/main.tsx deve ter:
import './index.css'

# Verificar postcss.config.js existe
```

### **Problema: API retorna CORS error**
**Solução:**
API Sleeper já tem CORS habilitado. Se der erro, verifique URL.

---

**Fim do Guia de Implementação**

