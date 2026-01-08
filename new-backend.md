# Migracão do Backend: Python para Cloudflare Workers

## Resumo

Migramos o backend da API de stats NFL de **Python/FastAPI** para **Cloudflare Workers (TypeScript)** para ter tudo em uma única plataforma (Cloudflare) e eliminar custos de hospedagem.

**Status: COMPLETO**

---

## Por que migrar?

### Problema Original

| Componente | Tecnologia | Hospedagem | Custo |
|------------|------------|------------|-------|
| Frontend | React/TypeScript | Cloudflare Pages | Gratis |
| Backend | Python/FastAPI | Nao deployed | - |

O backend Python precisaria de hospedagem separada (Railway ~$5/mes) porque:
- GitHub Pages e Cloudflare Pages so servem arquivos estaticos
- Python nao roda em ambiente serverless tradicional

### Solucao: Cloudflare Workers

| Componente | Tecnologia | Hospedagem | Custo |
|------------|------------|------------|-------|
| Frontend | React/TypeScript | Cloudflare Pages | Gratis |
| Backend | TypeScript | Cloudflare Workers | Gratis* |

*100.000 requests/dia no plano gratuito

### Beneficios

1. **Tudo no Cloudflare** - Uma conta, um dashboard
2. **Gratis** - 100k requests/dia e muito para uso pessoal
3. **Edge Computing** - API roda em servidores globais (baixa latencia)
4. **Sem servidor** - Nao precisa gerenciar infra
5. **Stack consistente** - TypeScript no frontend e backend

---

## O que foi feito

### 1. Estrutura do Worker

```
workers/nfl-stats-api/
├── src/
│   ├── index.ts           # Handler principal (endpoints)
│   ├── types.ts           # TypeScript types
│   └── sources/
│       └── tank01.ts      # Integracao Tank01 API
├── wrangler.toml          # Configuracao Cloudflare
├── package.json
├── tsconfig.json
└── README.md
```

### 2. Endpoints Implementados

| Metodo | Path | Descricao |
|--------|------|-----------|
| GET | `/` | Health check e info da API |
| GET | `/api/seasons` | Lista de temporadas disponiveis |
| GET | `/api/stats/defense?season=2024` | Stats defensivas |
| GET | `/api/stats/offense?season=2024` | Stats ofensivas |
| POST | `/api/cache/clear` | Limpar cache |

### 3. Recursos Cloudflare Utilizados

- **Workers** - Executa o codigo TypeScript
- **KV (Key-Value)** - Cache persistente para dados da API
- **Secrets** - Armazena a chave da RapidAPI de forma segura

### 4. Deploy Realizado

- **API URL**: https://nfl-stats-api.luciocw.workers.dev
- **Frontend URL**: https://dashboard-frontend-tmg.pages.dev
- **Status**: Funcionando
- **Testado**: Endpoint de defense retornou 780 jogadores

### 5. Frontend Atualizado

- URL da API atualizada em `src/constants/index.ts`
- IDP Explorer funcionando com dados da nova API
- Coluna de projecao mudada de "PROJ" (total) para "PPG" (points per game)

---

## Funcionalidade PPG

A coluna de projecao agora mostra **PPG (Points Per Game)** em vez de pontos totais da temporada.

### Calculo
```
PPG = Total de Pontos / 17 jogos
```

### Exemplo
- Jordyn Brooks: 162.5 pts total → **9.6 PPG**

### Arquivos modificados
- `src/features/idp/utils/projection.ts` - Adicionado calculo de PPG
- `src/features/idp/components/IDPTable.tsx` - Coluna renomeada para PPG
- `src/features/idp/components/IDPPlayerCard.tsx` - Mostra PPG + total
- `src/features/idp/utils/filters.ts` - Ordenacao por PPG

---

## Comandos Uteis

### Desenvolvimento local do Worker
```bash
cd workers/nfl-stats-api
npm run dev
# Acessa em http://localhost:8787
```

### Deploy do Worker
```bash
cd workers/nfl-stats-api
npm run deploy
```

### Deploy do Frontend
```bash
npm run build
npx wrangler pages deploy dist --project-name=dashboard-frontend
```

### Ver logs em tempo real
```bash
cd workers/nfl-stats-api
npm run tail
```

### Adicionar/atualizar secret
```bash
echo "SUA_CHAVE_AQUI" | npx wrangler secret put RAPIDAPI_KEY --config workers/nfl-stats-api/wrangler.toml
```

---

## Arquivos Importantes

| Arquivo | Descricao |
|---------|-----------|
| `workers/nfl-stats-api/wrangler.toml` | Config do Worker (KV IDs, variaveis) |
| `workers/nfl-stats-api/src/index.ts` | Logica principal da API |
| `workers/nfl-stats-api/src/sources/tank01.ts` | Integracao com Tank01 API |
| `src/constants/index.ts` | URL da API no frontend |
| `src/features/idp/utils/projection.ts` | Calculo de PPG |

---

## Comparacao Python vs TypeScript

### Python (antigo)
```python
# backend/main.py
@app.get("/api/stats/defense")
async def defense_stats(season: int = 2024):
    result = await get_defensive_stats(season)
    return result.to_dict()
```

### TypeScript (novo)
```typescript
// workers/nfl-stats-api/src/index.ts
async function handleDefenseStats(request: Request, env: Env): Promise<Response> {
  const players = await getDefensiveStats(season, env, env.CACHE);
  return jsonResponse({ players, count: players.length });
}
```

A logica e a mesma, so mudou a sintaxe e o sistema de cache (arquivos → KV).

---

## Melhorias Futuras (Opcional)

### 1. Adicionar nflverse como fallback

O backend Python usava nflverse (dados historicos) como fallback quando Tank01 falhava. Para adicionar:

1. Os dados sao arquivos `.parquet` (formato binario)
2. Precisaria de uma biblioteca JS para ler parquet
3. Ou um Worker scheduled para pre-processar os dados

### 2. Adicionar games played real

Atualmente o PPG assume 17 jogos. Para ter o numero real de jogos:

1. Verificar se Tank01 API fornece `gamesPlayed`
2. Ou buscar de outra fonte (ESPN, etc)
3. Atualizar o calculo de PPG

---

## Commits Relacionados

| Hash | Descricao |
|------|-----------|
| `5f16953` | feat: change IDP projection from total points to PPG |
| `3a3cd46` | feat: migrate backend to Cloudflare Workers |

---

*Documentacao atualizada em 08/01/2026*
