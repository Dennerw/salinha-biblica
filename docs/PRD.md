# PRD — Salinha Bíblica

## Problema
Professores do ministério infantil evangélico perdem tempo procurando dinâmicas adequadas para cada turma. O material existente é disperso, sem filtros por faixa etária ou tempo disponível, e não ajuda a montar um encontro completo.

## Solução
Biblioteca mobile-first de dinâmicas bíblicas com filtros inteligentes e montador de encontro baseado em regras locais. Funciona offline após o primeiro acesso.

## Público
Professores voluntários ou remunerados de ministério infantil evangélico, de qualquer denominação não-denominacional. Foco em quem usa celular e tem tempo limitado de preparação.

## Meta do MVP
- 8 categorias, 5 dinâmicas cada (40 total)
- Busca e filtros por faixa etária, tipo, duração, ambiente e energia
- Favoritos, anotações e progresso salvos localmente
- Montador de encontro com roteiro sugerido
- PWA instalável com cache offline

## Fases

### Fase 0 — Configuração ✅
Repositório, ferramentas de build, lint, teste e configurações.

### Fase 1 — Fundação ✅
Componentes, roteador, tema visual, tipos, schemas, banco Dexie, store Zustand.

### Fase 2 — Conteúdo ✅
40 dinâmicas originais validadas, busca full-text, filtros por 6 dimensões.

### Fase 3 — Páginas completas ✅
Home, lista, detalhe (com modo aula), progresso, configurações, montador, meus encontros.

### Fase 4 — Testes ✅ (parcial)
Unitários para schemas, busca, filtros e normalize. E2E com Playwright (3 fluxos).

### Fase 5 — PWA e publicação
Service worker, cache offline, ícones, publicação no Cloudflare Pages ou Vercel.

### Fase 6 — Piloto
Usar em 4 encontros reais, coletar feedback de 2–3 professores, ajustar.

## Critérios de sucesso do piloto
1. Abrir no celular sem erros
2. Encontrar dinâmica adequada em menos de 2 minutos
3. Montar roteiro completo em menos de 5 minutos
4. Usar modo aula durante o encontro
5. Anotar e rever depois
6. Reabrir sem perder dados
7. Funcionar sem internet após primeiro acesso
