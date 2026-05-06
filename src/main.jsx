import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

window.onerror = function(msg, src, line, col, err) {
  document.body.innerHTML = '<div style="background:#1a0000;color:#ff6b6b;padding:20px;font-family:monospace;font-size:12px;word-break:break-all;min-height:100vh">' +
    '<h2 style="color:#ff4444">ERRORE APP</h2>' +
    '<p><b>Messaggio:</b> ' + msg + '</p>' +
    '<p><b>File:</b> ' + src + '</p>' +
    '<p><b>Riga:</b> ' + line + ':' + col + '</p>' +
    '<p><b>Stack:</b> ' + (err && err.stack ? err.stack : 'N/A') + '</p>' +
    '</div>'
  return false
}

window.onunhandledrejection = function(e) {
  document.body.innerHTML = '<div style="background:#1a0000;color:#ff6b6b;padding:20px;font-family:monospace;font-size:12px;word-break:break-all;min-height:100vh">' +
    '<h2 style="color:#ff4444">ERRORE PROMISE</h2>' +
    '<p><b>Motivo:</b> ' + (e.reason ? e.reason.toString() : 'sconosciuto') + '</p>' +
    '<p><b>Stack:</b> ' + (e.reason && e.reason.stack ? e.reason.stack : 'N/A') + '</p>' +
    '</div>'
}

try {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch(e) {
  document.body.innerHTML = '<div style="background:#1a0000;color:#ff6b6b;padding:20px;font-family:monospace;font-size:12px;word-break:break-all;min-height:100vh">' +
    '<h2 style="color:#ff4444">CRASH AL CARICAMENTO</h2>' +
    '<p><b>Errore:</b> ' + e.message + '</p>' +
    '<p><b>Stack:</b> ' + e.stack + '</p>' +
    '</div>'
}
