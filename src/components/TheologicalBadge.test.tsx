import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TheologicalBadge } from './TheologicalBadge'
import type { ActivityTheology, ActivityReview } from '@/types'

const essentialTheology: ActivityTheology = {
  level: 'essential',
  risk: 'low',
  denominationalTags: [],
  requiresPastoralApproval: false,
}

const denominationalTheology: ActivityTheology = {
  level: 'denominational',
  risk: 'high',
  denominationalTags: ['batismo'],
  requiresPastoralApproval: true,
  doctrinalNotice: 'Verifique a prática da sua igreja sobre o batismo.',
}

const interpretiveTheology: ActivityTheology = {
  level: 'interpretive',
  risk: 'medium',
  denominationalTags: [],
  requiresPastoralApproval: false,
}

const approvedReview: ActivityReview = { status: 'approved', version: 1, biblicalReviewer: 'Pastor' }
const draftReview: ActivityReview = { status: 'draft', version: 1 }

describe('TheologicalBadge', () => {
  it('não renderiza nada quando não há theology', () => {
    const { container } = render(<TheologicalBadge />)
    expect(container.firstChild).toBeNull()
  })

  it('exibe "Conteúdo essencial" para level essential', () => {
    render(<TheologicalBadge theology={essentialTheology} review={approvedReview} />)
    expect(screen.getByText('Conteúdo essencial')).toBeInTheDocument()
  })

  it('exibe "Requer adaptação" para level interpretive', () => {
    render(<TheologicalBadge theology={interpretiveTheology} review={approvedReview} />)
    expect(screen.getByText('Requer adaptação')).toBeInTheDocument()
  })

  it('exibe "Tema denominacional" para level denominational', () => {
    render(<TheologicalBadge theology={denominationalTheology} review={approvedReview} />)
    expect(screen.getByText('Tema denominacional')).toBeInTheDocument()
  })

  it('exibe "Revisão pendente" quando review.status !== approved', () => {
    render(<TheologicalBadge theology={essentialTheology} review={draftReview} />)
    expect(screen.getByText('Revisão pendente')).toBeInTheDocument()
  })

  it('exibe "Aprovado pela sua igreja" quando approvedLocally', () => {
    render(<TheologicalBadge theology={denominationalTheology} review={approvedReview} approvedLocally />)
    expect(screen.getByText('Aprovado pela sua igreja')).toBeInTheDocument()
  })

  it('tem aria-label acessível com descrição', () => {
    render(<TheologicalBadge theology={denominationalTheology} review={approvedReview} />)
    screen.getByLabelText(/Tema denominacional/)
  })
})
