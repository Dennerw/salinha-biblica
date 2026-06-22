import { useNavigate } from 'react-router-dom'

interface AppHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  action?: React.ReactNode
}

export function AppHeader({ title, subtitle, showBack = false, action }: AppHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-4">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 pt-3 pb-1 text-sm font-medium text-primary-100
                     active:text-white transition-colors"
          aria-label="Voltar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Voltar
        </button>
      )}
      <div className={`pb-4 ${showBack ? 'pt-1' : 'pt-4'} flex items-start justify-between`}>
        <div>
          <h1 className="text-xl font-extrabold leading-tight">{title}</h1>
          {subtitle && <p className="text-sm text-primary-100 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="ml-3 flex-shrink-0">{action}</div>}
      </div>
    </header>
  )
}
