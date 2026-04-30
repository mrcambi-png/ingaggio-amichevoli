import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const CreaAnnuncio = () => {
  // 1. Creiamo le "scatole" per i dati
  // Questa conterrà l'indirizzo finale (es. "Via Roma, 10")
  const [indirizzoCompleto, setIndirizzoCompleto] = useState('');
  
  // Questa serve per capire se il database sta ancora rispondendo
  const [caricamento, setCaricamento] = useState(true);

  // 2. Il "compito" da svolgere appena la pagina si apre
  useEffect(() => {
    async function recuperaDatiProfilo() {
      try {
        // Chiediamo a Supabase: "Chi è l'utente loggato?"
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (user) {
          // Se l'utente c'è, cerchiamo il suo profilo nella tabella
          const { data, error } = await supabase
            .from('profili_societa')
            .select('indirizzo, civico')
            .eq('id', user.id)
            .single(); // Ne vogliamo solo uno

          if (error) {
            console.error("Errore nel recupero dati tabella:", error.message);
          } else if (data) {
            // Uniamo i due pezzi (indirizzo + civico) usando i backticks ` `
            // I backticks si fanno con ALT + 96 (Windows) o Option + 9 (Mac)
            setIndirizzoCompleto(`${data.indirizzo}, ${data.civico}`);
          }
        }
      } catch (err) {
        console.error("Errore generale:", err.message);
      } finally {
        // Una volta finito (sia che vada bene che male), togliamo la scritta "caricamento"
        setCaricamento(false);
      }
    }

    recuperaDatiProfilo();
  }, []); // Le parentesi quadre vuote dicono: "Esegui questo codice solo all'avvio"

  return (
    <div style={{ padding: '20px' }}>
      <h1>Crea un nuovo Annuncio</h1>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold' }}>
          Indirizzo della Società:
        </label>
        
        {/* Usiamo un piccolo trucco: se sta caricando mostriamo un avviso, 
            altrimenti mostriamo il campo con l'indirizzo già scritto */}
        <input 
          type="text" 
          value={caricamento ? "Recupero indirizzo in corso..." : indirizzoCompleto}
          onChange={(e) => setIndirizzoCompleto(e.target.value)}
          placeholder="Caricamento indirizzo..."
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>

      {/* Qui potrai aggiungere gli altri campi del tuo form per l'annuncio */}
      <p>Il resto del modulo apparirà qui sotto...</p>
    </div>
  );
};

export default CreaAnnuncio;
