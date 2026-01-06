# 🚀 Roadmap de Implementação: Fases Práticas

## **IMPLEMENTAÇÃO FASE A: Setup Inicial** (Dias 1-2)

### **A.1 Criar Repositório GitHub**
```bash
git init dynasty-dashboard
cd dynasty-dashboard
git add .
git commit -m "Initial commit"
gh repo create dynasty-dashboard --public --push
```

### **A.2 Configurar Cloudflare**
- Criar conta
- Gerar API token
- Conectar repositório
- Configurar domínio

### **A.3 Stack Definido**
- ✅ React 18 + Vite
- ✅ Zustand
- ✅ TanStack Query
- ✅ shadcn/ui + Tailwind
- ✅ Vitest

---

## **IMPLEMENTAÇÃO FASE B: Migração** (Dias 3-7)

### **B.1 Branch**
```bash
git checkout -b feat/react-migration
```

### **B.2 Setup**
```bash
npm create vite@latest . -- --template react-ts
npm install @tanstack/react-query zustand
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### **B.3 Ordem de Conversão**
1. Core API
2. Cache
3. Estado
4. UI Components
5. Features

---

## **IMPLEMENTAÇÃO FASE C: Workers** (Dias 8-10)

### **C.1 Criar Worker**
```bash
wrangler init sleeper-proxy
```

### **C.2 Proxy com Cache**
```javascript
export default {
  async fetch(request, env, ctx) {
    const cache = caches.default;
    let response = await cache.match(request);
    
    if (!response) {
      response = await fetch(request);
      ctx.waitUntil(cache.put(request, response.clone()));
    }
    
    return response;
  }
}
```

---

## **IMPLEMENTAÇÃO FASE D: Auth** (Dias 11-14)

### **D.1 Supabase**
```bash
npm install @supabase/supabase-js
```

### **D.2 Schema**
```sql
create table users (
  id uuid primary key,
  sleeper_username text unique,
  tier text default 'free',
  stripe_customer_id text
);
```

### **D.3 Stripe**
```bash
npm install @stripe/stripe-js stripe
```

---

## **IMPLEMENTAÇÃO FASE E: Deploy** (Dias 15-17)

### **E.1 CI/CD**
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm test
      - run: npm run build
```

### **E.2 Deploy**
```bash
wrangler pages deploy dist --project-name=dynasty-staging
```

---

## **Checklist Pré-Desenvolvimento**

- [ ] Zustand ou Jotai?
- [ ] Estrutura de pastas
- [ ] shadcn/ui ou custom?
- [ ] Conventional Commits
- [ ] ESLint + Prettier
- [ ] Template de PR

---

## **Cronograma**
```
Semana 1: A + B
├─ Dia 1-2: Setup
├─ Dia 3-4: Vite + React
└─ Dia 5-7: Primeiro componente

Semana 2: C + D
├─ Dia 8-10: Workers
├─ Dia 11-12: Supabase
└─ Dia 13-14: Stripe

Semana 3: E
├─ Dia 15-16: CI/CD
└─ Dia 17: Testes
```

