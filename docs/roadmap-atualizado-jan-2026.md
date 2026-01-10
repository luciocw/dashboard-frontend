# Roadmap Fantasy Intel - Atualizado 09/01/2026

## **STATUS GERAL DO PROJETO**
```
██████████████████████████░░░ 85% Completo

✅ Fase A: Fundação (100%)
✅ Fase B: Modularização (100%)
✅ Fase C: Navegação + Melhorias (100%)
✅ Fase D: Migração Next.js + Premium UI (100%)
✅ Fase E: Rebranding Fantasy Intel (100%) ← NOVA
🔄 Fase F: Features Avançadas (50%)
⏳ Fase G: Internacionalização - i18n (0%)
⏳ Fase H: Identidade Visual (0%)
⏳ Fase I: Deploy (0%)
⏳ Fase J: Mobile Nativo (0%)
```

---

## **✅ FASE A: FUNDAÇÃO & SETUP** *(COMPLETA - 04/01/2026)*

### **Entregáveis:**
- ✅ Repositório GitHub configurado
- ✅ Vite + React 18 + TypeScript
- ✅ Tailwind CSS funcionando
- ✅ TanStack Query v5
- ✅ Zustand para estado global
- ✅ API Sleeper integrada com cache (4h TTL)
- ✅ Componentes UI base (Button, Input, Card, Skeleton)
- ✅ SSH configurado para GitHub
- ✅ Build de produção funcionando (760KB)

---

## **✅ FASE B: MODULARIZAÇÃO** *(COMPLETA - 04/01/2026)*

### **Entregáveis:**
- ✅ Componentes específicos criados (Header, Footer, LeagueCard, SearchForm)
- ✅ Hooks customizados (useSleeperUser, useSleeperLeagues)
- ✅ Sistema de cache com CacheManager.ts
- ✅ Skeleton loading states
- ✅ Responsividade mobile-first

---

## **✅ FASE C: NAVEGAÇÃO + MELHORIAS** *(COMPLETA - 04/01/2026)*

### **Entregáveis:**
- ✅ Tipagem centralizada (src/types/sleeper.ts)
- ✅ Ano dinâmico NFL (utils/nfl.ts)
- ✅ Error Boundary
- ✅ Organização de páginas
- ✅ React Router configurado

---

## **✅ FASE D: MIGRAÇÃO NEXT.JS + PREMIUM UI** *(COMPLETA - 09/01/2026)*

### **D.1 - Migração Vite → Next.js 15**
- ✅ App Router estruturado (`app/` folder)
- ✅ React atualizado para v19
- ✅ Tailwind CSS atualizado para v4
- ✅ Zustand com fix de hidratação SSR
- ✅ React Query provider configurado
- ✅ Environment variables atualizadas (`NEXT_PUBLIC_*`)
- ✅ TypeScript config atualizado

### **D.2 - Novo Design System (OKLCH)**
- ✅ Sistema de cores OKLCH (perceptualmente uniforme)
- ✅ Variáveis CSS para light/dark themes
- ✅ Cor `--gold` para features premium
- ✅ Glassmorphism effects (backdrop-blur, transparência)

### **D.3 - Layout Premium**
- ✅ `MainLayout.tsx` - Wrapper com sidebar + content area
- ✅ `Navigation.tsx` - Sidebar colapsável (desktop)
- ✅ `BottomNav.tsx` - Navegação mobile com drop-shadow
- ✅ Transições suaves de collapse/expand

### **D.4 - Componentes Premium**
- ✅ `StatCardPremium.tsx` - Cards de estatísticas com gradientes
- ✅ `PlayerCardPremium.tsx` - Cards de jogador com status/trend
- ✅ `MatchupCardPremium.tsx` - Visualização de matchup com win probability
- ✅ Cores por posição (QB, RB, WR, TE, K, DEF)
- ✅ Indicadores de tendência (up/down/neutral)

### **D.5 - Páginas Atualizadas**
- ✅ `/leagues` - Login + Dashboard com MainLayout
- ✅ `/league/[id]` - Detalhes com MainLayout em todos estados
- ✅ `/dashboard` - Demo page dos componentes premium
- ✅ `/trade-calc` - Calculadora de trades
- ✅ `/` - FreeDash (landing page pública)

