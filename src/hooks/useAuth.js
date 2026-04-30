import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profilo, setProfilo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const caricaSessione = async () => {
      setLoading(true);
      try {
        const sessione = await authService.getSessione();
        if (sessione) {
          setUser(sessione.user);
          setProfilo(sessione.profilo);
        } else {
          setUser(null);
          setProfilo(null);
        }
      } catch (err) {
        console.error("Errore sessione:", err);
      } finally {
        setLoading(false);
      }
    };

    caricaSessione();

    const { data: subscriptionData } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          const profiloAggiornato = await authService.caricaProfilo(session.user.id);
          setUser(session.user);
          setProfilo(profiloAggiornato);
        } else {
          setUser(null);
          setProfilo(null);
        }
      } catch (err) {
        console.error('Errore onAuthStateChange:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => subscriptionData?.subscription?.unsubscribe?.();
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    let timeoutId;
    try {
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Timeout login: Supabase non ha risposto in tempo'));
        }, 40000);
      });

      const result = await Promise.race([authService.signIn(email, password), timeoutPromise]);

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
      console.error('Errore login:', err);
      setLoading(false);
      return { success: false, error: err.message };
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      const result = await authService.signOut();
      if (result.success) {
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

  const value = useMemo(() => ({
    user,
    profilo,
    loading,
    error,
    login,
    signOut,
    logout: signOut,
    isAuthenticated: !!user
  }), [user, profilo, loading, error, login, signOut]);

  return createElement(AuthContext.Provider, { value }, children);
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere usato dentro AuthProvider');
  }
  return context;
};
