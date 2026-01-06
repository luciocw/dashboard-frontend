# 🏗️ Roadmap Completo: Dynasty Dashboard → Produto Escalável

## **Visão Geral do Projeto**

Transformar o Dynasty Dashboard de um HTML standalone em uma aplicação profissional multi-plataforma (Web + iOS/Android) com modelo freemium.

---

## ⚠️ **ADENDO CRÍTICO: API SLEEPER**

### **Importância Fundamental**
A **API Sleeper** é a espinha dorsal de TODA a aplicação. Sem ela, não há dados, não há dashboard, não há produto. Cada decisão técnica DEVE considerar:

1. **Rate Limits**: 100 requisições/minuto por IP
2. **Sem autenticação**: API pública, não requer tokens
3. **Cache obrigatório**: Respeitar TTL recomendado de 4-6 horas
4. **Endpoints críticos**:
   - `/user/{username}` - Busca de usuário
   - `/user/{user_id}/leagues/nfl/{season}` - Ligas do usuário
   - `/league/{league_id}/rosters` - Rosters da liga
   - `/league/{league_id}/matchups/{week}` - Matchups da semana
   - `/players/nfl` - Base de jogadores (38MB JSON!)

### **Estratégias de Proteção**

#### **Camada 1: Client-side Cache (Browser)**
```javascript
// localStorage com TTL
{
  "user:luciocw": {
    "data": {...},
    "timestamp": 1704326400000,
    "ttl": 14400000 // 4 horas
  }
}
```

#### **Camada 2: Cloudflare Edge Cache**
```javascript
// workers/sleeper-proxy/index.js
const cache = caches.default;
const cacheKey = new Request(url, {method: 'GET'});
let response = await cache.match(cacheKey);

if (!response) {
  response = await fetch(sleeperUrl);
  const headers = {'Cache-Control': 'public, s-maxage=3600'};
  response = new Response(response.body, {headers});
  ctx.waitUntil(cache.put(cacheKey, response.clone()));
}
```

#### **Camada 3: Rate Limiting (Server)**
```javascript
// Durable Objects para rate limiting por IP
export class RateLimiter {
  async fetch(request) {
    const ip = request.headers.get('CF-Connecting-IP');
    const count = await this.state.storage.get(ip) || 0;
    
    if (count >= 100) {
      return new Response('Rate limit exceeded', {status: 429});
    }
    
    await this.state.storage.put(ip, count + 1, {
      expirationTtl: 60 // 1 minuto
    });
    
    return new Response('OK');
  }
}
```

#### **Camada 4: Batching de Requisições**
```javascript
// Não fazer:
for (const league of leagues) {
  await fetch(`/league/${league.id}/rosters`); // 10 ligas = 10 requests
}

// Fazer:
const batches = chunk(leagues, 4); // 4 por vez
for (const batch of batches) {
  await Promise.all(batch.map(l => fetch(`/league/${l.id}/rosters`)));
  await sleep(250); // Pausa entre batches
}
```

### **Monitoramento Obrigatório**
```javascript
// Telemetria de uso da API
{
  "endpoint": "/user/luciocw/leagues/nfl/2024",
  "timestamp": "2024-01-03T23:00:00Z",
  "cache_hit": true,
  "response_time_ms": 45,
  "status": 200
}
```

### **Fallback Strategies**

1. **Stale-While-Revalidate**: Serve cache expirado enquanto busca novo
2. **Circuit Breaker**: Após 5 erros consecutivos, usar apenas cache
3. **Graceful Degradation**: Mostrar dados parciais se API falhar

---

## **FASE 0: Fundação & Infraestrutura** (Semana 1-2)

