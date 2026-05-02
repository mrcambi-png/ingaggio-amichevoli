import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { accedi, loading, error, user } = useAuth();
  const navigate = useNavigate();
 // Se useAuth sta ancora caricando, fermiamo tutto e mostriamo un'attesa
 if (loading) {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <p>Verifica sessione in corso...</p>
    </div>
  );
}

// Se l'utente è già loggato, scappiamo alla dashboard
// (Questo sostituisce il tuo vecchio useEffect)
if (user) {
  navigate('/dashboard');
  return null;
}
// ---------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Chiamiamo la funzione di login
    const result = await accedi(email, password);

    // 2. Controllo successo (Riga 24-28 nel tuo vecchio file)
    // Aggiungiamo il controllo su result.data per essere sicuri
    if (result && (result.success || result.data?.user)) {
      console.log("Login OK! Vado in Dashboard...");
      // Usiamo window.location invece di navigate per "pulire" la memoria
      window.location.href = '/dashboard'; 
    } else {
      // Se fallisce, il pulsante deve tornare cliccabile
      console.error("Login fallito o dati errati");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'sans-serif' }}>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '350px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img src="/logo-ingaggio.png" alt="Logo" style={{ width: '50px' }} />
          <h2 style={{ color: '#1a7a3c', margin: '10px 0' }}>INGAGGIO</h2>
        </div>

        {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '16px' }}>
  {error === 'Auth session missing!' ? 'Entra in campo!' : error}
</p>}

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem' }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} required />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem' }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} required />
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: '#1a7a3c', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? 'VERIFICA IN CORSO...' : 'ACCEDI'}
        </button>
      </form>
    </div>
  );
}
