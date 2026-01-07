# 🏈 Dynasty Dashboard - Contexto para Continuação

> Última atualização: 06/01/2026
> Para usar em nova conversa com Claude

## 📁 Localização do Projeto

Caminho: /Users/luciocw/Desktop/Fantasy/Fantasy-Frontend

## 🔗 Links Importantes

Produção: https://dashboard-frontend.luciocw.workers.dev/
GitHub: https://github.com/luciocw/dashboard-frontend
Sleeper API: https://api.sleeper.app/v1

## 🛠️ Stack Técnica

React 18 + TypeScript 5 (strict), Vite 5, Tailwind CSS 3, Zustand (estado global), TanStack Query (cache/fetch), React Router 6, Vitest (testes), Deploy via Cloudflare Workers

## 📊 Status: 75% Completo

### ✅ CONCLUÍDO

Funcionalidades: Login com username Sleeper (persistido), listagem de ligas por temporada, HUD de estatísticas, cards ricos (tags, lineup, roster info, idade média), classificação (Standings), Meu Roster (agrupado por posição), skeleton loaders, tratamento de erros + offline banner.

Auditoria Técnica (8 fases completas): Performance (N+1 corrigido, React.memo, lazy loading), TypeScript (zero any, tipos centralizados), Segurança (validação de input), Tratamento de Erros (ApiError, ErrorCard), UX/Acessibilidade (aria-labels, focus, keyboard nav), Organização (constants, utils extraídos), Documentação (JSDoc em hooks), Testes (24 testes passando).

### 🔄 PENDENTE - Features FREE

1. Draft Picks - mostrar picks no card
2. Histórico de Títulos - winners de cada temporada
3. Matchups da Semana - confrontos atuais
4. Trade History - últimas trades da liga
5. Power Rankings - ranking por performance

### ⏳ FUTURO - Premium ($4.99/mês)

Ver TODOS os rosters (não só o seu), comparar rosters, trade analyzer, alertas de lesões, export avançado.

## 📂 Estrutura do Projeto

src/components/ui/ - Badge, StatCard, SkeletonCard, SkeletonTable, ErrorCard
src/components/ - LeagueCard, PlayerCard, RosterView, Footer, OfflineBanner, ErrorBoundary
src/hooks/ - useSleeperUser, usePlayers, useAllMyRosters, useOnlineStatus, useMyRoster
src/pages/ - Home, LeagueDetails
src/store/ - useAppStore
src/types/ - sleeper.ts
src/utils/ - validation, errors, league, roster, standings, nfl
src/constants/ - index.ts (API_URL, CACHE_TIMES, POSITION_COLORS, POSITION_ORDER)
src/test/ - setup.ts, *.test.ts

## 🧪 Comandos Úteis

npm run dev (desenvolvimento)
npm test (testes)
npm run type-check (verificar tipos)
npm run build (build produção)
git push (deploy automático)

## 📝 Próxima Feature Sugerida

Draft Picks - Adicionar picks no LeagueCard e criar seção no RosterView
API Sleeper: GET /league/{league_id}/traded_picks e GET /league/{league_id}/drafts

## 🎯 Instruções para Claude

1. Projeto em /Users/luciocw/Desktop/Fantasy/Fantasy-Frontend
2. Sempre rodar npm run dev para testar
3. Commitar após cada feature completa
4. Deploy automático via git push
5. Ver ROADMAP.md para histórico completo
