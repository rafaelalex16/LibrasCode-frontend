import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { carregarGlossarioDoBanco } from './glossario/carregarGlossario'
import './index.css'

void carregarGlossarioDoBanco()

// PWA: o service worker só roda no build de produção para não atrapalhar o desenvolvimento
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js')
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
