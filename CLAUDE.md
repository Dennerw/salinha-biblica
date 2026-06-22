# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é este projeto

**Salinha Bíblica** — PWA mobile-first de dinâmicas bíblicas para professores do ministério infantil evangélico. Permite encontrar, filtrar, favoritar e planejar atividades para crianças de 3 a 14 anos.

O plano completo está em `/root/atividasprasalinha/PLANO_DINAMICAS_INFANTIS_EVANGELICAS.md`.

---

## Comandos

```bash
npm run dev          # servidor de desenvolvimento (Vite)
npm run build        # build de produção (tsc + vite build)
npm run lint         # ESLint
npm run format       # Prettier em src/**
npm test             # Vitest (modo run, sem watch)
npm run test:watch   # Vitest em modo interativo
npm run test:e2e     # Playwright
```

---

## Stack

| Camada | Tecnologia |
|---|---|
| UI | React 19 + TypeScript strict |
| Bundler | Vite 8 |
| Estilo | Tailwind CSS 3 (tema customizado) |
| Roteamento | React Router v7 |
| Validação | Zod |
| Estado global | Zustand |
| Persistência local | Dexie (IndexedDB) |
| Testes unitários | Vitest + Testing Library |
| Testes E2E | Playwright |
| PWA | vite-plugin-pwa |

---

## Estrutura de pastas

```
src/
├── app/                   # Router + Layout raiz (App.tsx, main.tsx)
├── components/            # Componentes reutilizáveis (ver abaixo)
├── features/
│   ├── home/              # Tela inicial (categorias + busca rápida)
│   ├── activities/        # Lista, detalhe e filtros de dinâmicas
│   ├── planner/           # Montador de encontro
│   ├── favorites/         # Favoritos (rota dentro de /explorar)
│   ├── progress/          # Progresso por categoria
│   └── settings/          # Perfil do professor e backup
├── data/
│   ├── categories.json    # 8 categorias
│   └── activities/        # 8 arquivos JSON, 5 dinâmicas cada (40 total)
├── db/                    # Dexie: SalinhaDB + helpers por domínio
├── hooks/                 # Hooks customizados (useActivities, useSearch, etc.)
├── schemas/               # Zod schemas (ActivitySchema, CategorySchema)
├── store/                 # Zustand: useFiltersStore
├── types/                 # Interfaces TypeScript (Activity, Category, LessonPlan…)
├── utils/                 # normalize.ts, backup.ts
└── test/                  # setup.ts (jest-dom)
```

---

## Rotas

```
/                  → Home (categorias + busca)
/explorar          → ActivityList (todas as dinâmicas, com filtros)
/explorar/:id      → ActivityDetail (detalhe completo)
/planejar          → LessonPlanner (montador de encontro)
/encontros         → MyLessons (encontros salvos)
/progresso         → Progress (por categoria)
/configuracoes     → Settings (perfil + backup)
```

---

## Componentes (`src/components/`)

| Componente | Props principais |
|---|---|
| `Badge` | `variant`: type/duration/difficulty/age/neutral |
| `EmptyState` | `icon`, `title`, `description`, `action` |
| `SearchInput` | `value`, `onChange`, `placeholder` |
| `AppHeader` | `title`, `subtitle`, `showBack`, `action` |
| `BottomNavigation` | sem props — usa `NavLink` internamente |
| `CategoryCard` | `category`, `count`, `completed`, `onClick` |
| `ActivityCard` | `activity`, `index`, `isFavorite`, `isCompleted`, `onToggleFavorite`, `onToggleCompleted`, `onClick` |

Todos exportados pelo barrel `src/components/index.ts`.

---

## Schema de uma dinâmica (`src/types/index.ts`)

```ts
interface Activity {
  id: string
  title: string
  summary: string
  category: string               // id da categoria
  themes: string[]
  ageGroups: AgeGroup[]          // '3-5' | '6-8' | '9-11' | '12-14'
  groupSize: GroupSize[]         // '1-5' | '6-10' | '11-20' | '21+'
  type: ActivityType             // jogo | reflexao | arte | teatro | musica | experimento | oracao | quebra-gelo
  durationMinutes: number
  difficulty: Difficulty         // facil | medio | avancado
  environment: Environment[]     // sala | salao | externo | qualquer
  energyLevel: EnergyLevel       // calmo | moderado | agitado
  bibleReference: string
  mainTruth: string
  objective: string
  materials: string[]            // vazio = sem materiais
  preparation: string[]
  steps: string[]
  discussionQuestions: string[]
  prayerSuggestion: string
  memoryVerse: string
  safetyNotes: string[]
  youngerAdaptation?: string
  olderAdaptation?: string
  noMaterialsAlternative?: string
  tags: string[]
  status: ActivityStatus         // aprovado | rascunho | revisao-pedagogica | revisao-biblica | arquivado
}
```

---

## Banco local (`src/db/index.ts`)

Instância única: `db` (SalinhaDB — Dexie). Helpers:

