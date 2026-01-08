# Migracão do Backend: Python para Cloudflare Workers

## Resumo

Estamos migrando o backend da API de stats NFL de **Python/FastAPI** para **Cloudflare Workers (TypeScript)** para ter tudo em uma única plataforma (Cloudflare) e eliminar custos de hospedagem.

---

## Por que migrar?

### Problema Original

| Componente | Tecnologia | Hospedagem | Custo |
|------------|------------|------------|-------|
| Frontend | React/TypeScript | Cloudflare Pages | Grátis |
| Backend | Python/FastAPI | Não deployed | - |

O backend Python precisaria de hospedagem separada (Railway ~$5/mês) porque:
- GitHub Pages e Cloudflare Pages só servem arquivos estáticos
- Python não roda em ambiente serverless tradicional

### Solucão: Cloudflare Workers

| Componente | Tecnologia | Hospedagem | Custo |
|------------|------------|------------|-------|
| Frontend | React/TypeScript | Cloudflare Pages | Grátis |
| Backend | TypeScript | Cloudflare Workers | Grátis* |

*100.000 requests/dia no plano gratuito

### Benefícios

1. **Tudo no Cloudflare** - Uma conta, um dashboard
2. **Grátis** - 100k requests/dia é muito para uso pessoal
3. **Edge Computing** - API roda em servidores globais (baixa latência)
4. **Sem servidor** - Não precisa gerenciar infra
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
│       └── tank01.ts      # Integracão Tank01 API
├── wrangler.toml          # Configuracão Cloudflare
├── package.json
├── tsconfig.json
└── README.md
```

### 2. Endpoints Implementados

| Método | Path | Descricão |
|--------|------|-----------|
| GET | `/` | Health check e info da API |
| GET | `/api/seasons` | Lista de temporadas disponíveis |
| GET | `/api/stats/defense?season=2024` | Stats defensivas |
| GET | `/api/stats/offense?season=2024` | Stats ofensivas |
| POST | `/api/cache/clear` | Limpar cache |

### 3. Recursos Cloudflare Utilizados

- **Workers** - Executa o código TypeScript
- **KV (Key-Value)** - Cache persistente para dados da API
- **Secrets** - Armazena a chave da RapidAPI de forma segura

### 4. Deploy Realizado

- **URL**: https://nfl-stats-api.luciocw.workers.dev
- **Status**: Funcionando
- **Testado**: Endpoint de defense retornou 780 jogadores

---

## O que ainda falta fazer

### 1. Atualizar o Frontend

Modificar o arquivo `src/features/idp/constants.ts` ou `src/constants/index.ts` para usar a nova URL:

```typescript
// De:
export const IDP_API_URL = import.meta.env.VITE_IDP_API_URL || 'https://api.dynastydashboard.com'

// Para:
export const IDP_API_URL = import.meta.env.VITE_IDP_API_URL || 'https://nfl-stats-api.luciocw.workers.dev'
```

### 2. Testar IDP Explorer

Após atualizar o frontend:
1. Rodar `npm run build`
2. Fazer deploy no Cloudflare Pages
3. Testar o IDP Explorer no site de producão

### 3. (Opcional) Adicionar nflverse como fallback

O backend Python usava nflverse (dados históricos) como fallback quando Tank01 falhava. Por enquanto, só implementamos Tank01. Para adicionar nflverse:

1. Os dados são arquivos `.parquet` (formato binário)
2. Precisaria de uma biblioteca JS para ler parquet
3. Ou um Worker scheduled para pré-processar os dados

---

## Comandos Úteis

### Desenvolvimento local
```bash
cd workers/nfl-stats-api
npm run dev
# Acessa em http://localhost:8787
```

### Deploy
```bash
cd workers/nfl-stats-api
npm run deploy
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

| Arquivo | Descricão |
|---------|-----------|
| `workers/nfl-stats-api/wrangler.toml` | Config do Worker (KV IDs, variáveis) |
| `workers/nfl-stats-api/src/index.ts` | Lógica principal da API |
| `workers/nfl-stats-api/src/sources/tank01.ts` | Integracão com Tank01 API |
| `src/constants/index.ts` | URL da API no frontend |

---

## Comparacão Python vs TypeScript

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

A lógica é a mesma, só mudou a sintaxe e o sistema de cache (arquivos → KV).

---

## Próximos Passos para Continuar

1. **Abrir o projeto**: `cd /Users/luciocw/Desktop/Fantasy/Fantasy-Frontend`

2. **Atualizar a URL da API no frontend**:
   - Arquivo: `src/constants/index.ts`
   - Trocar `https://api.dynastydashboard.com` por `https://nfl-stats-api.luciocw.workers.dev`

3. **Build e deploy**:
   ```bash
   npm run build
   npx wrangler pages deploy dist
   ```

4. **Testar** no site de producão

---

*Documentacão criada em 08/01/2026*
