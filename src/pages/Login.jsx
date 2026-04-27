import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [caricamento, setCaricamento] = useState(false);
  
  // Recuperiamo le funzioni dal motore useAuth
  const auth = useAuth(); 

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    
    // DIAGNOSTICA: Se il motore è rotto, ce lo dice subito
    if (!auth.login && !auth.signIn) {
      alert("ERRORE TECNICO: Il motore di login non è collegato correttamente. Controlla useAuth.js");
      return;
    }

    if (!email || !password) {
      alert("Mancano i dati: inserisci email e password.");
      return;
    }

    setCaricamento(true);
    const loginFunction = auth.login || auth.signIn;

    try {
      const result = await loginFunction(email, password);
      
      if (result && result.success) {
        console.log("Accesso riuscito!");
        // Il reindirizzamento avviene automaticamente in App.jsx
      } else {
        alert("ACCESSO NEGATO: " + (result?.error || "Credenziali errate o utente non confermato."));
      }
    } catch (err) {
      alert("ERRORE DI CONNESSIONE: " + err.message);
    } finally {
      setCaricamento(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      height: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'sans-serif' 
    }}>
      
      <img src="/logo-ingaggio.png" alt="Logo" style={{ height: '140px', marginBottom: '30px' }} />
      
      <div style={{ 
        background: 'white', padding: '40px', borderRadius: '20px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '350px' 
      }}>
        <h2 style={{ color: '#1a7a3c', textAlign: 'center', marginBottom: '30px', fontWeight: 'bold' }}>
            Entra in Campo
        </h2>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'bold' }}>Email</label>
            <input 
              type="email" 
              placeholder="Inserisci la tua email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} 
              required 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'bold' }}>Password</label>
            <input 
              type="password" 
              placeholder="Inserisci la password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={caricamento}
            style={{ 
              padding: '14px', backgroundColor: '#1a7a3c', color: white, border: 'none', 
              borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' 
            }}
          >
            {caricamento ? 'FISCHIO D\'INIZIO...' : 'LOGIN'}
          </button>
        </form>
      </div>
      
      <p style={{ marginTop: '25px', color: '#666', fontSize: '0.9rem' }}>
        Non hai un account? <a href="https://ingaggio.com" target="_blank" rel="noreferrer" 
        style={{ color: '#1a7a3c', fontWeight: 'bold', textDecoration: 'none' }}>Registrati</a>
      </p>
    </div>
  );
}
