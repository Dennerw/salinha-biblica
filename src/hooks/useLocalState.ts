import { useState, useEffect, useCallback } from 'react'
import { favoritesDb, completedDb, notesDb } from '@/db'

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    favoritesDb.getAll().then((ids) => setFavorites(new Set(ids)))
  }, [])

  const toggle = useCallback(async (id: string) => {
    const isNowFavorite = await favoritesDb.toggle(id)
    setFavorites((prev) => {
      const next = new Set(prev)
      if (isNowFavorite) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  return { favorites, toggle }
}

export function useCompleted() {
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  useEffect(() => {
    completedDb.getAll().then((ids) => setCompleted(new Set(ids)))
  }, [])

  const toggle = useCallback(async (id: string) => {
    const isNowCompleted = await completedDb.toggle(id)
    setCompleted((prev) => {
      const next = new Set(prev)
      if (isNowCompleted) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  return { completed, toggle }
}

export function useNote(id: string) {
  const [note, setNote] = useState('')

  useEffect(() => {
    notesDb.get(id).then(setNote)
  }, [id])

  const save = useCallback(
    async (text: string) => {
      setNote(text)
      await notesDb.save(id, text)
    },
    [id],
  )

  return { note, save }
}
