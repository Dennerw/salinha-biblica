import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './app/App'
import { runMigrations } from '@/db/migrations'

// Seed draft review records for all activities on first launch (non-blocking)
runMigrations().catch(console.error)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
