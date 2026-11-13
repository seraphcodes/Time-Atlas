import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Explore from './explore/Explore.jsx'
import './home/home.css'
import './site/site.css'
import './explore/explore.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Explore />
  </StrictMode>,
)
