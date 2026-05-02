import React from 'react';
import useAuth from '../hooks/useAuth';
import './Dashboard.css';
import PubblicaAnnuncio from '../components/PubblicaAnnuncio';
import ListaAnnunci from '../components/ListaAnnunci'; 

export default function Dashboard() {
  const { user, loading, error, esci } = useAuth();

  const handleLogoutClick = async () => {
    try {
      await esci(); 
    } catch (error) {
      console.error("Errore durante l'uscita:", error);
      window.location.href = '/login';
    }
  };

  if (!user) {
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

  // Dopo il if (!user) esitente, aggiungi:
  if (error && !user?.profilo_societa) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#fff3cd', color: '#856404' }}>
        <h2>⚠️ Errore Profilo</h2>
        <p>{error}</p>
        <button onClick={esci}>Esci e riprova</button>
      </div>
    );
  }

  const profilo = user?.profilo_societa;
  const nomeVisualizzato = !profilo ? 'Caricamento...' : profilo.nome_asd;

  return (
    <div className="dashboard-wrapper">
      
      <header className="main-header" style={{
  backgroundColor: 'white',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
}}>
  <style>{`
    @media (min-width: 768px) {
      .header-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 1rem 2rem;
        width: 100%;
        box-sizing: border-box;
      }
      .header-row-1 {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin: 0 !important;
        padding: 0 !important;
      }
      .header-left {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
      }
      .logout-btn {
        flex-shrink: 0;
      }
      .user-info-mini {
        text-align: left !important;
        padding: 0 !important;
        margin: 0 !important;
        width: 100%;
        margin-top: 1rem !important;
      }
    }
  `}</style>
  
  <div className="header-wrapper">
    {/* Riga 1: Logo + Esci (con spazio tra loro) */}
    <div className="header-row-1">
      <div className="header-left">
        <img src="/logo-ingaggio.png" alt="Logo" style={{ width: '40px', height: 'auto' }} />
        <h1 className="brand-name" style={{ color: '#1a7a3c', margin: 0, fontSize: '1.5rem', fontWeight: '900' }}>
          INGAGGIO
        </h1>
      </div>
      
      <button 
        onClick={handleLogoutClick}
        className="logout-btn"
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
  </div>
  
  {/* Riga 2: Nome società + Municipio (sotto, full width) */}
  <div className="user-info-mini" style={{ 
    textAlign: 'left',
    lineHeight: '1.3',
    padding: '0 2rem 1rem 2rem',
    boxSizing: 'border-box',
    width: '100%'
  }}>
    <span className="user-name-top" style={{ 
      fontWeight: '700', 
      color: '#1f2937',
      fontSize: '16px',
      display: 'block'
    }}>
      {nomeVisualizzato}
    </span>
    {profilo && (
      <span className="user-tag" style={{ 
        fontSize: '14px', 
        color: '#6b7280',
        display: 'block'
      }}>
        Municipio {profilo.municipio_num}
      </span>
    )}
  </div>
</header>

      <main className="dashboard-container" style={{ padding: '2rem' }}>
        
        <section className="dashboard-welcome" style={{ marginBottom: '2rem' }}>
          <h2 className="welcome-text" style={{ color: '#1f2937', fontSize: '2rem' }}>
            Ciao {nomeVisualizzato}, cosa cerchiamo oggi?
          </h2>
        </section>

        <section className="creation-section" style={{ marginBottom: '3rem' }}>
        <PubblicaAnnuncio societaId={user?.id} />
        </section>

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
              <ListaAnnunci />
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}