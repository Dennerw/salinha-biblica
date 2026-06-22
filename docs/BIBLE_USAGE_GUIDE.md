# Guia de Uso da Bíblia

## Como selecionar passagens

1. A passagem deve sustentar diretamente a verdade ensinada
2. Verificar: quem fala, para quem, qual situação histórica, qual objetivo do autor
3. Preferir passagens com contexto simples para crianças
4. Evitar textos proféticos com interpretações muito divergentes para o catálogo geral

---

## Como resumir o contexto

O campo `mainTruth` deve:

- Ser diretamente sustentado pela passagem (não apenas "inspirado" por ela)
- Usar linguagem adequada à faixa etária
- Não exceder o que o texto realmente diz

Exemplo correto:
> `"bibleReference": "Salmos 56:3"` → `"mainTruth": "Podemos falar com Deus quando temos medo."`

Exemplo incorreto (texto-prova):
> `"bibleReference": "Filipenses 4:13"` → `"mainTruth": "Deus vai fazer você ganhar a competição."` ❌

---

## Como evitar texto-prova

A revisão bíblica deve verificar:

- A conclusão da dinâmica decorre da passagem, não apenas a usa como decoração
- A passagem não é tirada do contexto para sustentar uma aplicação não relacionada
- Promessas condicionais no texto não são apresentadas como absolutas

---

## Traduções bíblicas e direitos autorais

Armazenar preferencialmente:

```json
{
  "bibleReference": "Efésios 4:32",
  "bibleText": null,
  "readingInstruction": "Leia o versículo na tradução utilizada pela sua igreja."
}
```

- Não copiar grandes quantidades de texto de traduções protegidas sem autorização
- Paráfrases originais e curtas do contexto são permitidas
- Versículos individuais citados em contexto educacional geralmente se enquadram em uso justo, mas devem ser verificados pela liderança

---

## Passagens que exigem cuidado especial

- Textos sobre cura: não usar para prometer resultado específico
- Textos sobre prosperidade: não usar fora do contexto literário e histórico
- Textos apocalípticos: não usar para criar medo ou fazer previsões
- Textos sobre dons: verificar compatibilidade com a tradição da igreja
