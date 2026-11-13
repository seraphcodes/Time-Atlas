import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import About from './about/About.jsx'
import './home/home.css'
import './site/site.css'
import './about/about.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <About />
  </StrictMode>,
)
