# 🏈 Dynasty Dashboard

Dashboard completo para gerenciamento de ligas de Fantasy Football do Sleeper.

![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![React](https://img.shields.io/badge/React-18-61dafb)

---

## ✅ Features Implementadas

### Fase A - Base
- ✅ Login com username do Sleeper
- ✅ Listagem de ligas do usuário
- ✅ Seletor de temporada
- ✅ Persistência de sessão

### Fase B - Liga
- ✅ Rosters completos (jogadores)
- ✅ Matchups da semana
- ✅ Trade history
- ✅ Power rankings
- ✅ Standings/Classificação
- ✅ Histórico de campeões

### Fase C - Visual Redesign (07/01/2026)
- ✅ Header + Hero Section redesenhados
- ✅ League Card com roster status e picks
- ✅ Matchup Card visual (VS, scores, glow)
- ✅ Standings Table com badges top 3
- ✅ Power Rankings com tendências
- ✅ Design System reference
- ✅ Roster View com cores por posição
- ✅ Trades View layout lado-a-lado
- ✅ Champions History (Hall da Fama)
- ✅ Ícones lucide-react (Taxi, IR, etc)
- ✅ Scroll to top ao abrir liga

### Qualidade
- ✅ 100% TypeScript (strict mode)
- ✅ Mobile responsive
- ✅ Zero cost hosting (Cloudflare Pages)

---

## 🔜 Próximas Features (Backlog)

- [ ] Draft Picks management
- [ ] Trending players
- [ ] Player values/rankings
- [ ] League comparison
- [ ] Export data (PDF/CSV)
- [ ] PWA support
- [ ] Dark/Light theme toggle
- [ ] Notificações push

---

## 🛠 Tech Stack

| Categoria | Tecnologia |
|-----------|------------|
| Framework | React 18 |
| Build | Vite 5 |
| Linguagem | TypeScript 5 (strict) |
| Estilo | Tailwind CSS 3 |
| Estado | Zustand + TanStack Query |
| Roteamento | React Router 6 |
| Ícones | Lucide React |
| API | Sleeper API v1 |
| Deploy | Cloudflare Pages |

---

## 🚀 Como Rodar
```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Deploy para Cloudflare
npx wrangler pages deploy dist --project-name=dashboard-frontend
```

---

## 📁 Estrutura do Projeto
```
src/
├── components/          # Componentes reutilizáveis
│   ├── DashboardHeader.tsx
│   ├── HeroSection.tsx
│   ├── LeagueCard.tsx
│   ├── MatchupCard.tsx
│   ├── MatchupsView.tsx
│   ├── RosterView.tsx
│   ├── StandingsTable.tsx
│   ├── PowerRankings.tsx
│   ├── TradesView.tsx
│   ├── ChampionsHistory.tsx
│   ├── TitlesModal.tsx
│   └── ui/              # Componentes UI base
├── hooks/               # Custom hooks
├── pages/               # Páginas da aplicação
│   ├── Home.tsx
│   └── LeagueDetails.tsx
├── store/               # Estado global (Zustand)
├── types/               # Tipos TypeScript
├── utils/               # Utilitários
│   └── cn.ts            # Class merge helper
└── constants/           # Constantes
```

---

## 🎨 Design System

### Cores Principais
| Elemento | Cor |
|----------|-----|
| Background | `slate-950` |
| Surface | `slate-900` |
| Cards | `slate-800/50` + `backdrop-blur` |
| Primary | `cyan-400` / `cyan-500` |
| Borders | `slate-700/60` |
| Gradients | `from-cyan-600 to-blue-600` |

### Cores por Posição
| Posição | Cor | Hex |
|---------|-----|-----|
| QB | 🔴 | `red-400` |
| RB | 🟢 | `green-400` |
| WR | 🔵 | `blue-400` |
| TE | 🟡 | `yellow-400` |
| K | 🟣 | `purple-400` |
| DEF | 🟠 | `orange-400` |
| DL | 💗 | `pink-400` |
| LB | 💜 | `indigo-400` |
| DB | 🩵 | `teal-400` |

### Badges de Liga
| Tipo | Cor |
|------|-----|
| DYNASTY | `purple-500/20` |
| REDRAFT | `slate-500/20` |
| SF | `green-500/20` |
| IDP | `red-500/20` |
| PPR | `blue-500/20` |

### Draft Picks
| Round | Cor |
|-------|-----|
| 1st | 🥇 `yellow-500/20` |
| 2nd | 🥈 `slate-300/20` |
| 3rd | 🥉 `amber-700/20` |
| 4th+ | `slate-600/20` |

### Ícones (lucide-react)
| Elemento | Ícone |
|----------|-------|
| Taxi Squad | `Car` (amarelo) |
| Injured Reserve | `Hospital` (vermelho) |
| Troféu | `Trophy` (amarelo) |
| Subindo | `TrendingUp` (verde) |
| Caindo | `TrendingDown` (vermelho) |

---

## 📅 Histórico de Alterações

| Data | Alteração |
|------|-----------|
| 07/01/2026 | ✅ Visual Redesign completo |
| 07/01/2026 | ✅ Header + HeroSection |
| 07/01/2026 | ✅ LeagueCard com roster/picks |
| 07/01/2026 | ✅ MatchupCard, StandingsTable, PowerRankings |
| 07/01/2026 | ✅ RosterView, TradesView, ChampionsHistory |
| 07/01/2026 | ✅ Scroll to top + ícones Taxi/IR |

---

## 📝 Licença

MIT © Lucio CW
