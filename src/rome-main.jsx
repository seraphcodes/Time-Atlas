import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import RomeApp from './rome/RomeApp.jsx'
import './styles/global.css'
import './rome/rome.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RomeApp />
  </StrictMode>,
)
