# Arquitetura — Salinha Bíblica

## Decisões principais

### Dados em JSON estático (não fetch)
As 40 dinâmicas são importadas como módulos ES via `import` estático no Vite. Isso garante:
- Bundle único, cache de SW funciona perfeitamente
- Validação Zod em tempo de build
- Zero latência de rede para carregar dinâmicas

Quando o volume crescer (>200 dinâmicas), migrar para carregamento lazy por categoria.

### Persistência em IndexedDB (Dexie)
Favoritos, concluídas, anotações, encontros e settings ficam no dispositivo. Sem autenticação, sem servidor. O backup JSON exportável garante portabilidade.

`src/db/index.ts` exporta helpers por domínio (`favoritesDb`, `completedDb`, etc.) — nunca acesse `db` diretamente nas páginas.

### Estado global mínimo (Zustand)
Apenas filtros de busca ficam no Zustand — estado compartilhado entre `ActivityListPage` e `FilterBar`. Tudo que é local a uma página usa `useState`.

### Rotas
React Router v7 em modo SPA (`createBrowserRouter`). O `Layout` envolve todas as rotas e renderiza o `BottomNavigation`. Rotas de detalhe (`/explorar/:id`) não têm tab ativo — `NavLink end` resolve.

### Schemas como fonte da verdade
`src/schemas/activity.ts` define os Zod schemas. Os tipos TypeScript em `src/types/index.ts` são escritos manualmente (não inferidos do Zod) para manter legibilidade e evitar tipos complexos nos componentes.

## Estrutura de camadas

```
JSON Data → useActivities (import estático + Zod)
         → useSearch (filtros puros, sem efeitos)
         → Páginas (composição de hooks + componentes)

Dexie DB  → helpers (favoritesDb, completedDb, notesDb…)
          → useLocalState (useState + useEffect)
          → Páginas
```

## O que NÃO existe intencionalmente
- Backend, API, autenticação
- Banco de dados remoto
- IA ou chamadas externas
- Rede social ou gamificação
- `dexie-react-hooks` — usa `useEffect` direto para evitar dependência extra
