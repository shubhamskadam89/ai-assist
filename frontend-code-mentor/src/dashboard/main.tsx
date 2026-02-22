import React from 'react'
import ReactDOM from 'react-dom/client'
import Dashboard from './Dashboard'
import '../popup/index.css' // Reuse the same global styles and Tailwind config

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Dashboard />
    </React.StrictMode>
)
