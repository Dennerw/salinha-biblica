import { describe, it, expect } from 'vitest'
import {
  canTransition,
  validateTransition,
  theologicalSnapshot,
  isTheologicallyModified,
  VALID_TRANSITIONS,
  REVIEW_STATUS_LABEL,
  REVIEW_STATUS_COLOR,
} from './review'
import type { ReviewStatus, ActivityTheology } from '@/types'

// ---------------------------------------------------------------------------
// canTransition
// ---------------------------------------------------------------------------

describe('canTransition', () => {
  it('allows valid transitions', () => {
    expect(canTransition('draft', 'biblical_review')).toBe(true)
    expect(canTransition('biblical_review', 'pedagogical_review')).toBe(true)
    expect(canTransition('pedagogical_review', 'approved')).toBe(true)
    expect(canTransition('rejected', 'draft')).toBe(true)
    expect(canTransition('approved', 'archived')).toBe(true)
  })

  it('blocks invalid transitions', () => {
    expect(canTransition('draft', 'approved')).toBe(false)
    expect(canTransition('draft', 'rejected')).toBe(false)
    expect(canTransition('approved', 'draft')).toBe(false)
    expect(canTransition('archived', 'draft')).toBe(false)
    expect(canTransition('biblical_review', 'approved')).toBe(false)
  })

  it('archived has no outbound transitions', () => {
    expect(VALID_TRANSITIONS['archived']).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// validateTransition — structural rules
// ---------------------------------------------------------------------------

const lowRiskTheology: ActivityTheology = {
  level: 'essential',
  risk: 'low',
  denominationalTags: [],
  requiresPastoralApproval: false,
}

const highRiskTheology: ActivityTheology = {
  level: 'denominational',
  risk: 'high',
  denominationalTags: ['batismo'],
  requiresPastoralApproval: true,
}

describe('validateTransition — basic path', () => {
  it('allows draft → biblical_review with no context', () => {
    const result = validateTransition('draft', 'biblical_review')
    expect(result.ok).toBe(true)
  })

  it('returns error for structurally invalid transition', () => {
    const result = validateTransition('draft', 'approved')
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/inválida/)
  })
})

describe('validateTransition — pastoral_review rule', () => {
  it('blocks pastoral_review for low-risk content', () => {
    const result = validateTransition('pedagogical_review', 'pastoral_review', {
      theology: lowRiskTheology,
    })
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/risco alto/)
  })

  it('allows pastoral_review for high-risk content', () => {
    const result = validateTransition('pedagogical_review', 'pastoral_review', {
      theology: highRiskTheology,
      reviewer: 'Pastor João',
    })
    expect(result.ok).toBe(true)
  })
})

describe('validateTransition — approval rules', () => {
  it('requires reviewer name to approve', () => {
    const result = validateTransition('pedagogical_review', 'approved', {
      theology: lowRiskTheology,
    })
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/responsável/)
  })

  it('allows approval of low-risk from pedagogical_review with reviewer', () => {
    const result = validateTransition('pedagogical_review', 'approved', {
      theology: lowRiskTheology,
      reviewer: 'Maria',
    })
    expect(result.ok).toBe(true)
  })

  it('blocks direct approval of high-risk without pastoral_review', () => {
    const result = validateTransition('pedagogical_review', 'approved', {
      theology: highRiskTheology,
      reviewer: 'Pastor João',
    })
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/revisão pastoral/)
  })

  it('allows approval of high-risk from pastoral_review with reviewer', () => {
    const result = validateTransition('pastoral_review', 'approved', {
      theology: highRiskTheology,
      reviewer: 'Pastor João',
    })
    expect(result.ok).toBe(true)
  })
})

describe('validateTransition — rejection rule', () => {
  it('requires notes to reject', () => {
    const result = validateTransition('biblical_review', 'rejected', {
      reviewer: 'Ana',
    })
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/motivo/)
  })

  it('allows rejection with notes', () => {
    const result = validateTransition('biblical_review', 'rejected', {
      reviewer: 'Ana',
      notes: 'Versículo incorreto.',
    })
    expect(result.ok).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// theologicalSnapshot
// ---------------------------------------------------------------------------

describe('theologicalSnapshot', () => {
  it('returns defaults for undefined theology', () => {
    const snap = theologicalSnapshot(undefined)
    expect(snap.level).toBe('essential')
    expect(snap.risk).toBe('low')
    expect(snap.denominationalTags).toEqual([])
  })

  it('sorts denominationalTags for stable comparison', () => {
    const theology: ActivityTheology = {
      level: 'denominational',
      risk: 'high',
      denominationalTags: ['profecia', 'batismo', 'cura'],
      requiresPastoralApproval: true,
    }
    const snap = theologicalSnapshot(theology)
    expect(snap.denominationalTags).toEqual(['batismo', 'cura', 'profecia'])
  })
})

// ---------------------------------------------------------------------------
// isTheologicallyModified
// ---------------------------------------------------------------------------

describe('isTheologicallyModified', () => {
  it('returns false for identical snapshots', () => {
    const snap = theologicalSnapshot(lowRiskTheology)
    expect(isTheologicallyModified(snap, snap)).toBe(false)
  })

  it('detects level change', () => {
    const before = theologicalSnapshot(lowRiskTheology)
    const after = { ...before, level: 'interpretive' }
    expect(isTheologicallyModified(before, after)).toBe(true)
  })

  it('detects risk change', () => {
    const before = theologicalSnapshot(lowRiskTheology)
    const after = { ...before, risk: 'medium' }
    expect(isTheologicallyModified(before, after)).toBe(true)
  })

  it('detects denominationalTags change', () => {
    const before = theologicalSnapshot(lowRiskTheology)
    const after = { ...before, denominationalTags: ['batismo'] }
    expect(isTheologicallyModified(before, after)).toBe(true)
  })

  it('returns false when only order differs (sorted)', () => {
    const theology: ActivityTheology = {
      level: 'denominational',
      risk: 'high',
      denominationalTags: ['batismo', 'cura'],
      requiresPastoralApproval: true,
    }
    const before = theologicalSnapshot(theology)
    const after = theologicalSnapshot({
      ...theology,
      denominationalTags: ['cura', 'batismo'], // different order, same content
    })
    expect(isTheologicallyModified(before, after)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Display constants completeness
// ---------------------------------------------------------------------------

describe('REVIEW_STATUS_LABEL and REVIEW_STATUS_COLOR', () => {
  const allStatuses: ReviewStatus[] = [
    'draft', 'biblical_review', 'pedagogical_review', 'pastoral_review',
    'approved', 'rejected', 'archived',
  ]

  it('has a label for every status', () => {
    allStatuses.forEach((s) => {
      expect(REVIEW_STATUS_LABEL[s]).toBeTruthy()
    })
  })

  it('has a color class for every status', () => {
    allStatuses.forEach((s) => {
      expect(REVIEW_STATUS_COLOR[s]).toBeTruthy()
    })
  })
})
