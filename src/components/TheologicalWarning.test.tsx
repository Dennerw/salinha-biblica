import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TheologicalWarning } from './TheologicalWarning'
import type { ActivityTheology } from '@/types'

const theology: ActivityTheology = {
  level: 'denominational',
  risk: 'high',
  denominationalTags: ['batismo'],
  requiresPastoralApproval: true,
  doctrinalNotice: 'Este tema possui diferenças entre igrejas evangélicas.',
  adaptationInstructions: ['Defina quem pode ser batizado conforme a prática local.'],
}

describe('TheologicalWarning', () => {
  it('exibe o título "Tema denominacional"', () => {
    render(<TheologicalWarning theology={theology} onContinue={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText('Tema denominacional')).toBeInTheDocument()
  })

  it('exibe o doctrinalNotice', () => {
    render(<TheologicalWarning theology={theology} onContinue={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText(/diferenças entre igrejas evangélicas/)).toBeInTheDocument()
  })

  it('exibe as adaptationInstructions', () => {
    render(<TheologicalWarning theology={theology} onContinue={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText(/Defina quem pode ser batizado/)).toBeInTheDocument()
  })

  it('chama onContinue ao clicar em "Entendi, continuar"', () => {
    const onContinue = vi.fn()
    render(<TheologicalWarning theology={theology} onContinue={onContinue} onBack={vi.fn()} />)
    fireEvent.click(screen.getByText('Entendi, continuar'))
    expect(onContinue).toHaveBeenCalledOnce()
  })

  it('chama onBack ao clicar em "Voltar"', () => {
    const onBack = vi.fn()
    render(<TheologicalWarning theology={theology} onContinue={vi.fn()} onBack={onBack} />)
    fireEvent.click(screen.getByText('Voltar'))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('chama onBack ao pressionar Escape', () => {
    const onBack = vi.fn()
    render(<TheologicalWarning theology={theology} onContinue={vi.fn()} onBack={onBack} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('tem role="alertdialog" e aria-modal="true"', () => {
    render(<TheologicalWarning theology={theology} onContinue={vi.fn()} onBack={vi.fn()} />)
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('tem aria-labelledby e aria-describedby', () => {
    render(<TheologicalWarning theology={theology} onContinue={vi.fn()} onBack={vi.fn()} />)
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveAttribute('aria-labelledby', 'warning-title')
    expect(dialog).toHaveAttribute('aria-describedby', 'warning-desc')
  })
})
