# 🔧 Cronograma de Correções - Dynasty Dashboard

> Criado: 06/01/2026
> Status: Em Andamento

---

## FASE 1: Performance (Crítico) - 6h estimadas

### 1.1 Corrigir N+1 Queries ⏳
- [ ] Elevar usePlayers() para Home.tsx (buscar 1x só)
- [ ] Passar players via props para LeagueCard
- [ ] Remover usePlayers() de dentro do LeagueCard
- **Responsável:** Claude
- **Tempo:** 2h

### 1.2 Otimizar Busca de Rosters ⏳
- [ ] Criar hook useAllMyRosters() que busca todos de uma vez
- [ ] Buscar rosters em paralelo com Promise.all
- [ ] Cachear resultado
- **Responsável:** Claude
- **Tempo:** 2h

### 1.3 Adicionar React.memo ⏳
- [ ] LeagueCard com memo
- [ ] PlayerCard com memo
- [ ] StatCard com memo
- **Responsável:** Claude
- **Tempo:** 1h

### 1.4 Lazy Loading de Imagens ⏳
- [ ] Adicionar loading="lazy" em todas imagens
- **Responsável:** Claude
- **Tempo:** 0.5h

---

## FASE 2: TypeScript (Alta) - 2h estimadas

### 2.1 Remover Record<string, any> ⏳
- [ ] Criar tipo PlayersMap exportado
- [ ] Usar em LeagueCard.tsx
- [ ] Usar em RosterView.tsx
- **Responsável:** Claude
- **Tempo:** 1h

### 2.2 Unificar Tipo User ⏳
- [ ] Remover interface User duplicada do store
- [ ] Usar SleeperUser do types/sleeper.ts
- **Responsável:** Claude
- **Tempo:** 0.5h

### 2.3 Criar ApiError Type ⏳
- [ ] Criar src/utils/errors.ts
- [ ] Implementar classe ApiError
- [ ] Usar nos hooks
- **Responsável:** Claude
- **Tempo:** 0.5h

---

## FASE 3: Segurança (Média) - 1h estimada

### 3.1 Validação de Input ⏳
- [ ] Validar username (3-25 chars, alfanumérico)
- [ ] Mostrar mensagem de erro específica
- [ ] Sanitizar input
- **Responsável:** Claude
- **Tempo:** 1h

---

## FASE 4: Tratamento de Erros (Média) - 3h estimadas

### 4.1 Error States em Componentes ⏳
- [ ] Adicionar error state no LeagueCard
- [ ] Mostrar erro se usePlayers falhar
- [ ] Adicionar retry em erros de rede
- **Responsável:** Claude
- **Tempo:** 2h

### 4.2 Verificar Conexão ⏳
- [ ] Checar navigator.onLine antes de requests
- [ ] Mostrar mensagem offline
- **Responsável:** Claude
- **Tempo:** 1h

---

## FASE 5: UX/Acessibilidade (Média) - 4h estimadas

### 5.1 Skeleton Loaders ⏳
- [ ] Criar SkeletonCard para LeagueCard
- [ ] Criar SkeletonTable para Standings
- [ ] Usar durante loading
- **Responsável:** Claude
- **Tempo:** 2h

### 5.2 Acessibilidade Básica ⏳
- [ ] Adicionar aria-labels em botões
- [ ] Adicionar role="button" em cards clicáveis
- [ ] Adicionar tabIndex para navegação
- [ ] Focus visible em elementos interativos
- **Responsável:** Claude
- **Tempo:** 2h

---

## FASE 6: Organização de Código (Baixa) - 2h estimadas

### 6.1 Criar Constants ⏳
- [ ] Criar src/constants/index.ts
- [ ] Mover CACHE_TIMES
- [ ] Mover POSITION_COLORS
- [ ] Mover API_URL
- **Responsável:** Claude
- **Tempo:** 1h

### 6.2 Extrair Funções para Utils ⏳
- [ ] Mover getLeagueTags para utils/league.ts
- [ ] Mover formatLineup para utils/league.ts
- [ ] Mover countByPosition para utils/roster.ts
- [ ] Mover calculateAvgAge para utils/roster.ts
- **Responsável:** Claude
- **Tempo:** 1h

### 6.3 Limpar Pasta Core ⏳
- [ ] Verificar se core/ é usado
- [ ] Remover se não for
- **Responsável:** Claude
- **Tempo:** 0.5h

---

## FASE 7: Documentação (Baixa) - 2h estimadas

### 7.1 JSDoc nos Hooks ⏳
- [ ] Documentar useSleeperUser
- [ ] Documentar useSleeperLeagues
- [ ] Documentar useLeagueData
- [ ] Documentar usePlayers
- [ ] Documentar useMyRoster
- **Responsável:** Claude
- **Tempo:** 1.5h

### 7.2 Atualizar README ⏳
- [ ] Adicionar seção de arquitetura
- [ ] Adicionar instruções de desenvolvimento
- **Responsável:** Claude
- **Tempo:** 0.5h

---

## FASE 8: Testes (Alta, mas posterior) - 8h estimadas

### 8.1 Setup de Testes ⏳
- [ ] Instalar Vitest + Testing Library
- [ ] Configurar vitest.config.ts
- [ ] Criar script de teste
- **Responsável:** Lucio (terminal) + Claude (código)
- **Tempo:** 1h

### 8.2 Testes de Hooks ⏳
- [ ] Testar useSleeperUser
- [ ] Testar usePlayers
- [ ] Testar useAppStore
- **Responsável:** Claude
- **Tempo:** 3h

### 8.3 Testes de Componentes ⏳
- [ ] Testar LeagueCard
- [ ] Testar PlayerCard
- [ ] Testar Home (básico)
- **Responsável:** Claude
- **Tempo:** 4h

---

## 📊 PROGRESSO GERAL

| Fase | Status | Progresso |
|------|--------|-----------|
| Fase 1: Performance | ⏳ Aguardando | 0% |
| Fase 2: TypeScript | ⏳ Aguardando | 0% |
| Fase 3: Segurança | ⏳ Aguardando | 0% |
| Fase 4: Erros | ⏳ Aguardando | 0% |
| Fase 5: UX | ⏳ Aguardando | 0% |
| Fase 6: Organização | ⏳ Aguardando | 0% |
| Fase 7: Documentação | ⏳ Aguardando | 0% |
| Fase 8: Testes | ⏳ Aguardando | 0% |

**Total Estimado:** 28 horas
**Progresso Total:** 0%

---

## 📝 LOG DE EXECUÇÃO

### 06/01/2026
- Criado cronograma de correções
- Aguardando início da Fase 1

