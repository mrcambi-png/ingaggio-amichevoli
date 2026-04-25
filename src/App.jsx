import { useState } from 'react'
import ListaAnnunci from './components/ListaAnnunci'
import PubblicaAnnuncio from './components/PubblicaAnnuncio'
import './App.css'

export default function App() {
  const [pagina, setPagina] = useState('lista')
  const [aggiorna, setAggiorna] = useState(0)

  const dopoPublicazione = () => {
    setAggiorna(a => a + 1)
    setPagina('lista')
  }

  return (
    <div className="app">
      <header className="header">
        <span className="logo">ingaggio.</span>
        <nav>
          <button
            className={pagina === 'lista' ? 'nav-btn attivo' : 'nav-btn'}
            onClick={() => setPagina('lista')}
          >
            Annunci
          </button>
          <button
            className={pagina === 'pubblica' ? 'nav-btn attivo' : 'nav-btn'}
            onClick={() => setPagina('pubblica')}
          >
            + Pubblica
          </button>
        </nav>
      </header>

      <main className="main">
        {pagina === 'lista' && <ListaAnnunci key={aggiorna} />}
        {pagina === 'pubblica' && <PubblicaAnnuncio onSuccess={dopoPublicazione} />}
      </main>
    </div>
  )
}