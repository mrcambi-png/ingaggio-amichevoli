import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Questo è il percorso corretto per risalire di una cartella e trovare il client
import { supabase } from '../supabaseClient';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Log di debug per vedere se il processo parte
    console.log("Tentativo di accesso per:", email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        console.log("Login effettuato con successo!");
        // Dopo il login, ti manda alla dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Errore durante il login:", error.message);
      alert("Errore: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f8f9fa' 
    }}>
      <div style={{ 
        padding: '40px', 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img src="/logo-ingaggio.png" alt="Logo Ingaggio" style={{ height: '60px' }} />
          <h2 style={{ color: '#1a7a3c', marginTop: '10px' }}>INGAGGIO</h2>
          <p style={{ color: '#666' }}>Marketplace Calcio Romano</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
            <input 
              type="email" 
              placeholder="Inserisci la tua email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
            <input 
              type="password" 
              placeholder="Inserisci la password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '12px', 
              backgroundColor: '#1a7a3c', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'VERIFICA IN CORSO...' : 'ENTRA IN CAMPO'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
          Non hai un account? <a href="https://ingaggio.com" style={{ color: '#1a7a3c', fontWeight: 'bold' }}>Registrati sulla Landing</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
