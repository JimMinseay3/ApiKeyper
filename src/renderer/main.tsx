import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ThemeProvider } from '@/shared/ThemeContext'
import { ToastProvider } from '@/shared/ToastContext'
import { KeyboardProvider } from '@/shared/KeyboardContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <KeyboardProvider>
          <App />
        </KeyboardProvider>
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
