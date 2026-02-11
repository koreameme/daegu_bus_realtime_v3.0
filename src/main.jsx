import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

console.log("[DEBUG] React app mounting...");
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
console.log("[DEBUG] React app mounted.");