### **Estrutura Final Next.js:**
```
fantasy-frontend/
├── app/
│   ├── layout.tsx              # Root layout (providers)
│   ├── globals.css             # OKLCH color system
│   ├── page.tsx                # / → FreeDash
│   ├── dashboard/page.tsx      # Demo premium
│   ├── leagues/page.tsx        # Login + ligas
│   ├── league/[id]/page.tsx    # Detalhes da liga
│   └── trade-calc/page.tsx     # Calculadora
├── components/
│   ├── layout/                 # MainLayout, Navigation, BottomNav
│   ├── pages/                  # Client components das páginas
│   ├── premium/                # PremiumGate, UpgradeModal
│   ├── providers/              # AppProviders (React Query)
│   └── ui/                     # Componentes UI (originais + premium)
├── features/                   # trade-calc, idp
├── hooks/                      # 13 hooks customizados
├── store/                      # Zustand (use-app-store.ts)
├── lib/utils.ts                # cn() utility
├── types/                      # Tipos TypeScript
├── constants/                  # Configurações
└── utils/                      # Funções utilitárias
```

### **Commits desta fase:**
```
90f9d87 - feat: migrate from Vite to Next.js 15 with premium UI
d5ee085 - docs: add tech stack documentation
```

---

## **🔄 FASE E: FEATURES AVANÇADAS** *(50% COMPLETO)*

### **Implementado:**
- ✅ League Details com tabs (Roster, Matchups, Standings, Power, Trades, History, IDP)
- ✅ Matchups da semana
- ✅ Power Rankings com algoritmo
- ✅ Trade History
- ✅ IDP Explorer
- ✅ Trade Calculator

### **Pendente:**
- [ ] Trending Players (API Sleeper)
- [ ] Draft Capital visualization
- [ ] Bye Weeks Tracker
- [ ] Notificações push

---

## **⏳ FASE F: DEPLOY & CI/CD** *(PENDENTE)*

### **F.1 - Vercel Deploy** (Recomendado para Next.js)
```bash
1. Conectar GitHub ao Vercel
2. Build automático em cada push
3. Preview deploys para PRs
```

### **F.2 - GitHub Actions**
```yaml
- Lint (ESLint)
- Type-check (tsc)
- Tests (Vitest)
- Build
- Deploy
```

### **F.3 - Domínio Custom**
```
dashboard.dynastyleague.com
→ Vercel DNS ou Cloudflare
→ SSL automático
```

---

## **⏳ FASE G: MOBILE NATIVO** *(FUTURO)*

### **G.1 - React Native + Expo**
- Compartilhar lógica de negócio
- Navigation: React Navigation
- Push: Expo Notifications

### **G.2 - Tier PRO ($4.99/mês)**
- Ligas ilimitadas
- Trending players
- Trade alerts
- Export CSV/JSON
- Sync cross-device

---

## **STACK TECNOLÓGICO ATUAL**

### **Frontend:**
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| TypeScript | 5.7.2 | Tipagem |
| Next.js | 15.1.3 | App Router, SSR/SSG |
| React | 19.0.0 | UI Library |
| Tailwind CSS | 4.0.0 | Styling |
| Zustand | 5.0.2 | State Management |
| TanStack Query | 5.17.19 | Data Fetching |
| Lucide React | 0.454.0 | Icons |

### **Backend:**
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Python | 3.x | API Backend |
| FastAPI | ≥0.104.0 | REST API |
| Cloudflare Workers | - | Edge Functions |

### **APIs Externas:**
- Sleeper API (ligas, rosters, usuários)
- Tank01/RapidAPI (stats live)
- nflverse (stats históricas)

---

## **MÉTRICAS DE PROGRESSO**

### **Código:**
```
Arquivos TypeScript:      ~80
Componentes React:        ~40
Bundle size (prod):       ~150KB per route
Build time:               ~35s
```

### **Funcionalidades:**
```
✅ Login com Sleeper username
✅ Listagem de ligas
✅ Detalhes da liga (7 tabs)
✅ Trade Calculator
✅ IDP Explorer
✅ Premium UI Layout
✅ Sidebar colapsável
✅ Mobile responsive
⏳ Trending players
⏳ Deploy produção
```

