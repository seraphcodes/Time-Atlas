import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import RomePage from './destination/RomePage.jsx'
import './home/home.css'
import './site/site.css'
import './destination/destination.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RomePage />
  </StrictMode>,
)
