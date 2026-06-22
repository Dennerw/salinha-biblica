interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon = '🔍', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <span className="text-5xl mb-4" role="img" aria-hidden>
        {icon}
      </span>
      <h3 className="text-base font-bold text-slate-700 mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-xs leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
