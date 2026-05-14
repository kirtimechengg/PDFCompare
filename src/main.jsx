import React from 'react'
import ReactDOM from 'react-dom/client'
import * as pdfjsLib from 'pdfjs-dist'
import App from './App'
import './index.css'

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
