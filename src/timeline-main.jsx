import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Timeline from './timeline/Timeline.jsx'
import './home/home.css'
import './site/site.css'
import './timeline/timeline.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Timeline />
  </StrictMode>,
)
