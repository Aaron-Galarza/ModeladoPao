import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './components/admin//atuhProvider.tsx' // Ajusta la ruta según tu estructura

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider> {/* ← ENVUELVE TODA LA APLICACIÓN */}
      <App />
    </AuthProvider>
  </React.StrictMode>,
)