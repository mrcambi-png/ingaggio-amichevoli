import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';

// Importiamo le pagine - CONTROLLA CHE I NOMI SIANO ESATTAMENTE QUESTI NELLA CARTELLA PAGES
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import AnnuncioDettaglio from './pages/AnnuncioDettaglio';

function App() {
  const { user, loading } = useAuth();

  // Mostriamo la schermata di loading solo se c'e' una sessione autenticata in corso di verifica.
  // Se non autenticato, forziamo subito il Login per evitare schermate bloccate dopo il logout.
  if (loading && user) {
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
        {/* Quando non autenticato, qualsiasi URL deve portare al Login */}
        {!user ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/annuncio/:id" element={<AnnuncioDettaglio />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
