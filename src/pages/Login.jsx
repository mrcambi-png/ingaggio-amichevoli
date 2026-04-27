import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [caricamento, setCaricamento] = useState(false);
  
  const { login } = useAuth(); // Usiamo la funzione 'login' dal nostro hook
  const navigate = useNavigate();

  const gestisciLogin = async (e) => {
    // 1. Questo comando è fondamentale per far funzionare il tasto INVIO senza ricaricare la pagina
    e.preventDefault(); 
    
    setCaricamento(true);
    console.log("Tentativo di accesso per:", email);

      try {
      const result = await login(email, password);
      
      if (result.success) {
        console.log("Accesso riuscito!");
        navigate('/dashboard', { replace: true });
      } else {
        alert("Ops! Qualcosa è andato storto: " + (result.error || "Controlla i dati"));
      }

    } catch (err) {
      console.error("Errore tecnico:", err);
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
      height: '100vh', 
      backgroundColor: '#f8f9fa',
      fontFamily: 'sans-serif'
    }}>
      {/* LOGO PIÙ GRANDE */}
      <img
        src={`${import.meta.env.BASE_URL}logo-ingaggio.png`}
        alt="Logo"
        style={{ height: '120px', marginBottom: '20px' }}
      />
      
      <div style={{ 
        background: 'white', 
        padding: '40px', 
        borderRadius: '20px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
        width: '350px' 
      }}>
        <h2 style={{ color: '#1a7a3c', textAlign: 'center', marginBottom: '30px' }}>Entra in Campo</h2>
        
        {/* Usiamo il tag <form> così il tasto INVIO del PC funziona in automatico! */}
        <form onSubmit={gestisciLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'bold' }}>Email</label>
            <input 
              type="email" 
              placeholder="Inserisci la tua email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outlineColor: '#1a7a3c' }} 
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
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outlineColor: '#1a7a3c' }} 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={caricamento}
            style={{ 
              padding: '14px', 
              backgroundColor: '#1a7a3c', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: '10px',
              transition: 'background 0.3s'
            }}
          >
            {caricamento ? 'ENTRATA IN CORSO...' : 'LOGIN'}
          </button>
        </form>
      </div>
      
      <p style={{ marginTop: '20px', color: '#666', fontSize: '0.9rem' }}>
        Non hai un account? <span style={{ color: '#1a7a3c', fontWeight: 'bold', cursor: 'pointer' }}>Registrati</span>
      </p>
    </div>
  );
}
