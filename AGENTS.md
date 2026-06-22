# AGENTS.md

## Projeto
PWA mobile-first de dinâmicas bíblicas para ministério infantil evangélico — **Salinha Bíblica**.

## Documentação obrigatória
Leia antes de alterar qualquer coisa:
- `CLAUDE.md` — arquitetura, estado de implementação, API de cada módulo
- `docs/PRD.md` — requisitos e fases do produto
- `docs/ARCHITECTURE.md` — decisões técnicas
- `docs/CONTENT_GUIDE.md` — como criar novas dinâmicas
- `docs/THEOLOGICAL_GUIDELINES.md` — níveis teológicos, matriz de risco, linguagem
- `docs/DENOMINATIONAL_TOPICS.md` — temas denominacionais e como tratá-los
- `docs/CHILD_SAFETY_GUIDE.md` — proteção emocional e física das crianças
- `docs/BIBLE_USAGE_GUIDE.md` — uso responsável das Escrituras
- `docs/CONTENT_REVIEW_WORKFLOW.md` — fluxo de revisão e aprovação
- `docs/CHURCH_PROFILE.md` — perfil da igreja e personalização local
- `docs/EDITORIAL_CHECKLIST.md` — checklist antes de aprovar uma dinâmica

## Comandos
```bash
npm run lint        # ESLint — deve passar sem erros
npm test            # Vitest — deve passar tudo
npm run build       # tsc + vite build — deve completar sem erros
npm run test:e2e    # Playwright — requer servidor rodando
npm run dev         # servidor de desenvolvimento
```

## Regras gerais
- TypeScript estrito — `any` proibido sem justificativa
- Componentes semânticos — nunca `div` clicável; use `button` ou `a`
- Acessibilidade — `aria-label` em botões sem texto visível
- Sem backend nesta fase — tudo local (Dexie + JSON estático)
- Nenhum texto copiado da referência católica
- Todo conteúdo novo precisa de `status: "rascunho"` até revisão
- Sempre rodar lint + test + build antes de encerrar uma tarefa
- Reportar: arquivos alterados, testes executados, limitações restantes

## Neutralidade denominacional
- Não apresentar como consenso uma doutrina que varia entre denominações evangélicas
- Classificar cada atividade como `essential`, `interpretive` ou `denominational`
- Classificar o risco editorial como `low`, `medium` ou `high`
- Conteúdo de risco alto exige `requiresPastoralApproval: true` e revisão pastoral registrada
- Dar preferência à linguagem diretamente sustentada pelo contexto bíblico
- Oferecer `adaptationInstructions` quando houver divergência relevante entre igrejas
- Não atacar, ridicularizar ou comparar negativamente outras tradições cristãs
- Não prometer cura, prosperidade ou resultado espiritual específico
- Não pressionar crianças a relatar conversão, pecados, traumas ou experiências espirituais
- Não copiar longos trechos de traduções bíblicas protegidas
- Alterações teológicas exigem incremento de `review.version` e nova revisão

## Validações de conteúdo
- Nenhuma atividade pode ser publicada sem `bibleReference`, `objective`, `ageGroups`, `durationMinutes` e `safetyNotes`
- Atividades denominacionais não entram no montador automático sem aprovação local
- Tags de risco alto devem ativar `theology.requiresPastoralApproval: true`
- O build deve falhar se os schemas Zod forem violados (validação em `useActivities.ts`)
