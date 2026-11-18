import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/tokens.css'
import '../styles/base.css'
import { Kit } from './Kit.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Kit />
  </StrictMode>,
)
