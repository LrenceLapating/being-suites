import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import logoUrl from './assets/Being logo.png'

// Set favicon to the site logo (works in dev and Vercel builds)
(() => {
  const rels = ['icon', 'shortcut icon']
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    document.head.appendChild(link)
  }
  link.rel = 'icon'
  link.type = 'image/png'
  link.href = logoUrl

  // Also set shortcut icon for broader browser support
  const shortcut = document.querySelector<HTMLLinkElement>('link[rel="shortcut icon"]') || document.createElement('link')
  shortcut.rel = 'shortcut icon'
  shortcut.type = 'image/png'
  shortcut.href = logoUrl
  if (!shortcut.parentElement) document.head.appendChild(shortcut)
})()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
