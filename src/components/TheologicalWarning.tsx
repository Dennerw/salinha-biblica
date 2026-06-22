import { useEffect, useRef } from 'react'
import type { ActivityTheology } from '@/types'

interface TheologicalWarningProps {
  theology: ActivityTheology
  onContinue: () => void
  onBack: () => void
}

export function TheologicalWarning({ theology, onContinue, onBack }: TheologicalWarningProps) {
  const continueRef = useRef<HTMLButtonElement>(null)

  // Trap focus on mount for keyboard/screen-reader users
  useEffect(() => {
    continueRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onBack])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-6 sm:pb-0"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="warning-title"
      aria-describedby="warning-desc"
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 flex flex-col gap-4">
        {/* Icon + title — not color-only */}
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0"
            aria-hidden="true"
          >
            <span className="text-lg">⚑</span>
          </div>
          <div>
            <p id="warning-title" className="font-extrabold text-slate-800 text-base leading-snug">
              Tema denominacional
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Atenção antes de usar com as crianças</p>
          </div>
        </div>

        {/* Notice */}
        <p id="warning-desc" className="text-sm text-slate-600 leading-relaxed">
          {theology.doctrinalNotice ??
            'Esta dinâmica aborda um tema com diferenças entre igrejas evangélicas. Verifique as orientações da sua liderança antes de utilizar com as crianças.'}
        </p>

        {/* Adaptation instructions */}
        {theology.adaptationInstructions && theology.adaptationInstructions.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="text-xs font-bold text-amber-800 mb-2">Orientações para adaptação local:</p>
            <ul className="space-y-1">
              {theology.adaptationInstructions.map((inst, i) => (
                <li key={i} className="text-xs text-amber-900 flex gap-2">
                  <span aria-hidden="true">•</span>
                  {inst}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-1">
          <button
            ref={continueRef}
            onClick={onContinue}
            className="btn-primary w-full text-sm"
            aria-label="Entendi o aviso e quero continuar para a dinâmica"
          >
            Entendi, continuar
          </button>
          <button
            onClick={onBack}
            className="w-full text-sm font-semibold text-slate-500 py-2.5 rounded-xl border-2 border-slate-200 active:bg-slate-50"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  )
}
