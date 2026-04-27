import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [caricamento, setCaricamento] = useState(false);
  
  // Prendiamo login e error dal nostro hook
  const { login, error } = useAuth(); 

  const handleLogin = async (e) => {
    // Impediamo alla pagina di ricaricarsi (molto importante!)
    if (e) e.preventDefault();
    
    if (!email || !password) {
      alert("Per favore, inserisci sia l'email che la password");
      return;
    }

    setCaricamento(true);
    console.log("Tentativo di accesso per:", email);

    try {
      // Usiamo la funzione login che abbiamo sistemato nel motore
      const result = await login(email, password);
      
      if (result && result.success) {
        console.log("Accesso riuscito!");
        // App.jsx si accorgerà del cambio e ti manderà in Dashboard
      } else {
        // Se c'è un errore specifico da Supabase lo mostriamo
        const messaggioErrore = result?.error || "Credenziali non valide. Riprova.";
        alert("Ops! " + messaggioErrore);
      }
    } catch (err) {
      console.error("Errore tecnico durante il login:", err);
      alert("Errore di connessione. Riprova tra poco.");
    } finally {
      setCaricamento(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#1a7a3c', // Messo lo sfondo verde come da tuo desiderio
      fontFamily: 'sans-serif'
    }}>
      {/* LOGO - Percorso diretto per la cartella public */}
      <img
        src="/logo-ingaggio.png"
        alt="Logo"
        style={{ height: '150px', marginBottom: '30px' }}
      />
      
      <div style={{ 
        background: 'white', 
        padding: '40px', 
        borderRadius: '24px', 
        boxShadow: '0 20px 25px rgba(0,0,0,0.2)', 
        width: '90%',
        maxWidth: '380px'
      }}>
        <h2 style={{ color: '#1a7a3c', textAlign: 'center', marginBottom: '30px', fontWeight: '800' }}>
          Entra in Campo
        </h2>
        
        {/* Form con onSubmit: così funziona anche premendo INVIO sulla tastiera */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: 'bold' }}>Email</label>
            <input 
              type="email" 
              placeholder="Inserisci la tua email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              style={{ padding: '14px', borderRadius: '12px', border: '1px solid #d1d5db', fontSize: '1rem' }} 
              required 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: 'bold' }}>Password</label>
            <input 
              type="password" 
              placeholder="Inserisci la password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={{ padding: '14px', borderRadius: '12px', border: '1px solid #d1d5db', fontSize: '1rem' }} 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={caricamento}
            style={{ 
              padding: '16px', 
              backgroundColor: '#1a7a3c', 
              color: 'white', 
              border: 'none', 
              borderRadius: '12px', 
              fontWeight: 'bold', 
              fontSize: '1.1rem',
              cursor: caricamento ? 'not-allowed' : 'pointer',
              marginTop: '10px',
              transition: 'all 0.3s ease',
              opacity: caricamento ? 0.7 : 1
            }}
          >
            {caricamento ? 'FISCHIO D\'INIZIO...' : 'LOGIN'}
          </button>
        </form>
      </div>
      
      <p style={{ marginTop: '25px', color: 'white', fontSize: '1rem' }}>
        Non hai un account?{' '}
        <a
          href="https://ingaggio.com/"
          target="_blank"
          rel="noreferrer"
          style={{ color: 'white', fontWeight: 'bold', textDecoration: 'underline' }}
        >
          Registrati
        </a>
      </p>
    </div>
  );
}
