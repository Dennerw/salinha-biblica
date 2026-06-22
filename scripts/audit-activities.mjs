/**
 * Audit script: reads all 40 activities, detects high-risk theological tags,
 * and generates reports/activity-audit.json + reports/activity-audit.md
 *
 * Usage: node scripts/audit-activities.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ---- High-risk tags (must match src/schemas/activity.ts) -----------------

const HIGH_RISK_TAGS = new Set([
  'batismo', 'ceia', 'dons-espirituais', 'linguas', 'profecia', 'cura',
  'predestinacao', 'livre-arbitrio', 'seguranca-da-salvacao',
  'governo-da-igreja', 'ordenacao', 'sabado', 'dizimos', 'prosperidade',
  'escatologia', 'usos-e-costumes',
])

// ---- Activity files -------------------------------------------------------

const CATEGORY_FILES = [
  'historias-da-biblia',
  'jesus-e-o-evangelho',
  'oracao-e-relacionamento',
  'carater-cristao',
  'fruto-do-espirito',
  'igreja-e-comunhao',
  'missoes-e-evangelismo',
  'quebra-gelo',
]

function loadActivities() {
  const all = []
  for (const cat of CATEGORY_FILES) {
    const raw = readFileSync(join(ROOT, 'src/data/activities', `${cat}.json`), 'utf-8')
    const activities = JSON.parse(raw)
    for (const a of activities) {
      all.push({ ...a, _file: cat })
    }
  }
  return all
}

// ---- Risk analysis --------------------------------------------------------

function detectHighRiskTags(activity) {
  const found = new Set()

  // Check explicit theology denominationalTags
  for (const tag of (activity.theology?.denominationalTags ?? [])) {
    if (HIGH_RISK_TAGS.has(tag)) found.add(tag)
  }

  // Check activity tags (normalized: lowercase, no accents)
  for (const tag of (activity.tags ?? [])) {
    const normalized = tag.toLowerCase()
      .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    if (HIGH_RISK_TAGS.has(normalized)) found.add(normalized)
  }

  // Check themes
  for (const theme of (activity.themes ?? [])) {
    const normalized = theme.toLowerCase()
      .normalize('NFD').replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, '-')
    if (HIGH_RISK_TAGS.has(normalized)) found.add(normalized)
  }

  return [...found]
}

function computeRisk(activity) {
  // Explicit theology field takes precedence
  if (activity.theology?.risk) return activity.theology.risk

  const highRiskFound = detectHighRiskTags(activity)
  if (highRiskFound.length > 0) return 'high'

  return 'low'
}

// ---- Audit ----------------------------------------------------------------

function auditActivity(activity) {
  const highRiskTagsFound = detectHighRiskTags(activity)
  const computedRisk = computeRisk(activity)
  const hasTheology = !!activity.theology

  let status = 'ready'
  let notes = []

  if (computedRisk === 'high') {
    status = 'blocked'
    notes.push('Risco alto detectado — requer revisão pastoral antes de aprovação.')
  }

  if (hasTheology && activity.theology.level === 'denominational' && !activity.theology.doctrinalNotice) {
    status = status === 'blocked' ? 'blocked' : 'pending'
    notes.push('Nível denominacional sem doctrinalNotice definido.')
  }

  if (activity.theology?.requiresPastoralApproval && !hasTheology) {
    status = 'pending'
    notes.push('requiresPastoralApproval=true mas sem bloco theology completo.')
  }

  return {
    id: activity.id,
    title: activity.title,
    category: activity._file,
    reviewMigrationStatus: 'draft',
    computedRisk,
    hasTheology,
    hasExplicitReview: !!activity.review,
    highRiskTagsFound,
    auditStatus: status,
    notes,
  }
}

// ---- Main -----------------------------------------------------------------

function main() {
  console.log('Carregando atividades…')
  const activities = loadActivities()
  console.log(`  ${activities.length} atividades encontradas.`)

  const results = activities.map(auditActivity)

  const summary = {
    total: results.length,
    ready: results.filter(r => r.auditStatus === 'ready').length,
    pending: results.filter(r => r.auditStatus === 'pending').length,
    blocked: results.filter(r => r.auditStatus === 'blocked').length,
    highRisk: results.filter(r => r.computedRisk === 'high').length,
    withTheology: results.filter(r => r.hasTheology).length,
  }

  const report = {
    generatedAt: new Date().toISOString(),
    summary,
    activities: results,
  }

  // JSON report
  mkdirSync(join(ROOT, 'reports'), { recursive: true })
  writeFileSync(
    join(ROOT, 'reports/activity-audit.json'),
    JSON.stringify(report, null, 2),
    'utf-8',
  )

  // Markdown report
  const lines = [
    '# Relatório de Auditoria Editorial — Salinha Bíblica',
    '',
    `> Gerado em: ${new Date().toLocaleString('pt-BR')}`,
    '',
    '## Resumo',
    '',
    `| Indicador | Valor |`,
    `|---|---|`,
    `| Total de dinâmicas | ${summary.total} |`,
    `| Prontas para migrar (draft) | ${summary.ready} |`,
    `| Pendentes (requerem atenção) | ${summary.pending} |`,
    `| Bloqueadas (risco alto) | ${summary.blocked} |`,
    `| Com campo theology | ${summary.withTheology} |`,
    `| Risco alto detectado | ${summary.highRisk} |`,
    '',
    '## Detalhamento por atividade',
    '',
    '| ID | Título | Categoria | Risco | Status | Observações |',
    '|---|---|---|---|---|---|',
  ]

  for (const r of results) {
    const riskEmoji = r.computedRisk === 'high' ? '🔴 alto' : r.computedRisk === 'medium' ? '🟡 médio' : '🟢 baixo'
    const statusEmoji = r.auditStatus === 'ready' ? '✅ pronta' : r.auditStatus === 'pending' ? '⚠️ pendente' : '🚫 bloqueada'
    const notesStr = r.notes.length > 0 ? r.notes.join('; ') : '—'
    lines.push(`| ${r.id} | ${r.title} | ${r.category} | ${riskEmoji} | ${statusEmoji} | ${notesStr} |`)
  }

  lines.push('')
  lines.push('## Ação recomendada')
  lines.push('')
  if (summary.blocked === 0 && summary.pending === 0) {
    lines.push('Todas as dinâmicas estão prontas para migração automática como `draft`. Execute `runMigrations()` na inicialização do app para criar os registros de revisão no IndexedDB local.')
  } else {
    lines.push(`- **${summary.blocked} bloqueadas**: adicionar bloco \`theology\` com \`risk: "high"\` e acionar revisão pastoral.`)
    lines.push(`- **${summary.pending} pendentes**: completar campos \`theology\` antes de avançar no fluxo de revisão.`)
    lines.push(`- **${summary.ready} prontas**: podem ser migradas como \`draft\` imediatamente.`)
  }
  lines.push('')

  writeFileSync(
    join(ROOT, 'reports/activity-audit.md'),
    lines.join('\n'),
    'utf-8',
  )

  console.log('\nRelatório gerado:')
  console.log(`  reports/activity-audit.json`)
  console.log(`  reports/activity-audit.md`)
  console.log('\nResumo:')
  console.log(`  ✅ Prontas  : ${summary.ready}`)
  console.log(`  ⚠️  Pendentes: ${summary.pending}`)
  console.log(`  🚫 Bloqueadas: ${summary.blocked}`)
  console.log(`  Total: ${summary.total}`)
}

main()
