import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <-- Importa BrowserRouter
import './index.css'
import App from './App.tsx'
import './app.css';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter> {/* <-- Envuelve tu componente App aquí */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)