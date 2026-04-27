import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const { profilo, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  // VERSIONE ATOMICA DEL LOGOUT
  const handleLogout = async () => {
    try {
      // 1. Puliamo subito la memoria locale (il borsone dei dati)
      localStorage.clear();
      sessionStorage.clear();
      
      // 2. Cancelliamo i cookie di sessione a mano
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // 3. Diciamo a Supabase di chiudere, ma non aspettiamo che finisca con calma
      signOut(); 
      
      // 4. Spingiamo l'utente verso il login in modo forzato ricaricando la pagina
      window.location.href = '/login'; 
      
    } catch (error) {
      console.error("Errore durante l'uscita:", error);
      window.location.href = '/login';
    }
  };

  if (!isAuthenticated || !profilo) {
    return (
      <div className="loading-screen" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#1a7a3c', fontWeight: 'bold' }}>
        Caricamento del tuo stadio... ⚽
      </div>
    );
  }

  const nomeVisualizzato = profilo.tipo_utente === 'societa' ? profilo.nome_asd : profilo.nome;

  return (
    <div className="dashboard-wrapper">
      
      {/* TESTATA (HEADER) */}
      <header className="main-header">
        <div className="header-left">
          <img src="/logo-ingaggio.png" alt="Logo" className="header-logo" />
          <h1 className="brand-name">INGAGGIO</h1>
        </div>
        
        <div className="header-right">
          <div className="user-info-mini">
            <span className="user-name-top">{nomeVisualizzato}</span>
            <span className="user-tag">{profilo.tipo_utente} | Mun. {profilo.municipio_num}</span>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Esci 🚪
          </button>
        </div>
      </header>

      <main className="dashboard-container">
        {/* BENVENUTO */}
        <section className="dashboard-welcome">
          <h2 className="welcome-text">
            {nomeVisualizzato}, cosa cerchiamo oggi?
          </h2>
        </section>

        {/* AREA ANNUNCI CON FRECCIA */}
        <section className="dashboard-content">
          <div className="bacheca-placeholder">
            <h3 style={{ color: '#1a7a3c' }}>📍 Bacheca Annunci</h3>
            <div className="empty-state">
              <p>I match per te stanno arrivando...</p>
              <div className="bacheca-arrow">↓</div>
              <div className="loader-bar"></div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
