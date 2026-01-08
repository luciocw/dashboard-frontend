# 🏈 Dynasty Dashboard - Roadmap

> Última atualização: 08/01/2026

---

## ✅ FASE A - Setup (COMPLETA)
- [x] Projeto React + TypeScript + Vite
- [x] Tailwind CSS configurado
- [x] React Router
- [x] TanStack Query
- [x] Zustand store

## ✅ FASE B - Infraestrutura (COMPLETA)
- [x] Hooks para Sleeper API
- [x] Cache otimizado
- [x] Tratamento de erros
- [x] Persistência de sessão

## ✅ FASE C - Features FREE (COMPLETA)
- [x] Login com username Sleeper
- [x] Listagem de ligas por temporada
- [x] Cards ricos (tags, lineup, idade média)
- [x] Meu Roster (agrupado por posição)
- [x] Classificação (Standings)
- [x] Draft Picks (cards + roster)
- [x] Histórico de Títulos (modal clicável)
- [x] Matchups da Semana
- [x] Trade History
- [x] Power Rankings
- [x] HUD de estatísticas (Ligas, Dynasty, Record, Títulos)

## ✅ FASE D - Qualidade (COMPLETA)
- [x] Auditoria técnica (8 fases)
- [x] Performance (N+1 corrigido, React.memo, lazy loading)
- [x] TypeScript strict (zero `any`)
- [x] Segurança (validação de input)
- [x] Tratamento de erros (offline detection, retry)
- [x] UX/Acessibilidade (skeleton loaders, ARIA, keyboard nav)
- [x] Organização (constants, utils)
- [x] Documentação (JSDoc)
- [x] Testes (24 testes passando)

## ✅ FASE E - Deploy (COMPLETA)
- [x] Build de produção
- [x] Deploy Cloudflare Pages
- [x] URL: https://dashboard-frontend-tmg.pages.dev

## ✅ FASE F - IDP Explorer (COMPLETA)
- [x] Nova tab "IDP" dentro de cada liga
- [x] Integração ESPN API (stats temporada 2025)
- [x] Filtros por posição (DL, LB, DB)
- [x] Filtros por stats mínimas (tackles, sacks, TFL)
- [x] Filtros rápidos (Mike LB, Pass Rushers, Box Safeties)
- [x] Badge "Já tenho" (integração Sleeper roster)
- [x] Projeção de pontos baseada no scoring_settings da liga
- [x] Card detalhado com breakdown da projeção
- [x] Colunas: TKL, SCK, TFL, PD, INT, FF, Proj
- [x] Feature premium (gate com isPremiumUser)

---

## 🔄 PRÓXIMAS FASES

### FASE G - Mobile Optimization
- [ ] Testes em dispositivos reais
- [ ] Safe area support (notch)
- [ ] Touch targets (44px mínimo)
- [ ] Swipe gestures
- [ ] PWA (Progressive Web App)

### FASE H - Features Avançadas FREE
- [ ] Waiver Wire / Free Agents
- [ ] Injury Report (lesões dos jogadores)
- [ ] Projeções da semana
- [ ] Notificações de matchup

### FASE I - Premium ($4.99/mês)
- [ ] Ver TODOS os rosters (não só o seu)
- [ ] Comparar rosters lado a lado
- [ ] Trade Calculator / Analyzer
- [ ] Alertas de lesões
- [ ] Export avançado (CSV, PDF)
- [ ] Start/Sit advice
- [ ] Alvos (expandir IDP para todos jogadores: QB, RB, WR, TE, K)
- [ ] Projeção multi-temporada (ajuda em trades)
- [ ] Status waiver/time (mostrar se disponível)

### FASE J - Expansão
- [ ] App iOS (React Native ou PWA)
- [ ] App Android
- [ ] Internacionalização (PT, EN, ES)
- [ ] Dark/Light mode toggle

---

## 📊 Métricas Atuais

- **Testes:** 24 passando
- **Build:** ~357 KB (gzip: ~106 KB)
- **TypeScript:** 0 erros, 0 `any`
- **ESLint:** 0 erros, 0 warnings
- **Cobertura:** ~4% (3 arquivos de teste)
- **Acessibilidade:** ARIA labels + alt em imagens

---

## 🔗 Links

- **Produção:** https://dashboard-frontend-tmg.pages.dev
- **GitHub:** https://github.com/luciocw/dashboard-frontend
- **Sleeper API:** https://api.sleeper.app/v1
