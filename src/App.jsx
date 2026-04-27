import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Importiamo le pagine - CONTROLLA CHE I NOMI SIANO ESATTAMENTE QUESTI NELLA CARTELLA PAGES
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import AnnuncioDettaglio from './pages/AnnuncioDettaglio';

function App() {
  const { isAuthenticated, loading } = useAuth();

  // Questa è la pagina verde che vedi per un secondo
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundColor: '#1a7a3c', 
        color: 'white',
        fontFamily: 'sans-serif'
      }}>
        <h1>Fischio d'inizio... ⚽</h1>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Se non sono loggato vado a Login, altrimenti Dashboard */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        
        {/* Pagina dettaglio annuncio */}
        <Route path="/annuncio/:id" element={<AnnuncioDettaglio />} />

        {/* Rotta di emergenza: se l'indirizzo è sbagliato rimanda al Login */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
