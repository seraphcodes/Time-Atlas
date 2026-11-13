import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import GizaPage from './destination/GizaPage.jsx'
import './home/home.css'
import './site/site.css'
import './destination/destination.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GizaPage />
  </StrictMode>,
)
