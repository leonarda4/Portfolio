import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './case-study.css'
import './footer.css'
import './components/StudyCharts.css'
import './theme.css'
import './project-theme.css'
import '../design-system/range.css'
import './page-layout.css'

if (import.meta.env.DEV) {
  import('designmode/auto')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
