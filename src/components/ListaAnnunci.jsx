import { useEffect, useState } from 'react';
import supabase from '../supabaseClient';
import useAuth from '../hooks/useAuth'; // Serve per sapere chi sei quando clicchi "Fissa"

export default function ListaAnnunci() {
  const [annunci, setAnnunci] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Recuperiamo l'utente loggato dal nostro hook sicuro

  // --- 1. FUNZIONE PER SCARICARE GLI ANNUNCI ---
  const fetchAnnunci = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('annunci_amichevoli')
        .select(`
          *,
          profili_societa!id_utente (nome_asd, telefono)
        `) // <-- Abbiamo aggiunto !id_utente per togliere ogni dubbio a Supabase
        .order('data_evento', { ascending: true });

      if (error) throw error;
      setAnnunci(data || []);
    } catch (err) {
      console.error("Errore nel caricamento bacheca:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchAnnunci(); 
  }, []);

  // --- 2. FUNZIONE PER PRENOTARE IL MATCH ("FISSA AMICHEVOLE") ---
  const fissaAmichevole = async (annuncio) => {
    if (!user) return alert("Devi essere loggato per fissare un match!");
    
    // Chiediamo conferma all'utente
    const conferma = window.confirm(`Vuoi fissare ufficialmente l'amichevole con ${annuncio.profili_societa?.nome_asd}?`);
    if (!conferma) return;

    try {
      // Aggiorniamo la riga su Supabase mettendo il TUO ID come sfidante
      const { error } = await supabase
        .from('annunci_amichevoli')
        .update({ sfidante_id: user.id })
        .eq('id', annuncio.id);

      if (error) throw error;

      alert("🤝 Match fissato! Ora se vuoi contatta la società su WhatsApp per i dettagli finali.");
      fetchAnnunci(); // Ricarichiamo la lista per far apparire i nuovi tasti
    } catch (err) {
      alert("Errore durante la prenotazione: " + err.message);
    }
  };

  // Funzione per la data bella (es: 01 maggio 2026)
  const formattaDataIT = (dataStr) => {
    if (!dataStr) return '';
    const date = new Date(dataStr);
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  if (loading) return <p style={{textAlign: 'center', padding: '20px'}}>Caricamento match in corso...</p>;

  return (
    <div className="lista-cards" style={{ display: 'grid', gap: '15px' }}>
      {annunci.length === 0 ? (
        <p style={{textAlign: 'center', marginTop: '20px'}}>Nessun annuncio trovato.</p>
      ) : (
        annunci.map(a => {
          // --- LOGICA DI CONTROLLO STATO ---
          const isMioAnnuncio = a.id_utente === user?.id; // L'ho pubblicato io?
          const giaPrenotato = a.sfidante_id !== null;   // Qualcuno lo ha già preso?
          const prenotatoDaMe = a.sfidante_id === user?.id; // L'ho preso proprio io?

          return (
            <div key={a.id} className="card-annuncio" style={{
              border: giaPrenotato ? '2px solid #fbbf24' : '1px solid #e5e7eb',
              padding: '20px', borderRadius: '12px', backgroundColor: 'white', 
              position: 'relative', textAlign: 'left', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              
              {/* Etichetta se il match è occupato */}
              {giaPrenotato && (
                <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#fbbf24', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                  MATCH FISSATO
                </div>
              )}

              <h3 style={{margin: '0 0 5px 0', color: '#1e733a', textTransform: 'uppercase'}}>
                {a.profili_societa?.nome_asd || 'SOCIETÀ'}
              </h3>
              <div style={{fontWeight: 'bold', color: '#374151', marginBottom: '10px'}}>
                {a.gruppo} {a.livello && ` - ${a.livello}`}
              </div>
              
              <hr style={{border: '0', borderTop: '1px solid #f3f4f6', marginBottom: '10px'}} />
              
              <p style={{margin: '5px 0'}}>📅 <strong>Data:</strong> {formattaDataIT(a.data_evento)}</p>
              <p style={{margin: '5px 0'}}>⏰ <strong>Ora:</strong> {a.orario_evento}</p>
              <p style={{margin: '5px 0'}}>📍 <strong>Campo:</strong> {a.indirizzo_campo}</p>
              
              {a.messaggio && <p style={{backgroundColor: '#f9fafb', padding: '8px', borderRadius: '6px', fontSize: '0.9rem', fontStyle: 'italic', marginTop: '10px'}}>💬 {a.messaggio}</p>}

              {/* --- ZONA PULSANTI DINAMICI --- */}
              <div style={{ marginTop: '15px' }}>
                
                {isMioAnnuncio ? (
                  /* CASO 1: È IL MIO ANNUNCIO */
                  <div style={{ padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '8px', textAlign: 'center', fontSize: '0.9rem', color: '#6b7280' }}>
                     {giaPrenotato ? "🎯 Qualcuno ha accettato la tua sfida!" : "⏳ In attesa di sfidanti..."}
                  </div>
                ) : !giaPrenotato ? (
                  /* CASO 2: IL MATCH È LIBERO */
                  <button 
                    onClick={() => fissaAmichevole(a)} 
                    style={{ width: '100%', padding: '12px', backgroundColor: '#1e733a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    🤝 FISSA AMICHEVOLE
                  </button>
                ) : prenotatoDaMe ? (
                  /* CASO 3: L'HO PRENOTATO IO */
                  <a 
                  href={`https://wa.me{a.profili_societa?.telefono?.replace(/\s/g, '')}?text=Ciao! Abbiamo fissato l'amichevole su INGAGGIO per il ${formattaDataIT(a.data_evento)}. Siete pronti?`}
                    target="_blank" rel="noreferrer"
                    style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '12px', backgroundColor: '#25D366', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}
                  >
                    ✅ MATCH PRENOTATO - SCRIVI ORA
                  </a>
                ) : (
                  /* CASO 4: L'HA PRENOTATO UN ALTRO */
                  <button disabled style={{ width: '100%', padding: '12px', backgroundColor: '#d1d5db', color: '#9ca3af', border: 'none', borderRadius: '8px', cursor: 'not-allowed' }}>
                    NON DISPONIBILE
                  </button>
                )}

              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
