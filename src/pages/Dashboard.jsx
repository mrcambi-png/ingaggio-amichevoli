import React from 'react';
import { useAuth } from '../hooks/useAuth';
import './Dashboard.css';

export default function Dashboard() {
  const { profilo, isAuthenticated, login, logout } = useAuth(); // Usiamo logout che è il nome standard

  // VERSIONE ATOMICA DEL LOGOUT (Senza errori di navigazione)
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

      // 3. Diciamo a Supabase di chiudere la sessione
      await logout(); 
      
      // 4. FORZIAMO il ritorno al login pulendo tutto il browser
      window.location.href = '/login'; 
      
    } catch (error) {
      console.error("Errore durante l'uscita:", error);
      window.location.href = '/login';
    }
  };

  // Se non siamo loggati o i dati non sono pronti, mostriamo il caricamento
  if (!isAuthenticated || !profilo) {
    return (
      <div className="loading-screen" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundColor: '#f8fafc',
        color: '#1a7a3c', 
        fontWeight: 'bold',
        flexDirection: 'column'
      }}>
        <p style={{ fontSize: '1.2rem' }}>Caricamento del tuo stadio... ⚽</p>
      </div>
    );
  }

  // Capisce se deve mostrare il nome dell'ASD o il nome del calciatore/staff
  const nomeVisualizzato = profilo.tipo_utente === 'societa' ? profilo.nome_asd : profilo.nome;

  return (
    <div className="dashboard-wrapper">
      
      {/* TESTATA (HEADER) */}
      <header className="main-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/logo-ingaggio.png"
            alt="Logo"
            style={{ width: '40px', height: 'auto' }}
          />
          <h1 className="brand-name" style={{ color: '#1a7a3c', margin: 0, fontSize: '1.5rem', fontWeight: '900' }}>
            INGAGGIO
          </h1>
        </div>
        
        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="user-info-mini" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
            <span className="user-name-top" style={{ fontWeight: 'bold', color: '#1f2937' }}>{nomeVisualizzato}</span>
            <span className="user-tag" style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'capitalize' }}>
              {profilo.tipo_utente} | Mun. {profilo.municipio_num}
            </span>
          </div>
          <button 
            onClick={handleLogout} 
            className="btn-logout"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Esci 🚪
          </button>
        </div>
      </header>

      <main className="dashboard-container" style={{ padding: '2rem' }}>
        {/* BENVENUTO */}
        <section className="dashboard-welcome" style={{ marginBottom: '2rem' }}>
          <h2 className="welcome-text" style={{ color: '#1f2937', fontSize: '2rem' }}>
            Ciao {nomeVisualizzato}, cosa cerchiamo oggi?
          </h2>
        </section>

        {/* AREA ANNUNCI (Placeholder per ora) */}
        <section className="dashboard-content">
          <div className="bacheca-placeholder" style={{
            background: 'white',
            padding: '3rem',
            borderRadius: '16px',
            textAlign: 'center',
            border: '2px dashed #1a7a3c'
          }}>
            <h3 style={{ color: '#1a7a3c', marginBottom: '1rem' }}>📍 Bacheca Annunci</h3>
            <div className="empty-state">
              <p style={{ color: '#6b7280' }}>I match per te stanno arrivando...</p>
              <div style={{ fontSize: '2rem', margin: '1rem 0' }}>↓</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
