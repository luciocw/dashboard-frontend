# 🏈 Dynasty Dashboard v2.0

Visualize todas suas ligas Sleeper em um dashboard moderno e responsivo.

## ✨ Features

- ✅ Busca de usuário Sleeper
- ✅ Visualização de múltiplas ligas
- ✅ Filtro por temporada (2022-2026)
- ✅ Cache inteligente (4 horas)
- ✅ Design responsivo (mobile-first)
- ✅ Dark mode nativo
- ✅ Loading states animados

## 🚀 Tech Stack

- **Framework:** React 18 + TypeScript
- **Build:** Vite 5
- **State:** Zustand + TanStack Query
- **UI:** Tailwind CSS + Custom Components
- **API:** Sleeper API v1
- **Deploy:** Cloudflare Pages (em breve)

## 🛠️ Desenvolvimento
```bash
# Instalar dependências
npm install

# Rodar localmente
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 📁 Estrutura
```
src/
├── components/       # Componentes React
│   ├── ui/          # Componentes base (Button, Input, Card)
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── LeagueCard.tsx
│   └── SearchForm.tsx
├── core/
│   └── api/         # Cliente Sleeper API
├── hooks/           # Custom hooks (React Query)
├── store/           # Zustand store
└── App.tsx
```

## 🗺️ Roadmap

### Fase A - Setup Inicial ✅
- [x] React + Vite + TypeScript
- [x] Tailwind CSS
- [x] TanStack Query
- [x] Zustand
- [x] Componentes base
- [x] API Sleeper integrada

### Fase B - Features Core (próximo)
- [ ] Detalhes completos da liga
- [ ] Rosters com jogadores
- [ ] Matchups da semana
- [ ] Power rankings
- [ ] Histórico de temporadas

### Fase C - Features Avançadas
- [ ] Trending players
- [ ] Trade history
- [ ] Draft capital
- [ ] Injury alerts
- [ ] Export data

### Fase D - Mobile & Deploy
- [ ] PWA
- [ ] React Native app
- [ ] Cloudflare Pages deploy
- [ ] CI/CD

## 📝 Licença

Desenvolvido por **Lucio**, programado por **Claude**

## 🔗 Links

- [Sleeper API Docs](https://docs.sleeper.com/)
- [Roadmap Completo](./docs/roadmap-completo.md)
