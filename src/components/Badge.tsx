interface BadgeProps {
  children: React.ReactNode
  variant?: 'type' | 'duration' | 'difficulty' | 'age' | 'neutral'
}

const variantClass: Record<NonNullable<BadgeProps['variant']>, string> = {
  type: 'bg-primary-50 text-primary-700',
  duration: 'bg-secondary-50 text-secondary-700',
  difficulty: 'bg-accent-50 text-amber-700',
  age: 'bg-warm-50 text-orange-700',
  neutral: 'bg-slate-100 text-slate-600',
}

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] font-semibold ${variantClass[variant]}`}
    >
      {children}
    </span>
  )
}