---

---

## **✅ FASE E: REBRANDING FANTASY INTEL** *(COMPLETA - 09/01/2026)*

### **E.1 - Novo Nome**
- ✅ Pesquisa de nomes disponíveis
- ✅ Decisão: **Fantasy Intel** (transmite analytics/AI, não exclui Redraft/Keeper)
- ✅ Atualização de todas as referências no código

### **E.2 - Arquivos Atualizados**
- ✅ `package.json` → `fantasy-intel`
- ✅ `app/layout.tsx` → metadata atualizada
- ✅ `PublicHeader.tsx`, `Navigation.tsx`, `Footer.tsx`
- ✅ `DashboardHeader.tsx`, `leagues-content.tsx`
- ✅ `store/use-app-store.ts` → storage key
- ✅ `STACK-TECH.md`

---

## **⏳ FASE G: INTERNACIONALIZAÇÃO (i18n)** *(PENDENTE)*

### **G.1 - Mercados Alvo**
| Prioridade | Idioma | Mercados | Motivo |
|------------|--------|----------|--------|
| 1 | Inglês | UK, Irlanda, Austrália, EUA | Maior mercado NFL |
| 2 | Português | Brasil | Já temos, jogos NFL em SP/Rio |
| 3 | Alemão | Alemanha | 2º maior EU, jogos em Berlim/Munique |
| 4 | Espanhol | Espanha, México | Jogos em Madrid, México City |

### **G.2 - Implementação Técnica**
```
fantasy-intel/
├── messages/
│   ├── en.json      # English (default)
│   ├── pt-BR.json   # Português Brasil
│   ├── de.json      # Deutsch
│   └── es.json      # Español
├── app/
│   └── [locale]/    # Dynamic locale routing
│       ├── page.tsx
│       └── ...
└── lib/
    └── i18n.ts      # next-intl config
```

### **G.3 - Tarefas**
- [ ] Instalar `next-intl`
- [ ] Configurar middleware de locale
- [ ] Criar arquivos de mensagens (en, pt-BR)
- [ ] Extrair strings hardcoded para i18n
- [ ] Adicionar seletor de idioma no header
- [ ] Traduzir para alemão (de)
- [ ] Traduzir para espanhol (es)

---

## **⏳ FASE H: IDENTIDADE VISUAL** *(PENDENTE)*

### **H.1 - Logo**
- [ ] Conceito: "Intel" + Football + Analytics
- [ ] Variações: Logo completo, ícone, favicon
- [ ] Formatos: SVG, PNG (múltiplas resoluções)
- [ ] Dark/Light mode variants

### **H.2 - Cores da Marca**
| Elemento | Cor Atual | Notas |
|----------|-----------|-------|
| Primary | Indigo (#6366f1) | Manter ou ajustar |
| Accent | Blue (#3b82f6) | Gradientes |
| Gold | Premium features | Manter |
| Success | Emerald | Trending up |
| Danger | Rose | Trending down |

### **H.3 - Assets**
- [ ] Favicon.svg atualizado
- [ ] OG Image (Open Graph)
- [ ] Apple Touch Icon
- [ ] Splash screens (PWA)

### **H.4 - Ferramentas Sugeridas**
- Figma para design
- DALL-E/Midjourney para conceitos
- SVG manual para versão final

---

## **PRÓXIMAS AÇÕES**

### **Imediato:**
1. Configurar i18n (next-intl)
2. Criar logo/favicon
3. Deploy no Vercel

### **Curto prazo:**
4. Tradução inglês completa
5. Testes E2E
6. Domínio custom (fantasyintel.com?)

### **Médio prazo:**
7. Traduções alemão/espanhol
8. PWA (offline support)
9. Push notifications
10. Tier Premium

---

## **CRÉDITOS**

**Desenvolvido por:** Lucio
**Assistido por:** Claude (Anthropic)
**Data de Início:** 03/01/2026
**Última Atualização:** 09/01/2026
**Versão Atual:** v3.0.0

---

**FIM DO ROADMAP**
