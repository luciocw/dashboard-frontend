# Stack Tecnológico - Dynasty Dashboard

## Frontend (Next.js App)

| Categoria | Tecnologia | Versão | Uso |
|-----------|------------|--------|-----|
| **Linguagem** | TypeScript | 5.7.2 | Tipagem estática |
| **Framework** | Next.js | 15.1.3 | App Router, SSR/SSG |
| **UI Library** | React | 19.0.0 | Componentes |
| **Styling** | Tailwind CSS | 4.0.0 | Utility-first CSS |
| **CSS** | OKLCH Colors | - | Sistema de cores moderno |
| **CSS** | PostCSS | 8.4.49 | Processamento CSS |
| **State** | Zustand | 5.0.2 | Global state management |
| **Data Fetching** | TanStack Query | 5.17.19 | Cache, mutations, SSR |
| **Icons** | Lucide React | 0.454.0 | Ícones SVG |
| **Utilities** | clsx + tailwind-merge | 2.1.1 / 3.0.1 | Class merging |

---

## Backend Python (FastAPI)

| Categoria | Tecnologia | Versão | Uso |
|-----------|------------|--------|-----|
| **Linguagem** | Python | 3.x | Backend principal |
| **Framework** | FastAPI | ≥0.104.0 | REST API |
| **Server** | Uvicorn | ≥0.24.0 | ASGI server |
| **Data** | Pandas | ≥2.0.0 | Manipulação de dados |
| **Data** | PyArrow | ≥14.0.0 | Parquet files |
| **HTTP** | HTTPX | ≥0.25.0 | Cliente HTTP async |
| **Config** | python-dotenv | ≥1.0.0 | Environment variables |

---

## Backend Edge (Cloudflare Worker)

| Categoria | Tecnologia | Versão | Uso |
|-----------|------------|--------|-----|
| **Linguagem** | TypeScript | 5.3.3 | Tipagem |
| **Runtime** | Cloudflare Workers | - | Edge computing |
| **CLI** | Wrangler | 3.24.0 | Deploy/dev |
| **Types** | @cloudflare/workers-types | 4.x | Tipos KV, D1, etc |

---

## Fontes de Dados Externas

| Fonte | Tipo | Uso |
|-------|------|-----|
| **Sleeper API** | REST | Ligas, rosters, usuários |
| **Tank01 (RapidAPI)** | REST | Stats live de jogadores |
| **nflverse** | Parquet/CSV | Stats históricas (CC-BY-SA 4.0) |

---

## Resumo por Área

| Área | Linguagens |
|------|------------|
| **Frontend** | TypeScript, TSX, CSS (Tailwind/OKLCH) |
| **Backend API** | Python |
| **Backend Edge** | TypeScript |
| **Config** | JSON, TOML (wrangler), ENV |
| **Docs** | Markdown |