### **0.1 Configuração do Repositório GitHub**
```bash
dynasty-dashboard/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── deploy-staging.yml
│   │   └── deploy-prod.yml
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
├── src/
│   ├── web/
│   ├── mobile/
│   └── shared/
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

**Configurações GitHub obrigatórias:**
- ✅ Branch protection rules (main/develop)
- ✅ Require PR reviews (mínimo 1)
- ✅ Status checks obrigatórios (CI/CD)
- ✅ Dependabot para security updates
- ✅ Secrets configurados

### **0.2 Cloudflare Pages: Decisão Final**

**✅ Cloudflare Pages + Workers + R2 é a escolha certa porque:**

| Critério | Cloudflare | Vercel | Netlify |
|----------|------------|--------|---------|
| Free tier | Ilimitado | 100 GB-hours/mês | 300 min/mês |
| CDN | 275+ cidades | ~70 | ~100 |
| DDoS | ✅ Grátis | ❌ Pago | ❌ Pago |
| Edge functions | ✅ Workers | ✅ Edge | ✅ Edge |
| Analytics | ✅ Grátis | ❌ Pago | ❌ Pago |

**Setup:**
```bash
npm install -g wrangler
wrangler login
wrangler pages project create dynasty-dashboard
```

**Estrutura de ambientes:**
- `main` → `dashboard.sleeperdynasty.com`
- `develop` → `staging.sleeperdynasty.com`
- Feature branches → `feat-*.pages.dev`

### **0.3 Estratégia de Monetização**

**Tier FREE:**
- ✅ Até 3 ligas
- ✅ Stats básicas
- ✅ Matchups semana atual
- ❌ Histórico de trades
- ❌ Export

**Tier PRO ($4.99/mês):**
- ✅ Ligas ilimitadas
- ✅ Histórico completo
- ✅ Trending players
- ✅ Export CSV/JSON/PDF
- ✅ Sync cross-device
- ✅ Push notifications

**Stack:**
```
Stripe Checkout → Cloudflare Workers → Supabase (user tiers)
```

---

## **FASE 1: Modularização** (Semana 3-4)

### **1.1 Arquitetura**
```
src/web/
├── core/
│   ├── api/
│   │   ├── sleeper.js
│   │   ├── cache.js
│   │   └── rateLimiter.js
│   ├── auth/
│   └── state/
├── features/
│   ├── leagues/
│   ├── matchups/
│   ├── trending/ # 🔒 PRO
│   └── export/ # 🔒 PRO
├── components/ui/
└── utils/
```

### **1.2 Stack Tecnológico**
```json
{
  "framework": "React 18 + Vite",
  "state": "Zustand",
  "data-fetching": "TanStack Query v5",
  "ui": "shadcn/ui + Tailwind",
  "forms": "React Hook Form + Zod",
  "routing": "TanStack Router",
  "i18n": "i18next",
  "testing": "Vitest + Playwright"
}
```

---

## **FASE 2: Segurança** (Semana 5)

### **2.1 Content Security Policy**
```javascript
const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'wasm-unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https://sleepercdn.com data:",
    "connect-src 'self' https://api.sleeper.app",
    "frame-ancestors 'none'",
  ].join('; '),
};
```

### **2.2 XSS Protection**
```javascript
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(dirty) {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href'],
  });
}
```

---

## **FASE 3: Mobile** (Semana 6-8)

### **3.1 React Native + Expo**
```
src/
├── shared/ (70% código compartilhado)
├── web/ (15%)
└── mobile/ (15%)
```

**Features mobile-first:**
- Push notifications
- Offline-first (SQLite)
- Biometric auth
- Widgets iOS 14+

---

## **FASE 4: Deploy** (Semana 9)
```yaml
# .github/workflows/deploy-prod.yml
on:
  push:
    branches: [main]
jobs:
  deploy:
    steps:
      - run: npm ci
      - run: npm test
      - uses: cloudflare/pages-action@v1
```

---

## **FASE 5: Lançamento** (Semana 10+)

### **Timeline:**
- Semana 1-2: Beta fechado (50 usuários)
- Semana 3-4: Beta aberto
- Semana 5-6: Public launch (Product Hunt)

### **Custos (6 meses):**
```
Cloudflare: $0
Supabase: $0-25/mês
Stripe: 2.9% + $0.30
Apple Dev: $99/ano
Google Play: $25
Total: ~$160 + variável
```

### **Break-even (100 usuários PRO):**
```
Receita: $499/mês
Custos: $50/mês
Lucro: $450/mês
```

---

## **Estimativas**

**Timeline conservador:**
- Modularização: 2-3 semanas
- Mobile MVP: 4-6 semanas
- Beta: 10-12 semanas
- Public: 14-16 semanas

---

**Fim do Roadmap Completo**

