import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { lessonsDb } from '@/db'
import { AppHeader } from '@/components/AppHeader'
import { EmptyState } from '@/components/EmptyState'
import type { LessonPlan } from '@/types'

export function MyLessonsPage() {
  const [lessons, setLessons] = useState<LessonPlan[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    lessonsDb.getAll().then(setLessons)
  }, [])

  async function handleDelete(id: string) {
    await lessonsDb.delete(id)
    setLessons((prev) => prev.filter((l) => l.id !== id))
  }

  async function handleComplete(id: string) {
    await lessonsDb.markCompleted(id)
    setLessons((prev) =>
      prev.map((l) => (l.id === id ? { ...l, completedAt: new Date() } : l)),
    )
  }

  return (
    <div className="page-container">
      <AppHeader title="Meus Encontros" subtitle={`${lessons.length} encontros salvos`} />

      <div className="flex flex-col gap-3 px-4 pt-5">
        {lessons.length === 0 ? (
          <EmptyState
            icon="🗓️"
            title="Nenhum encontro salvo"
            description="Use o Montador de Encontro para criar e salvar seu primeiro roteiro."
            action={
              <button onClick={() => navigate('/planejar')} className="btn-primary text-sm">
                Montar encontro
              </button>
            }
          />
        ) : (
          lessons.map((lesson) => (
            <div key={lesson.id} className="card px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-slate-800 text-sm">{lesson.title}</p>
                    {lesson.completedAt && (
                      <span className="text-[0.6rem] font-bold text-secondary-600 bg-secondary-50 px-1.5 py-0.5 rounded">
                        ✓ Realizado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {lesson.ageGroup} anos · {lesson.totalDurationMinutes} min · {lesson.steps.length} etapas
                  </p>
                  {lesson.theme && (
                    <p className="text-xs text-primary-600 font-medium mt-0.5">Tema: {lesson.theme}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                {!lesson.completedAt && (
                  <button
                    onClick={() => handleComplete(lesson.id)}
                    className="text-xs font-semibold text-secondary-600 border border-secondary-300
                               px-2.5 py-1.5 rounded-lg bg-secondary-50"
                  >
                    Marcar realizado
                  </button>
                )}
                <button
                  onClick={() => handleDelete(lesson.id)}
                  className="text-xs font-semibold text-slate-400 border border-slate-200
                             px-2.5 py-1.5 rounded-lg ml-auto"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
