# AGENTS.md

## Projeto
PWA mobile-first de dinâmicas bíblicas para ministério infantil evangélico — **Salinha Bíblica**.

## Documentação obrigatória
Leia antes de alterar qualquer coisa:
- `CLAUDE.md` — arquitetura, estado de implementação, API de cada módulo
- `docs/PRD.md` — requisitos e fases do produto
- `docs/ARCHITECTURE.md` — decisões técnicas
- `docs/CONTENT_GUIDE.md` — como criar novas dinâmicas
- `docs/THEOLOGICAL_GUIDELINES.md` — limites de conteúdo

## Comandos
```bash
npm run lint        # ESLint — deve passar sem erros
npm test            # Vitest — deve passar tudo
npm run build       # tsc + vite build — deve completar sem erros
npm run test:e2e    # Playwright — requer servidor rodando
npm run dev         # servidor de desenvolvimento
```

## Regras
- TypeScript estrito — `any` proibido sem justificativa
- Componentes semânticos — nunca `div` clicável; use `button` ou `a`
- Acessibilidade — `aria-label` em botões sem texto visível
- Sem backend nesta fase — tudo local (Dexie + JSON estático)
- Nenhum texto copiado da referência católica
- Todo conteúdo novo precisa de `status: "rascunho"` até revisão
- Sempre rodar lint + test + build antes de encerrar uma tarefa
- Reportar: arquivos alterados, testes executados, limitações restantes
