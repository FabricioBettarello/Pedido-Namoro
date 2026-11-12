import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { CasalProvider } from './casal'
import { casalDaRota } from './casais'
import './styles.css'

const casal = casalDaRota(window.location.pathname)

function NaoEncontrado() {
  return (
    <main className="nao-encontrado">
      <div className="bg-gradient" />
      <div className="nao-encontrado-card">
        <div className="nao-encontrado-emoji">💔</div>
        <h1>404</h1>
        <p>esse casal ainda não existe por aqui…</p>
      </div>
    </main>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  casal ? (
    <CasalProvider value={casal}>
      <App />
    </CasalProvider>
  ) : (
    <NaoEncontrado />
  ),
)
