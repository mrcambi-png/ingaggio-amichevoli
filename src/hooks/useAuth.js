import { useState, useEffect, useRef } from 'react';
import supabase from '../supabaseClient';
 
export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  // Flag per evitare doppio fetch del profilo (React.StrictMode)
  const profileFetchedRef = useRef(false);
 
  // ---- EFFECT 1: Controllo autenticazione + caricamento profilo ATOMICO ----
  useEffect(() => {
    let isMounted = true;
 
    const initAuth = async () => {
      try {
        console.log('[useAuth] Inizio controllo autenticazione...');
 
        // Step 1: Ottieni utente loggato
        const {
          data: { user: currentUser },
          error: authError,
        } = await supabase.auth.getUser();
 
        if (authError) {
          console.error('[useAuth] Errore auth:', authError);
          if (isMounted) {
            setError(authError.message);
            setUser(null);
            setLoading(false);
          }
          return;
        }
 
        // Se nessun utente, stop
        if (!currentUser) {
          console.log('[useAuth] ℹ️ Nessun utente loggato');
          if (isMounted) {
            setUser(null);
            setError(null);
            setLoading(false);
          }
          return;
        }
 
        console.log('[useAuth] ✓ Utente trovato:', currentUser.email);
 
        // Step 2: Carica profilo ATOMICAMENTE (UNA SOLA VOLTA)
        if (!profileFetchedRef.current) {
          profileFetchedRef.current = true;
 
          const { data: profilo, error: profileError } = await supabase
            .from('profili_societa')
            .select('id, utente_id, nome_asd, categoria_figc, municipio_num, indirizzo')
            .eq('utente_id', currentUser.id)
            .maybeSingle(); // Ritorna null se 0 risultati, non crasha
 
          // Se errore grave (RLS, permessi)
          if (profileError) {
            console.error('[useAuth] ERRORE profilo:', profileError);
            if (isMounted) {
              setError(`Errore RLS: ${profileError.message}`);
              setUser(currentUser); // Loggato MA senza profilo
              setLoading(false);
            }
            return;
          }
 
          // Se profilo non esiste
          if (!profilo) {
            console.warn('[useAuth] Profilo non trovato per:', currentUser.id);
            if (isMounted) {
              setError('Profilo società non trovato');
              setUser(currentUser); // Loggato MA senza profilo
              setLoading(false);
            }
            return;
          }
 
          // SUCCESSO: Profilo caricato
          console.log('[useAuth] ✓ Profilo caricato:', profilo.nome_asd);
          if (isMounted) {
            setUser({
              ...currentUser,
              profilo_societa: profilo,
            });
            setError(null);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('[useAuth] Errore sconosciuto:', err);
        if (isMounted) {
          setError('Errore sconosciuto durante autenticazione');
          setUser(null);
          setLoading(false);
        }
      }
    };
 
    initAuth();
 
    return () => {
      isMounted = false;
    };
  }, []); // UNA SOLA VOLTA al montaggio
 
 // ---- EFFECT 2: Ascolta cambiamenti auth (login/logout) ----
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((evento, sessione) => {
    console.log('[useAuth] Auth event:', evento);

    if (evento === 'SIGNED_IN') {
      console.log('[useAuth] ✓ SIGNED_IN - Ricarico profilo...');
      setUser(sessione.user);
      setError(null);
      profileFetchedRef.current = false;

      // Rilancia il fetch del profilo subito dopo il login
      (async () => {
        const { data: profilo } = await supabase
        .from('profili_societa')
        .select('id, utente_id, nome_asd, categoria_figc, municipio_num, indirizzo')
        .eq('utente_id', sessione.user.id)
        .maybeSingle();

        if (profilo) {
          console.log('[useAuth] ✓ Profilo caricato post-login:', profilo.nome_asd);
          setUser(prev => ({...prev, profilo_societa: profilo }));
        } else {
          console.warn('[useAuth] Profilo non trovato post-login');
          setError('Profilo società non trovato');
        }
        setLoading(false);
      })();
    } else if (evento === 'SIGNED_OUT') {
      console.log('[useAuth] ✓ SIGNED_OUT');
      setUser(null);
      setError(null);
      profileFetchedRef.current = false;
    } else if (evento === 'TOKEN_REFRESHED') {
      console.log('[useAuth] 🔄 TOKEN_REFRESHED');
      setUser(sessione.user);
    }
  });

  return () => {
    subscription?.unsubscribe();
  };
}, []); // Dipendenze vuote - solo al mount
 
// ---- FUNZIONE: Login ----
const accedi = async (email, password) => {
  setLoading(true);
  setError(null);
  
  try {
    console.log('[useAuth] Inizio login per:', email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error('[useAuth] Errore login:', error.message);
      setError(error.message);
      setLoading(false);
      return false;
    }

    // Successo - reset il flag così il profilo viene ricaricato
    console.log('[useAuth] ✓ Login riuscito');
    profileFetchedRef.current = false;
    setUser(data.user);
    setError(null);
    setLoading(false);
    return true;

  } catch (err) {
    console.error('[useAuth] Errore sconosciuto in login:', err);
    setError('Errore sconosciuto durante il login');
    setLoading(false);
    return false;
  }
};
 
  // ---- FUNZIONE: Registrazione ----
  const registrati = async (email, password) => {
    setLoading(true);
    setError(null);
 
    try {
      console.log('[useAuth] Inizio registrazione per:', email);
 
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });
 
      if (signupError) {
        console.error('[useAuth] Errore signup:', signupError.message);
        setError(signupError.message);
        setLoading(false);
        return false;
      }
 
      console.log('[useAuth] ✓ Registrazione riuscita');
      setUser(data.user || null);
      setError(null);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('[useAuth] Errore sconosciuto in registrazione:', err);
      setError('Errore sconosciuto durante la registrazione');
      setLoading(false);
      return false;
    }
  };
 
  // ---- FUNZIONE: Logout atomico ----
  const esci = async () => {
    setLoading(true);
    setError(null);
 
    try {
      console.log('[useAuth] Inizio logout atomico...');
 
      // Step 1: SignOut su Supabase
      await supabase.auth.signOut();
 
      // Pulisce token Supabase e tutto il localStorage
const projectRef = import.meta.env.VITE_SUPABASE_URL.split('//')[1].split('.')[0];
localStorage.removeItem(`sb-${projectRef}-auth-token`);
 
      // Step 3: Cancella cookie
      if (typeof document !== 'undefined') {
        document.cookie.split(';').forEach((cookie) => {
          const eqPos = cookie.indexOf('=');
          const nome = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          document.cookie = `${nome}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.${window.location.hostname}`;
        });
      }
 
      // Step 4: Aspetta sincronizzazione
      await new Promise((resolve) => setTimeout(resolve, 200));
 
      // Step 5: Pulisci state e flag
      setUser(null);
      setError(null);
      profileFetchedRef.current = false;
 
      console.log('[useAuth] ✓ Logout atomico completato');
      return true;
    } catch (err) {
      console.error('[useAuth] Errore logout:', err);
      setError('Errore sconosciuto durante il logout');
      setLoading(false);
      return false;
    } finally {
      setLoading(false);
    }
  };
 
  return {
    user,
    loading,
    error,
    accedi,
    registrati,
    esci,
    };
}
 