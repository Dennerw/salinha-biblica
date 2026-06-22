import type { ReviewStatus, ActivityTheology } from '@/types'

// ---------------------------------------------------------------------------
// State machine
// ---------------------------------------------------------------------------

export const VALID_TRANSITIONS: Record<ReviewStatus, ReviewStatus[]> = {
  draft: ['biblical_review', 'archived'],
  biblical_review: ['pedagogical_review', 'rejected', 'draft'],
  pedagogical_review: ['pastoral_review', 'approved', 'rejected', 'biblical_review'],
  pastoral_review: ['approved', 'rejected', 'pedagogical_review'],
  approved: ['archived'],
  rejected: ['draft'],
  archived: [],
}

export function canTransition(from: ReviewStatus, to: ReviewStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}

// ---------------------------------------------------------------------------
// Validation rules per transition
// ---------------------------------------------------------------------------

export interface TransitionContext {
  theology?: ActivityTheology
  reviewer?: string       // who is making the transition
  notes?: string
}

export interface TransitionResult {
  ok: boolean
  error?: string
}

export function validateTransition(
  from: ReviewStatus,
  to: ReviewStatus,
  ctx: TransitionContext = {},
): TransitionResult {
  if (!canTransition(from, to)) {
    return { ok: false, error: `Transição inválida: ${from} → ${to}.` }
  }

  // Advancing to pastoral_review requires high risk
  if (to === 'pastoral_review' && ctx.theology?.risk !== 'high') {
    return {
      ok: false,
      error: 'Revisão pastoral é obrigatória apenas para conteúdo de risco alto.',
    }
  }

  // Approving high-risk content without going through pastoral_review
  if (to === 'approved' && ctx.theology?.risk === 'high' && from !== 'pastoral_review') {
    return {
      ok: false,
      error: 'Conteúdo de risco alto deve passar por revisão pastoral antes de ser aprovado.',
    }
  }

  // Approving requires at least a reviewer name
  if (to === 'approved' && !ctx.reviewer) {
    return { ok: false, error: 'Informe o responsável pela aprovação.' }
  }

  // Rejecting requires a reason
  if (to === 'rejected' && !ctx.notes) {
    return { ok: false, error: 'Informe o motivo da reprovação em observações.' }
  }

  return { ok: true }
}

// ---------------------------------------------------------------------------
// Theological invalidation
// ---------------------------------------------------------------------------

export interface TheologicalSnapshot {
  level: string
  risk: string
  denominationalTags: string[]
}

export function theologicalSnapshot(theology?: ActivityTheology): TheologicalSnapshot {
  return {
    level: theology?.level ?? 'essential',
    risk: theology?.risk ?? 'low',
    denominationalTags: [...(theology?.denominationalTags ?? [])].sort(),
  }
}

export function isTheologicallyModified(
  before: TheologicalSnapshot,
  after: TheologicalSnapshot,
): boolean {
  if (before.level !== after.level) return true
  if (before.risk !== after.risk) return true
  if (before.denominationalTags.join(',') !== after.denominationalTags.join(',')) return true
  return false
}

// ---------------------------------------------------------------------------
// Review history entry
// ---------------------------------------------------------------------------

export interface ReviewHistoryEntry {
  from: ReviewStatus
  to: ReviewStatus
  reviewer?: string
  at: string        // ISO 8601
  notes?: string
}

// Labels for display
export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  draft: 'Rascunho',
  biblical_review: 'Revisão bíblica',
  pedagogical_review: 'Revisão pedagógica',
  pastoral_review: 'Revisão pastoral',
  approved: 'Aprovado',
  rejected: 'Reprovado',
  archived: 'Arquivado',
}

export const REVIEW_STATUS_COLOR: Record<ReviewStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  biblical_review: 'bg-blue-50 text-blue-700',
  pedagogical_review: 'bg-primary-50 text-primary-700',
  pastoral_review: 'bg-amber-50 text-amber-700',
  approved: 'bg-secondary-50 text-secondary-700',
  rejected: 'bg-red-50 text-red-700',
  archived: 'bg-slate-100 text-slate-400',
}
