import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/print.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Ensure lucide icons are initialized after initial render and on hot reload
if (typeof window !== 'undefined' && window.lucide) {
  window.requestAnimationFrame(() => window.lucide.createIcons());
}
