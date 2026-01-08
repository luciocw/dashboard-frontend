# NFL Stats API - Cloudflare Worker

API para estatísticas de jogadores NFL, rodando em Cloudflare Workers.

## Endpoints

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/` | Health check e info da API |
| GET | `/api/seasons` | Lista de temporadas disponíveis |
| GET | `/api/stats/defense?season=2024` | Stats defensivas |
| GET | `/api/stats/offense?season=2024` | Stats ofensivas |
| POST | `/api/cache/clear` | Limpar cache |

## Setup

### 1. Criar KV Namespace

```bash
# Criar namespace de produção
npx wrangler kv:namespace create "CACHE"

# Criar namespace de preview (para dev)
npx wrangler kv:namespace create "CACHE" --preview
```

Copie os IDs gerados e atualize o `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "SEU_ID_AQUI"
preview_id = "SEU_PREVIEW_ID_AQUI"
```

### 2. Configurar API Key

```bash
# Adicionar secret da RapidAPI
npx wrangler secret put RAPIDAPI_KEY
# Cole sua key quando solicitado
```

### 3. Desenvolvimento Local

```bash
npm run dev
```

Acesse: http://localhost:8787

### 4. Deploy

```bash
npm run deploy
```

## Estrutura

```
src/
├── index.ts          # Handler principal
├── types.ts          # TypeScript types
└── sources/
    └── tank01.ts     # Tank01 API integration
```

## Fonte de Dados

- **Tank01 API** (RapidAPI) - Dados em tempo real
  - Requer assinatura RapidAPI
  - TTL do cache: 1 hora

## Variáveis de Ambiente

| Variável | Descrição | Default |
|----------|-----------|---------|
| `RAPIDAPI_KEY` | Chave da RapidAPI (secret) | - |
| `PRIMARY_SOURCE` | Fonte primária | `tank01` |
| `CACHE_TTL_TANK01` | TTL cache Tank01 (segundos) | `3600` |
| `DEBUG` | Modo debug | `false` |
