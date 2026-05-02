import { useEffect, useState } from 'react';
import supabase from '../supabaseClient';
import useAuth from '../hooks/useAuth';

export default function ListaAnnunci() {
  const [annunci, setAnnunci] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // --- 1. SCARICA ANNUNCI CON NOMI COLONNA CORRETTI ---
  const fetchAnnunci = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('annunci_amichevoli')
        .select(`
          *,
          profili_societa!annunci_amichevoli_societa_id_fkey (nome_asd, telefono)
        `)
        .eq('stato', 'attivo')
        .order('data_partita', { ascending: true });

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

  // --- 2. PRENOTA MATCH ---
  const fissaAmichevole = async (annuncio) => {
    if (!user) return alert("Devi essere loggato per fissare un match!");
    
    const nomeSocieta = annuncio.profili_societa?.nome_asd || 'questa società';
    const conferma = window.confirm(`Vuoi fissare ufficialmente l'amichevole con ${nomeSocieta}?`);
    if (!conferma) return;

    try {
      const { error } = await supabase
        .from('annunci_amichevoli')
        .update({ sfidante_id: user.id, stato: 'fissato' })
        .eq('id', annuncio.id); // <-- SÌ, questo va bene. Aggiorna la riga con questo ID

      if (error) throw error;

      alert("🤝 Match fissato! Se vuoi, ora contatta la società su WhatsApp per i dettagli finali.");
      fetchAnnunci();
    } catch (err) {
      alert("Errore durante la prenotazione: " + err.message);
    }
  };

  const formattaDataIT = (dataStr) => {
    if (!dataStr) return '';
    const date = new Date(dataStr);
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formattaOra = (oraStr) => {
    if (!oraStr) return '';
    return oraStr.slice(0, 5); // Da "09:00:00" a "09:00"
  };

  if (loading) return <p style={{textAlign: 'center', padding: '20px'}}>Caricamento match in corso...</p>;

  return (
    <div className="lista-cards" style={{ display: 'grid', gap: '15px' }}>
      {annunci.length === 0 ? (
        <p style={{textAlign: 'center', marginTop: '20px'}}>Nessun annuncio trovato.</p>
      ) : (
        annunci.map(a => {
          const isMioAnnuncio = a.societa_id === user?.id;
          const giaPrenotato = a.sfidante_id !== null;
          const prenotatoDaMe = a.sfidante_id === user?.id;
          const telefono = a.profili_societa?.telefono?.replace(/\s/g, '').replace('+', '');

          return (
            <div key={a.id} className="card-annuncio" style={{
              border: giaPrenotato ? '2px solid #fbbf24' : '1px solid #e5e7eb',
              padding: '20px', borderRadius: '12px', backgroundColor: 'white', 
              position: 'relative', textAlign: 'left', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              
              {giaPrenotato && (
                <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#fbbf24', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                  MATCH FISSATO
                </div>
              )}

              <h3 style={{margin: '0 0 5px 0', color: '#1e733a', textTransform: 'uppercase'}}>
                {a.profili_societa?.nome_asd || 'SOCIETÀ'}
              </h3>
              <div style={{fontWeight: 'bold', color: '#374151', marginBottom: '10px'}}>
                {a.categoria_figc_giovanile} {a.livello_difficolta && ` - ${a.livello_difficolta}`}
              </div>
              
              <hr style={{border: '0', borderTop: '1px solid #f3f4f6', marginBottom: '10px'}} />
              
              <p style={{margin: '5px 0'}}>📅 <strong>Data:</strong> {formattaDataIT(a.data_partita)}</p>
              <p style={{margin: '5px 0'}}>⏰ <strong>Ora:</strong> {formattaOra(a.ora_partita)}</p>
              <p style={{margin: '5px 0'}}>📍 <strong>Campo:</strong> {a.indirizzo}</p>
              
              {a.messaggio && <p style={{backgroundColor: '#f9fafb', padding: '8px', borderRadius: '6px', fontSize: '0.9rem', fontStyle: 'italic', marginTop: '10px'}}>💬 {a.messaggio}</p>}

              <div style={{ marginTop: '15px' }}>
                
                {isMioAnnuncio ? (
                  <div style={{ padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '8px', textAlign: 'center', fontSize: '0.9rem', color: '#6b7280' }}>
                     {giaPrenotato ? "🎯 Qualcuno ha accettato la tua sfida!" : "⏳ In attesa di sfidanti..."}
                  </div>
                ) : !giaPrenotato ? (
                  <button 
                    onClick={() => fissaAmichevole(a)} 
                    style={{ width: '100%', padding: '12px', backgroundColor: '#1e733a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    🤝 FISSA AMICHEVOLE
                  </button>
                ) : prenotatoDaMe ? (
                  <a 
                    href={`https://wa.me/39${telefono}?text=Ciao! Abbiamo fissato l'amichevole su INGAGGIO per il ${formattaDataIT(a.data_partita)} alle ${formattaOra(a.ora_partita)}. Siete pronti?`}
                    target="_blank" rel="noreferrer"
                    style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '12px', backgroundColor: '#25D366', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}
                  >
                    ✅ MATCH PRENOTATO - SCRIVI ORA
                  </a>
                ) : (
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