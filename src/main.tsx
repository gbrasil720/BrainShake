import { createRoot } from 'react-dom/client'
import App from '@/app/App'
import '@/styles/globals.css'
import '@/styles/canvas.css'
import '@/styles/markdown.css'
import '@/styles/design-system.css'

createRoot(document.getElementById('root')!).render(<App />)
