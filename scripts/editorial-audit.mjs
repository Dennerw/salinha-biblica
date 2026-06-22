/**
 * Editorial audit: evaluates all 40 activities against the full editorial checklist
 * (docs/EDITORIAL_CHECKLIST.md) and generates reports/editorial-audit.json + .md
 *
 * Usage: node scripts/editorial-audit.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ---- High-risk tags -------------------------------------------------------

const HIGH_RISK_TAGS = new Set([
  'batismo', 'ceia', 'dons-espirituais', 'linguas', 'profecia', 'cura',
  'predestinacao', 'livre-arbitrio', 'seguranca-da-salvacao',
  'governo-da-igreja', 'ordenacao', 'sabado', 'dizimos', 'prosperidade',
  'escatologia', 'usos-e-costumes',
])

const CATEGORY_FILES = [
  'historias-da-biblia', 'jesus-e-o-evangelho', 'oracao-e-relacionamento',
  'carater-cristao', 'fruto-do-espirito', 'igreja-e-comunhao',
  'missoes-e-evangelismo', 'quebra-gelo',
]

const CATEGORY_LABELS = {
  'historias-da-biblia':   'Histórias da Bíblia',
  'jesus-e-o-evangelho':   'Jesus e o Evangelho',
  'oracao-e-relacionamento': 'Oração e Relacionamento',
  'carater-cristao':       'Caráter Cristão',
  'fruto-do-espirito':     'Fruto do Espírito',
  'igreja-e-comunhao':     'Igreja e Comunhão',
  'missoes-e-evangelismo': 'Missões e Evangelismo',
  'quebra-gelo':           'Quebra-gelo',
}

function loadActivities() {
  const all = []
  for (const cat of CATEGORY_FILES) {
    const raw = readFileSync(join(ROOT, 'src/data/activities', `${cat}.json`), 'utf-8')
    for (const a of JSON.parse(raw)) all.push({ ...a, _cat: cat })
  }
  return all
}

function normalize(str) {
  return str.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, '-')
}

function detectHighRiskInActivity(a) {
  const found = new Set()
  for (const tag of [...(a.theology?.denominationalTags ?? []), ...(a.tags ?? []), ...(a.themes ?? [])]) {
    if (HIGH_RISK_TAGS.has(normalize(tag))) found.add(normalize(tag))
  }
  return [...found]
}

// ---- Checklist evaluation -------------------------------------------------

function hasText(str, minLen = 10) {
  return typeof str === 'string' && str.trim().length >= minLen
}

function evaluateChecklist(a) {
  const highRiskTagsFound = detectHighRiskInActivity(a)
  const hasMaterials = Array.isArray(a.materials) && a.materials.length > 0
  const hasPhysicalRisk = hasMaterials // simplified proxy: any materials may need safety notes
  const hasFood = (a.materials ?? []).some(m =>
    /(alimento|comida|biscoito|balas|suco|fruta|bolo|chocolate|leite|doce)/i.test(m)
  )

  const checks = {
    // --- Biblical ---
    biblico_referencia:  { ok: hasText(a.bibleReference, 3), group: 'Bíblico', label: 'Referência bíblica presente' },
    biblico_verdade:     { ok: hasText(a.mainTruth, 15),      group: 'Bíblico', label: 'Verdade principal (mainTruth)' },
    biblico_objetivo:    { ok: hasText(a.objective, 20),      group: 'Bíblico', label: 'Objetivo catequetico (objective)' },
    biblico_resumo:      { ok: hasText(a.summary, 20),        group: 'Bíblico', label: 'Resumo da dinâmica (summary)' },

    // --- Pedagogical ---
    ped_passos:          { ok: (a.steps ?? []).length >= 3,   group: 'Pedagógico', label: 'Pelo menos 3 passos (steps)' },
    ped_perguntas:       { ok: (a.discussionQuestions ?? []).length >= 1, group: 'Pedagógico', label: 'Perguntas para conversa' },
    ped_versículo:       { ok: hasText(a.memoryVerse, 10),    group: 'Pedagógico', label: 'Versículo para memorizar (memoryVerse)' },
    ped_oracao:          { ok: hasText(a.prayerSuggestion, 10), group: 'Pedagógico', label: 'Sugestão de oração (prayerSuggestion)' },
    ped_duracao:         { ok: a.durationMinutes >= 5 && a.durationMinutes <= 120, group: 'Pedagógico', label: 'Duração realista (5–120 min)' },
    ped_preparacao:      { ok: (a.preparation ?? []).length > 0, group: 'Pedagógico', label: 'Preparação antes da aula (preparation)', soft: true },
    ped_adaptacao_menor: { ok: hasText(a.youngerAdaptation, 10), group: 'Pedagógico', label: 'Adaptação crianças menores', soft: true },
    ped_adaptacao_maior: { ok: hasText(a.olderAdaptation, 10),   group: 'Pedagógico', label: 'Adaptação crianças maiores', soft: true },
    ped_sem_material:    { ok: hasText(a.noMaterialsAlternative, 10), group: 'Pedagógico', label: 'Alternativa sem materiais', soft: true },

    // --- Safety ---
    seg_notas_seguranca: {
      ok: !hasPhysicalRisk || (a.safetyNotes ?? []).length > 0,
      group: 'Segurança',
      label: 'Notas de segurança (quando há materiais)',
    },
    seg_alergias: {
      ok: !hasFood || (a.safetyNotes ?? []).some(n => /alergi/i.test(n)),
      group: 'Segurança',
      label: 'Aviso de alergias (quando há alimentos)',
    },

    // --- Theological ---
    teol_risco_detectado: {
      ok: highRiskTagsFound.length === 0 || !!a.theology,
      group: 'Teológico',
      label: 'Tags de risco alto classificadas com bloco theology',
    },
    teol_aviso_doutrinal: {
      ok: !a.theology || a.theology.level !== 'denominational' || hasText(a.theology.doctrinalNotice, 10),
      group: 'Teológico',
      label: 'doctrinalNotice presente se nível denominacional',
    },
    teol_aprovacao_pastoral: {
      ok: !a.theology || a.theology.risk !== 'high' || a.theology.requiresPastoralApproval === true,
      group: 'Teológico',
      label: 'requiresPastoralApproval=true para risco alto',
    },
  }

  const failed = Object.entries(checks).filter(([, v]) => !v.ok)
  const failedHard = failed.filter(([, v]) => !v.soft)
  const failedSoft = failed.filter(([, v]) => v.soft)

  let auditStatus
  if (failedHard.some(([k]) => ['biblico_referencia', 'biblico_objetivo', 'ped_passos'].includes(k))) {
    auditStatus = 'blocked'
  } else if (failedHard.length > 0 || failedSoft.filter(([, v]) => !v.soft).length > 0) {
    auditStatus = 'pending'
  } else if (failedSoft.length > 0) {
    auditStatus = 'pending' // soft failures still mark as pending
  } else {
    auditStatus = 'ready'
  }

  return {
    id: a.id,
    title: a.title,
    category: a._cat,
    categoryLabel: CATEGORY_LABELS[a._cat],
    ageGroups: a.ageGroups,
    type: a.type,
    durationMinutes: a.durationMinutes,
    highRiskTagsFound,
    hasTheology: !!a.theology,
    computedRisk: a.theology?.risk ?? (highRiskTagsFound.length > 0 ? 'high' : 'low'),
    auditStatus,
    failedChecks: failed.map(([key, v]) => ({ key, label: v.label, group: v.group, soft: !!v.soft })),
    passedChecks: Object.entries(checks).filter(([, v]) => v.ok).map(([key, v]) => ({ key, label: v.label, group: v.group })),
    checksTotal: Object.keys(checks).length,
    checksPassed: Object.values(checks).filter(v => v.ok).length,
  }
}

// ---- Report generation ----------------------------------------------------

function main() {
  console.log('Carregando atividades…')
  const activities = loadActivities()
  console.log(`  ${activities.length} atividades encontradas.\n`)

  const results = activities.map(evaluateChecklist)

  const byStatus = {
    ready:   results.filter(r => r.auditStatus === 'ready'),
    pending: results.filter(r => r.auditStatus === 'pending'),
    blocked: results.filter(r => r.auditStatus === 'blocked'),
  }

  const summary = {
    total: results.length,
    ready: byStatus.ready.length,
    pending: byStatus.pending.length,
    blocked: byStatus.blocked.length,
    checksPassed: results.reduce((s, r) => s + r.checksPassed, 0),
    checksTotal:  results.reduce((s, r) => s + r.checksTotal, 0),
  }

  // Most common failures
  const failCounts = {}
  for (const r of results) {
    for (const f of r.failedChecks) {
      failCounts[f.label] = (failCounts[f.label] ?? 0) + 1
    }
  }
  const topFailures = Object.entries(failCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([label, count]) => ({ label, count }))

  const report = { generatedAt: new Date().toISOString(), summary, topFailures, activities: results }

  mkdirSync(join(ROOT, 'reports'), { recursive: true })
  writeFileSync(join(ROOT, 'reports/editorial-audit.json'), JSON.stringify(report, null, 2), 'utf-8')

  // ---- Markdown report ----

  const pct = Math.round((summary.checksPassed / summary.checksTotal) * 100)

  const lines = [
    '# Auditoria Editorial — Salinha Bíblica',
    '',
    `> Gerado em: ${new Date().toLocaleString('pt-BR')}`,
    '',
    '## Resumo geral',
    '',
    `| Indicador | Valor |`,
    `|---|---|`,
    `| Total de dinâmicas | ${summary.total} |`,
    `| ✅ Prontas | ${summary.ready} |`,
    `| ⚠️ Pendentes (itens opcionais faltando) | ${summary.pending} |`,
    `| 🚫 Bloqueadas (campos obrigatórios faltando) | ${summary.blocked} |`,
    `| Critérios aprovados | ${summary.checksPassed} / ${summary.checksTotal} (${pct}%) |`,
    '',
    '## Falhas mais comuns',
    '',
    '| Critério | Atividades afetadas |',
    '|---|---|',
    ...topFailures.map(f => `| ${f.label} | ${f.count} |`),
    '',
    '## Detalhamento por atividade',
    '',
  ]

  for (const cat of CATEGORY_FILES) {
    const catResults = results.filter(r => r.category === cat)
    lines.push(`### ${CATEGORY_LABELS[cat]}`)
    lines.push('')
    lines.push('| ID | Título | Status | Aprovado | Falhas |')
    lines.push('|---|---|---|---|---|')
    for (const r of catResults) {
      const statusEmoji = r.auditStatus === 'ready' ? '✅ Pronta' : r.auditStatus === 'pending' ? '⚠️ Pendente' : '🚫 Bloqueada'
      const passRatio = `${r.checksPassed}/${r.checksTotal}`
      const failStr = r.failedChecks.length > 0
        ? r.failedChecks.map(f => (f.soft ? `*(${f.label})*` : f.label)).join(', ')
        : '—'
      lines.push(`| ${r.id} | ${r.title} | ${statusEmoji} | ${passRatio} | ${failStr} |`)
    }
    lines.push('')
  }

  lines.push('## Ações recomendadas')
  lines.push('')

  if (summary.blocked > 0) {
    lines.push(`### 🚫 ${summary.blocked} bloqueadas — ação imediata necessária`)
    lines.push('')
    for (const r of byStatus.blocked) {
      lines.push(`**${r.id} — ${r.title}**`)
      for (const f of r.failedChecks.filter(f => !f.soft)) {
        lines.push(`- [ ] ${f.label}`)
      }
      lines.push('')
    }
  }

  if (summary.pending > 0) {
    lines.push(`### ⚠️ ${summary.pending} pendentes — completar antes de mover para aprovação`)
    lines.push('')
    // Group by most common failure
    const safetyPending = byStatus.pending.filter(r => r.failedChecks.some(f => f.group === 'Segurança' && !f.soft))
    const softPending   = byStatus.pending.filter(r => r.failedChecks.every(f => f.soft))

    if (safetyPending.length > 0) {
      lines.push(`**Adicionar \`safetyNotes\` (${safetyPending.length} atividades):**`)
      lines.push(safetyPending.map(r => `\`${r.id}\``).join(', '))
      lines.push('')
    }
    if (softPending.length > 0) {
      lines.push(`**Campos opcionais recomendados (${softPending.length} atividades):**`)
      lines.push(softPending.map(r => `\`${r.id}\``).join(', '))
      lines.push('')
    }
  }

  if (summary.ready > 0) {
    lines.push(`### ✅ ${summary.ready} prontas para revisão formal`)
    lines.push('')
    lines.push(byStatus.ready.map(r => `\`${r.id}\``).join(', '))
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  lines.push('*Execute `npm run editorial-audit` para regenerar após edições.*')

  writeFileSync(join(ROOT, 'reports/editorial-audit.md'), lines.join('\n'), 'utf-8')

  console.log('Relatórios gerados:')
  console.log('  reports/editorial-audit.json')
  console.log('  reports/editorial-audit.md')
  console.log(`\nResumo:`)
  console.log(`  ✅ Prontas    : ${summary.ready}`)
  console.log(`  ⚠️  Pendentes  : ${summary.pending}`)
  console.log(`  🚫 Bloqueadas : ${summary.blocked}`)
  console.log(`  Critérios    : ${summary.checksPassed}/${summary.checksTotal} (${pct}%)`)
  console.log('\nTop falhas:')
  topFailures.forEach(f => console.log(`  [${f.count}x] ${f.label}`))
}

main()
