import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Handle Vite dynamic import chunk failures after new deployments
window.addEventListener('vite:preloadError', (event) => {
  console.warn('Vite preload error encountered (new build deployed), refreshing page...', event)
  const lastReload = sessionStorage.getItem('vite_preload_reload')
  const now = Date.now()
  if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
    sessionStorage.setItem('vite_preload_reload', now.toString())
    window.location.reload()
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

