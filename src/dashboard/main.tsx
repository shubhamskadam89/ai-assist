import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import Dashboard from './Dashboard'
import '../popup/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <HashRouter>
            <Dashboard />
        </HashRouter>
    </React.StrictMode>,
)
