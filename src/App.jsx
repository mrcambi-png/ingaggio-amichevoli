import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import ListaAnnunci from './components/ListaAnnunci'
import PubblicaAnnuncio from './components/PubblicaAnnuncio'
import AnnuncioDettaglio from './pages/AnnuncioDettaglio'
import './App.css'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()

  const dopoPublicazione = () => {
    navigate('/')
  }

  const onLista = location.pathname === '/'
  const onPubblica = location.pathname === '/pubblica'

  return (
    <div className="app">
      <header className="header">
        <span className="logo">ingaggio.</span>
        <nav>
          <Link
            className={onLista ? 'nav-btn attivo' : 'nav-btn'}
            to="/"
          >
            Annunci
          </Link>
          <Link
            className={onPubblica ? 'nav-btn attivo' : 'nav-btn'}
            to="/pubblica"
          >
            + Pubblica
          </Link>
        </nav>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<ListaAnnunci />} />
          <Route path="/pubblica" element={<PubblicaAnnuncio onSuccess={dopoPublicazione} />} />
          <Route path="/annuncio/:id" element={<AnnuncioDettaglio />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}