import type { ActivityTheology, ActivityReview } from '@/types'

interface TheologicalBadgeProps {
  theology?: ActivityTheology
  review?: ActivityReview
  approvedLocally?: boolean
}

type SealVariant = 'essential' | 'adaptacao' | 'denominacional' | 'pendente' | 'aprovado-local'

interface Seal {
  variant: SealVariant
  label: string
  icon: string
  description: string
}

const sealStyles: Record<SealVariant, string> = {
  essential:        'bg-secondary-50 text-secondary-800 border-secondary-200',
  adaptacao:        'bg-blue-50 text-blue-800 border-blue-200',
  denominacional:   'bg-amber-50 text-amber-800 border-amber-200',
  pendente:         'bg-slate-100 text-slate-600 border-slate-200',
  'aprovado-local': 'bg-secondary-50 text-secondary-800 border-secondary-200',
}

function getSeal(
  theology: ActivityTheology | undefined,
  review: ActivityReview | undefined,
  approvedLocally: boolean,
): Seal | null {
  if (approvedLocally) {
    return { variant: 'aprovado-local', label: 'Aprovado pela sua igreja', icon: '✓', description: 'Este conteúdo foi aprovado pela liderança local.' }
  }
  if (!theology) return null

  if (review && review.status !== 'approved') {
    return { variant: 'pendente', label: 'Revisão pendente', icon: '⏳', description: 'Este conteúdo ainda não foi aprovado para uso.' }
  }

  if (theology.level === 'denominational') {
    return { variant: 'denominacional', label: 'Tema denominacional', icon: '⚑', description: theology.doctrinalNotice ?? 'Este tema possui diferenças entre igrejas evangélicas.' }
  }
  if (theology.level === 'interpretive') {
    return { variant: 'adaptacao', label: 'Requer adaptação', icon: '↺', description: 'A aplicação pode variar conforme o ensino da sua igreja.' }
  }
  // essential — só mostra se explicitamente solicitado via theology presente
  return { variant: 'essential', label: 'Conteúdo essencial', icon: '✓', description: 'Tema central compartilhado entre igrejas evangélicas.' }
}

export function TheologicalBadge({ theology, review, approvedLocally = false }: TheologicalBadgeProps) {
  const seal = getSeal(theology, review, approvedLocally)
  if (!seal) return null

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[0.65rem] font-semibold ${sealStyles[seal.variant]}`}
      title={seal.description}
      aria-label={`Classificação teológica: ${seal.label}. ${seal.description}`}
    >
      <span aria-hidden="true">{seal.icon}</span>
      {seal.label}
    </span>
  )
}
