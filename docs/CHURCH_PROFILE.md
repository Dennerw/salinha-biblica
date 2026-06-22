# Perfil da Igreja

O perfil da igreja é **opcional** e salvo apenas localmente (IndexedDB). Serve para adaptar termos e controlar quais módulos denominacionais estão habilitados.

---

## Modos de configuração

### Modo básico (padrão)
Apenas conteúdo essencial (`theology.level === 'essential'`) aparece no catálogo. Nenhuma configuração necessária.

### Modo personalizado
A liderança escolhe quais módulos denominacionais habilitar e quais termos prefere. Conteúdo habilitado aparece com aviso e pode ser usado no montador.

### Modo revisão pastoral
Conteúdo denominacional fica visível apenas em modo de revisão. Não entra no catálogo ativo até aprovação registrada localmente.

---

## Campos do perfil

```ts
interface ChurchProfile {
  ministryName: string          // ex: "Ministério Infantil Laços de Amor"
  churchName: string
  bibleVersion: string          // ex: "NVI", "ARC", "NAA"
  preferredAgeGroups: AgeGroup[]
  configMode: 'basic' | 'custom' | 'pastoral_review'
  enabledDenominationalModules: string[]  // ex: ['batismo', 'ceia']
  customTerms: Record<string, string>     // ex: { 'escola-dominical': 'turma bíblica' }
  pastoralApproverName: string  // identificação funcional (sem dados sensíveis)
  approvedActivities: string[]  // IDs aprovados localmente
  exportedAt?: string
}
```

---

## Termos configuráveis

| Termo padrão | Alternativas comuns |
|---|---|
| Escola dominical | Aula bíblica, Turma bíblica, Encontro infantil |
| Culto | Reunião da igreja, Celebração |
| Pastor | Líder, Presbítero (conforme o contexto) |
| Ministério infantil | Departamento infantil, Kids |

A personalização de termos é aplicada na interface sem alterar os dados originais das dinâmicas.

---

## Privacidade

- Nenhum dado do perfil é enviado para servidores
- O perfil pode ser exportado, importado e apagado a qualquer momento
- Não são coletadas informações além das necessárias para personalização
- Aprovações locais são registradas com função/cargo, nunca com CPF, e-mail ou dados pessoais sensíveis
