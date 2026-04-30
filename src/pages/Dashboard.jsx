import React from 'react';
import { useAuth } from '../hooks/useAuth';
import './Dashboard.css';
import CreaAnnuncio from '../components/CreaAnnuncio';

export default function Dashboard() {
  // Prendiamo 'logout' dal nostro "Cervello" useAuth
  const { profilo, isAuthenticated, logout } = useAuth();

  // --- FUNZIONE PER USCIRE (LOGOUT) ---
  // Ora è semplicissima: chiama quella di useAuth che fa già tutto il lavoro sporco
  const handleLogoutClick = async () => {
    try {
      await logout(); 
    } catch (error) {
      console.error("Errore durante l'uscita:", error);
      // In caso di errore estremo, forziamo comunque il ritorno al login
      window.location.href = '/login';
    }
  };

  // --- SCHERMATA DI ATTESA (CARICAMENTO) ---
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

  const nomeVisualizzato = profilo.tipo_utente === 'societa' ? profilo.nome_asd : profilo.nome;

  return (
    <div className="dashboard-wrapper">
      
      {/* TESTATA (IL MENU IN ALTO) */}
      <header className="main-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo-ingaggio.png" alt="Logo" style={{ width: '40px', height: 'auto' }} />
          <h1 className="brand-name" style={{ color: '#1a7a3c', margin: 0, fontSize: '1.5rem', fontWeight: '900' }}>
            INGAGGIO
          </h1>
        </div>
        
        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="user-info-mini" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
            <span className="user-name-top" style={{ fontWeight: 'bold', color: '#1f2937' }}>{nomeVisualizzato}</span>
            <span className="user-tag" style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'capitalize' }}>
              {profilo.tipo_utente} | Municipio {profilo.municipio_num}
            </span>
          </div>
          <button 
            onClick={handleLogoutClick}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f1f3f5',
              color: '#495057',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Esci
          </button>
        </div>
      </header>

      <main className="dashboard-container" style={{ padding: '2rem' }}>
        
        {/* PARTE 1: BENVENUTO */}
        <section className="dashboard-welcome" style={{ marginBottom: '2rem' }}>
          <h2 className="welcome-text" style={{ color: '#1f2937', fontSize: '2rem' }}>
            Ciao {nomeVisualizzato}, cosa cerchiamo oggi?
          </h2>
        </section>

        {/* PARTE 2: IL MODULO PER CREARE ANNUNCI */}
        <section className="creation-section" style={{ marginBottom: '3rem' }}>
          <CreaAnnuncio />
        </section>

        {/* PARTE 3: LA BACHECA */}
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
