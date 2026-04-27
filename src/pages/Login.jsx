import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [caricamento, setCaricamento] = useState(false);
  const [erroreLogin, setErroreLogin] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    console.log("--> FORM INVIATO CON:", email);
    e.preventDefault();
    if (caricamento) return;
    setErroreLogin('');

    if (!email || !password) {
      alert("Mancano i dati: inserisci email e password.");
      return;
    }

    setCaricamento(true);

    try {
      console.log("Tentativo di login in corso...");
      const result = await login(email, password);
      
      if (result && result.success) {
        navigate('/dashboard', { replace: true });
      } else {
        const messaggioErrore = result?.error || "Credenziali errate o utente non confermato.";
        console.error('Errore login:', messaggioErrore);
        setErroreLogin(messaggioErrore);
        alert("ACCESSO NEGATO: " + messaggioErrore);
      }
    } catch (err) {
      console.error("Errore login:", err);
      setErroreLogin(err.message || 'Errore di connessione');
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
      
      <img src={`${import.meta.env.BASE_URL}logo-ingaggio.png`} alt="Logo" style={{ height: '140px', marginBottom: '30px' }} />
      
      <div style={{ 
        background: 'white', padding: '40px', borderRadius: '20px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '350px' 
      }}>
        <h2 style={{ color: '#1a7a3c', textAlign: 'center', marginBottom: '30px', fontWeight: 'bold' }}>
            Entra in Campo
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              padding: '14px', backgroundColor: '#1a7a3c', color: 'white', border: 'none', 
              borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: caricamento ? 'not-allowed' : 'pointer',
              opacity: caricamento ? 0.85 : 1
            }}
          >
            {caricamento ? 'FISCHIO D\'INIZIO...' : 'LOGIN'}
          </button>
          {erroreLogin && (
            <p style={{ color: '#c62828', fontSize: '0.85rem', margin: 0 }}>
              {erroreLogin}
            </p>
          )}
        </form>
      </div>
      
      <p style={{ marginTop: '25px', color: '#666', fontSize: '0.9rem' }}>
        Non hai un account? <a href="https://ingaggio.com" target="_blank" rel="noreferrer" 
        style={{ color: '#1a7a3c', fontWeight: 'bold', textDecoration: 'none' }}>Registrati</a>
      </p>
    </div>
  );
}
