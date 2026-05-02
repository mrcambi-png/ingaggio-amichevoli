import { useState, useEffect } from 'react';
import supabase from '../supabaseClient';

export default function CreaAnnuncio() {
  // ---- I NOSTRI MATTONCINI (Stato) ----
  const [annuncio, setAnnuncio] = useState({
    indirizzo: '',
    nome_asd: '',
    titolo: '',
    descrizione: '',
  });

  const [user, setUser] = useState(null);
  const [loadingProfilo, setLoadingProfilo] = useState(false); // Carica il profilo
  const [loadingSalvataggio, setLoadingSalvataggio] = useState(false); // Salva l'annuncio
  const [errore, setErrore] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // ---- STEP 1: CHI È L'UTENTE? ----
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        if (error || !currentUser) {
          setErrore('Ops! Non sei loggato. Torna al login.');
          return;
        }
        setUser(currentUser);
      } catch (err) {
        setErrore('Errore di autenticazione');
      }
    };
    checkUser();
  }, []);

  // ---- STEP 2: CERCHIAMO IL PROFILO (Senza crashare!) ----
  useEffect(() => {
    // Se non sappiamo chi è l'utente, non facciamo nulla
    if (!user?.id) return;

    const caricaProfilo = async () => {
      setLoadingProfilo(true);
      setErrore(null);
      
      try {
        // Usiamo .maybeSingle() come suggerito da Claude!
        const { data, error: errQuery } = await supabase
          .from('profili_societa')
          .select('nome_asd, indirizzo')
          .eq('utente_id', user.id)
          .maybeSingle(); 

        if (errQuery) {
          // Se l'errore è il 406, facciamo finta di nulla e andiamo avanti
          if (errQuery.code === '406' || errQuery.code === 'PGRST116') {
            setLoadingProfilo(false);
            return; 
          }
          setErrore(`Errore query: ${errQuery.message}`);
        }

        if (data) {
          setAnnuncio((prev) => ({
            ...prev,
            nome_asd: data.nome_asd || '',
            indirizzo: data.indirizzo || '',
          }));
        }
      } catch (err) {
        setErrore('Errore nel caricamento del profilo');
      } finally {
        setLoadingProfilo(false);
      }
    };

    caricaProfilo();
  }, [user?.id]); // Lo rifacciamo solo se l'ID utente cambia

  // ---- STEP 3: SCRIVERE NEL FORM ----
  const handleChange = (field, value) => {
    setAnnuncio(prev => ({ ...prev, [field]: value }));
  };

  // ---- STEP 4: SALVATAGGIO FINALE ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) { setErrore('Devi essere loggato!'); return; }
    
    setLoadingSalvataggio(true);
    setErrore(null);

    try {
      const { error } = await supabase
        .from('annunci_amichevoli')
        .insert([{
          id_utente: user.id, // Assicurati che nel DB la colonna si chiami così
          nome_asd: annuncio.nome_asd,
          indirizzo: annuncio.indirizzo,
          titolo: annuncio.titolo,
          descrizione: annuncio.descrizione,
          data_evento: new Date().toISOString().split('T')[0] // Mette la data di oggi
        }]);

      if (error) throw error;

      setSuccessMessage('Evviva! Annuncio creato! 🎉');
      setAnnuncio(prev => ({ ...prev, titolo: '', descrizione: '' })); // Puliamo solo i campi liberi
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrore(`Errore nel salvataggio: ${err.message}`);
    } finally {
      setLoadingSalvataggio(false);
    }
  };

  // ---- DISEGNIAMO LA PAGINA ----
  if (!user && !errore) return <div style={{padding: '20px'}}>Controllo chi sei... ⏳</div>;

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', fontFamily: 'Arial' }}>
      <h1>📢 Crea Annuncio</h1>
      
      {errore && <div style={{ color: 'red', background: '#ffdada', padding: '10px', borderRadius: '5px' }}>{errore}</div>}
      {successMessage && <div style={{ color: 'green', background: '#d4ffd4', padding: '10px', borderRadius: '5px' }}>{successMessage}</div>}

      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        <label><b>Nome ASD:</b></label>
        <input 
          style={{ width: '100%', marginBottom: '15px', padding: '8px' }}
          value={annuncio.nome_asd} 
          onChange={(e) => handleChange('nome_asd', e.target.value)}
          placeholder={loadingProfilo ? "Caricamento..." : "Nome della squadra"}
        />

        <label><b>Indirizzo campo:</b></label>
        <input 
          required
          style={{ width: '100%', marginBottom: '15px', padding: '8px' }}
          value={annuncio.indirizzo} 
          onChange={(e) => handleChange('indirizzo', e.target.value)}
          placeholder={loadingProfilo ? "Cerco indirizzo..." : "Via, Città..."}
        />

        <label><b>Titolo:</b></label>
        <input 
          required
          style={{ width: '100%', marginBottom: '15px', padding: '8px' }}
          value={annuncio.titolo} 
          onChange={(e) => handleChange('titolo', e.target.value)}
          placeholder="Es: Cerchiamo portiere"
        />

        <label><b>Descrizione:</b></label>
        <textarea 
          required
          style={{ width: '100%', marginBottom: '15px', padding: '8px', height: '100px' }}
          value={annuncio.descrizione} 
          onChange={(e) => handleChange('descrizione', e.target.value)}
        />

        <button 
          type="submit" 
          disabled={loadingSalvataggio || loadingProfilo}
          style={{ 
            width: '100%', 
            padding: '10px', 
            background: (loadingSalvataggio || loadingProfilo) ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {loadingSalvataggio ? "Salvataggio in corso..." : "Pubblica Annuncio"}
        </button>
      </form>
    </div>
  );
}