| Helper | Métodos principais |
|---|---|
| `favoritesDb` | `getAll()`, `toggle(id)`, `isFavorite(id)` |
| `completedDb` | `getAll()`, `toggle(id)`, `isCompleted(id)` |
| `notesDb` | `get(id)`, `save(id, text)`, `getAll()` |
| `lessonsDb` | `getAll()`, `save(lesson)`, `delete(id)`, `markCompleted(id)` |
| `settingsDb` | `get()`, `save(partial)` |
| `backupDb` | `export()`, `import(data)` — usa transação atômica |

---

## Estado global (`src/store/index.ts`)

`useFiltersStore` (Zustand):

```ts
filters: Filters          // { search, ageGroups, types, maxDuration, environments, energyLevels, noMaterialsOnly }
setSearch(search)
toggleAgeGroup(age)
toggleType(type)
setMaxDuration(max)
toggleEnvironment(env)
toggleEnergyLevel(level)
toggleNoMaterials()
resetFilters()
hasActiveFilters()        // boolean — para mostrar badge de filtro ativo
```

---

## Tema Tailwind (`tailwind.config.ts`)

Cores customizadas:
- `primary`: azul (#3B82F6) — cor principal
- `secondary`: verde (#22C55E) — concluídas/sucesso
- `accent`: amarelo (#FACC15) — destaques/favoritos
- `warm`: laranja (#FB923C) — avisos/energia
- `surface`: `#F0F9FF` — background da app

Classes utilitárias:
- `.page-container` — wrapper de página mobile (max-w-lg, pb-20)
- `.card` — card branco com sombra e borda sutil
- `.btn-primary` / `.btn-secondary` — botões
- `.filter-chip` / `.filter-chip-active` — chips de filtro

---

## Conteúdo (40 dinâmicas)

Todas validadas contra `ActivitySchema` (Zod). Requisitos atendidos:
- **15** sem materiais (`materials: []`) — mínimo 10
- **14** com duração ≤ 20 min — mínimo 10
- Todas com `status: "aprovado"`
- Todas com ≥ 2 faixas etárias

Categorias e IDs:

| Categoria | Arquivo | IDs |
|---|---|---|
| Histórias da Bíblia | `historias-da-biblia.json` | hb-001 … hb-005 |
| Jesus e o Evangelho | `jesus-e-o-evangelho.json` | je-001 … je-005 |
| Oração e Relacionamento | `oracao-e-relacionamento.json` | or-001 … or-005 |
| Caráter Cristão | `carater-cristao.json` | cc-001 … cc-005 |
| Fruto do Espírito | `fruto-do-espirito.json` | fe-001 … fe-005 |
| Igreja e Comunhão | `igreja-e-comunhao.json` | ic-001 … ic-005 |
| Missões e Evangelismo | `missoes-e-evangelismo.json` | me-001 … me-005 |
| Quebra-gelo | `quebra-gelo.json` | qg-001 … qg-005 |

---

## Estado de implementação

| Fase | Status |
|---|---|
| Fase 0 — Config (Vite, Tailwind, ESLint, Vitest, PWA) | ✅ Concluída |
| Fase 1a — Tipos, schemas Zod, utils | ✅ Concluída |
| Fase 1b — Banco Dexie + store Zustand | ✅ Concluída |
| Fase 1c — 40 dinâmicas originais validadas | ✅ Concluída |
| Fase 1d — Componentes reutilizáveis (7) | ✅ Concluída |
| Fase 2 — Páginas e roteador (App.tsx, features/) | ✅ Concluída |
| Fase 3 — Hooks (useActivities, useSearch, useFilters) | ✅ Concluída |
| Fase 4 — Montador de encontro | ✅ Concluída |
| Fase 5 — Testes (73 unitários + 3 arquivos E2E) | ✅ Concluída |
| Fase 6 — PWA offline + ícones + config de deploy | ✅ Concluída |

---

## Regras de conteúdo

Ver `docs/THEOLOGICAL_GUIDELINES.md`. Resumo:
- A Bíblia é a fonte principal — nenhum texto copiado da referência católica
- Evitar temas denominacionais controversos (batismo, dons, escatologia) sem aviso
- Nunca usar medo, culpa ou constrangimento para obter respostas espirituais
- Toda dinâmica precisa de aplicação clara, não apenas entretenimento
- Atividades físicas devem listar `safetyNotes`
- Atividades com alimentos devem alertar sobre alergias

## Deploy

### Vercel (recomendado)
```bash
npm i -g vercel
vercel --prod          # aponta para a pasta dist/
```
`vercel.json` já configurado: rewrite SPA, headers corretos para `sw.js` e `manifest.webmanifest`.

### Cloudflare Pages
Conecte o repositório no dashboard do Cloudflare Pages com:
- **Build command:** `npm run build`
- **Build output directory:** `dist`

`public/_redirects` e `public/_headers` já configurados para SPA + service worker.

### Regenerar ícones PWA
Se trocar o arquivo `public/icon.svg`:
```bash
npm run generate-icons
```

---

## Adicionando novas dinâmicas

1. Adicione ao JSON da categoria correspondente seguindo o schema acima
2. Defina `status: "aprovado"` apenas após revisão pedagógica e bíblica
3. O ID deve ser único no formato `<prefixo-categoria>-<número sequencial>`
4. Execute `npm test` para validar o schema automaticamente
