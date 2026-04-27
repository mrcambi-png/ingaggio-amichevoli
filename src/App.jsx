import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import AnnuncioDettaglio from './pages/AnnuncioDettaglio'; // AGGIUNTO QUESTO

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1a7a3c', color: 'white' }}>
        Fischio d'inizio... ⚽
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Pagina di Login */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        
        {/* Pagina Dashboard (Protetta) */}
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        
        {/* NUOVA PAGINA DETTAGLIO */}
        <Route path="/annuncio/:id" element={<AnnuncioDettaglio />} />
        
        {/* Rotta di default */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
