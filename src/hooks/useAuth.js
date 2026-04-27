import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [profilo, setProfilo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Carica la sessione all'inizio (Fischio d'inizio)
  useEffect(() => {
    const caricaSessione = async () => {
      setLoading(true);
      try {
        const sessione = await authService.getSessione();
        if (sessione) {
          setUser(sessione.user);
          setProfilo(sessione.profilo);
        }
      } catch (err) {
        console.error("Errore sessione:", err);
      } finally {
        setLoading(false);
      }
    };
    caricaSessione();
  }, []);

  // 2. Funzione per entrare (Login)
    const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.signIn(email, password);

      if (result.success) {
        setUser(result.user);
        setProfilo(result.profilo);
        setLoading(false);
        return result; // <--- FONDAMENTALE: restituisce il successo al componente Login
      } else {
        setError(result.error);
        setLoading(false);
        return result; // <--- Restituisce l'errore
      }
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, []);

  // 3. Funzione per uscire (D'ora in poi si chiama signOut per tutti!)
  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      const result = await authService.signOut();
      if (result.success) {
        // RESET TOTALE: Svuotiamo tutto
        setUser(null);
        setProfilo(null);
        setError(null);
      }
      return result;
    } catch (err) {
      console.error("Errore durante il logout:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    profilo,
    loading,
    error,
    login,
    signOut, // <--- ADESSO SI CHIAMA SIGN-OUT, PROPRIO COME NELLA DASHBOARD!
    isAuthenticated: !!user
  };
};
