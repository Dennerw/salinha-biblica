# Guia de Conteúdo — Salinha Bíblica

## Como adicionar uma nova dinâmica

1. Escolha o arquivo JSON da categoria em `src/data/activities/`
2. Adicione o objeto seguindo o schema de `src/schemas/activity.ts`
3. Defina `"status": "rascunho"` — nunca `"aprovado"` sem revisão
4. O ID deve ser único: formato `<prefixo>-<número>` (ex.: `hb-006`)
5. Rode `npm test` — os testes de schema validarão automaticamente

## Schema resumido

| Campo | Obrigatório | Notas |
|---|---|---|
| `id` | Sim | Único no arquivo |
| `title` | Sim | Nome da dinâmica |
| `summary` | Sim | 1–2 frases |
| `category` | Sim | Deve corresponder a um id de categoria |
| `ageGroups` | Sim (≥ 1) | Ao menos uma faixa |
| `groupSize` | Sim (≥ 1) | Ao menos um tamanho |
| `type` | Sim | Enum: jogo/reflexao/arte/teatro/musica/experimento/oracao/quebra-gelo |
| `durationMinutes` | Sim | Inteiro positivo |
| `difficulty` | Sim | facil/medio/avancado |
| `environment` | Sim (≥ 1) | sala/salao/externo/qualquer |
| `energyLevel` | Sim | calmo/moderado/agitado |
| `bibleReference` | Sim | Ex.: "Marcos 4:35-41" |
| `mainTruth` | Sim | Uma frase |
| `objective` | Sim | O que a criança deve aprender/viver |
| `materials` | Sim | `[]` se não precisar de materiais |
| `preparation` | Sim | `[]` se não houver preparação |
| `steps` | Sim (≥ 1) | Passo a passo claro e numerável |
| `discussionQuestions` | Sim | Pode ser `[]` |
| `prayerSuggestion` | Sim | Pode ser `""` |
| `memoryVerse` | Sim | Pode ser `""` |
| `safetyNotes` | Sim | `[]` se não houver riscos |
| `youngerAdaptation` | Não | Para crianças menores da faixa |
| `olderAdaptation` | Não | Para crianças maiores |
| `noMaterialsAlternative` | Não | Versão sem materiais |
| `tags` | Sim | Palavras-chave para busca |
| `status` | Sim | Começa como "rascunho" |

## Fluxo de aprovação

1. `rascunho` → escrito pelo autor
2. `revisao-pedagogica` → revisado para adequação à faixa etária
3. `revisao-biblica` → verificado teologicamente
4. `aprovado` → aparece nos filtros padrão (futuro: filtrar por status)
5. `arquivado` → removido da exibição sem deletar

## Boas práticas de redação

- **Steps**: verbos no imperativo, frases curtas. "Conte a história." não "O professor deve contar..."
- **Objective**: o que muda na criança, não o que o professor faz
- **MainTruth**: uma frase que a criança pode levar para casa
- **MemoryVerse**: incluir livro, capítulo e versículo e o texto
- **Tags**: incluir personagens bíblicos, temas, palavras-chave da busca
