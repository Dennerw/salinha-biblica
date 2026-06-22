# Fluxo de Revisão de Conteúdo

## Papéis

| Papel | Responsabilidade |
|---|---|
| **Autor** | Escreve a dinâmica e define classificação teológica inicial |
| **Revisor bíblico** | Verifica contexto, interpretação e coerência da passagem |
| **Revisor pedagógico** | Verifica idade, clareza, inclusão e segurança |
| **Aprovador pastoral** | Decide sobre conteúdo denominacional |
| **Editor final** | Revisa linguagem, metadados e publica |

No MVP, os papéis podem ser exercidos pelas mesmas pessoas. O processo deve distingui-los mesmo assim.

---

## Status de revisão

| Status | Significado |
|---|---|
| `draft` | Rascunho inicial, não revisado |
| `biblical_review` | Aguardando ou em revisão bíblica |
| `pedagogical_review` | Aguardando ou em revisão pedagógica |
| `pastoral_review` | Aguardando aprovação pastoral (risco alto) |
| `approved` | Aprovado para uso |
| `rejected` | Reprovado — ver observações |
| `archived` | Arquivado — não aparece no catálogo |

---

## Fluxo

```
Autor cria rascunho (status: draft)
    ↓
Sistema valida campos obrigatórios
    ↓
Revisor bíblico analisa passagem e aplicação (status: biblical_review)
    ↓
Revisor pedagógico analisa idade, duração e segurança (status: pedagogical_review)
    ↓
[Se risk = high] Aprovador pastoral aprova ou solicita alterações (status: pastoral_review)
    ↓
Editor final publica (status: approved)
```

---

## Registros obrigatórios

O campo `review` de cada dinâmica deve conter:

- `version`: número incrementado a cada alteração significativa
- `reviewedAt`: data da última revisão (ISO 8601)
- `biblicalReviewer`: função ou identificação do revisor bíblico
- `pedagogicalReviewer`: função ou identificação do revisor pedagógico
- `pastoralApprover`: obrigatório para risco alto
- `notes[]`: observações e motivo de rejeição ou arquivamento

---

## Quando uma nova revisão é obrigatória

Alterações que exigem nova revisão e incremento de versão:

- Mudança na verdade principal (`mainTruth`)
- Mudança na referência bíblica
- Mudança no nível teológico (`theology.level`)
- Mudança no risco editorial (`theology.risk`)
- Adição ou remoção de tags denominacionais
- Alteração significativa nos passos ou perguntas de discussão

Correções ortográficas e ajustes de formatação não exigem nova revisão.

---

## Conteúdo bloqueado

Conteúdo **não** aparece no catálogo ativo quando:

- `review.status !== 'approved'`
- `theology.risk === 'high'` e `review.pastoralApprover` está vazio
- `status === 'arquivado'`

Conteúdo bloqueado **não** é recomendado pelo montador de encontros.
