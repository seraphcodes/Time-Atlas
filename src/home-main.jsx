import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Home from './home/Home.jsx'
import './home/home.css'
import './site/site.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Home />
  </StrictMode>,
)
