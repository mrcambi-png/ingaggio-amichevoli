import React, { useState } from 'react';
import supabase from '../supabaseClient';

// 1. LA LISTA COMPLETA DI TUTTE LE CATEGORIE FIGC (Non ne manca nessuna!)
const CATEGORIE_GIOVANILI = [
  // Attività di Base
  'Piccoli Amici', 'Primi Calci 1° anno', 'Primi Calci 2° anno', 
  'Pulcini 1° anno', 'Pulcini 2° anno', 'Esordienti 1° anno', 'Esordienti 2° anno',
  // Giovanissimi
  'Under 14 Giovanissimi Elite', 'Under 14 Giovanissimi Regionali', 'Under 14 Giovanissimi Provinciali',
  'Under 15 Giovanissimi Élite', 'Under 15 Giovanissimi Regionali', 'Under 15 Giovanissimi Provinciali',
  // Allievi
  'Under 16 Allievi Elite', 'Under 16 Allievi Regionali', 'Under 16 Allievi Provinciali',
  'Under 17 Allievi Provinciali', 'Under 17 Allievi Regionali', 'Under 17 Allievi Élite',
  // Under 18
  'Under 18 Regionali', 'Under 18 Provinciali',
  // Juniores
  'Under 19 Juniores Nazionali', 'Under 19 Juniores Elite', 'Under 19 Juniores Regionali', 'Under 19 Juniores Provinciali',
  // Femminile
  'Under 12 Femminile', 'Under 13 Femminile', 'Under 15 Femminile', 'Under 17 Femminile', 'Primavera Femminile'
];

// 2. I LIVELLI DI DIFFICOLTÀ CON LE ETICHETTE COLORATE
const LIVELLI_DIFFICOLTA = [
  { valore: 'basso-basso', etichetta: 'basso-basso' },
  { valore: 'basso', etichetta: 'basso' },
  { valore: 'medio-basso', etichetta: 'medi-basso' },
  { valore: 'medio', etichetta: 'medio' },
  { valore: 'medio-alto', etichetta: 'medio-alto' },
  { valore: 'alto', etichetta: 'alto' }
];

const PubblicaAnnuncio = ({ societaId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoria_figc_giovanile: 'Piccoli Amici', // Parte dal primo della lista
    livello_difficolta: 'medio',
    municipio_num: 'I',
    indirizzo: '',
    data_partita: '',
    ora_partita: '',
    numero_giocatori_cercati: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mandiamo i dati al database
      const { data, error } = await supabase
        .from('annunci_amichevoli')
        .insert([
          {
            societa_id: societaId,
            categoria_figc_giovanile: formData.categoria_figc_giovanile,
            livello_difficolta: formData.livello_difficolta,
            municipio_num: formData.municipio_num,
            indirizzo: formData.indirizzo,
            data_partita: formData.data_partita,
            ora_partita: formData.ora_part_ita,
            numero_giocatori_cercati: formData.numero_giocatori_cercati,
            stato: 'attivo'
          }
        ]);

      if (error) throw error;
      
      alert("Evviva! Annuncio pubblicato con successo! ⚽");
      if (onSuccess) onSuccess();
      
    } catch (error) {
      alert("Ohi ohi, c'è un errore: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pubblica-annuncio-card" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3 style={{ color: '#1a7a3c' }}>Crea Nuova Amichevole</h3>
      <form onSubmit={handleSubmit}>
        
        {/* MENU CATEGORIA */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Seleziona Categoria:</label>
          <select 
            style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
            value={formData.categoria_figc_giovanile}
            onChange={(e) => setFormData({...formData, categoria_figc_giovanile: e.target.value})}
          >
            {CATEGORIE_GIOVANILI.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* MENU DIFFICOLTÀ */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Livello della Partita:</label>
          <select 
            style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
            value={formData.livello_difficolta}
            onChange={(e) => setFormData({...formData, livello_difficolta: e.target.value})}
          >
            {LIVELLI_DIFFICOLTA.map(liv => (
              <option key={liv.valore} value={liv.valore}>{liv.etichetta}</option>
            ))}
          </select>
        </div>

        {/* ALTRI CAMPI */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Dove si gioca? (Indirizzo):</label>
          <input 
            type="text" 
            required 
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="Esempio: Via Roma 10"
            value={formData.indirizzo}
            onChange={(e) => setFormData({...formData, indirizzo: e.target.value})}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Quando si gioca? (Data):</label>
          <input 
            type="date" 
            required 
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            value={formData.data_partita}
            onChange={(e) => setFormData({...formData, data_partita: e.target.value})}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#1a7a3c', // Il nostro verde definitivo!
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Sto salvando...' : 'PUBBLICA ORA! 🏟️'}
        </button>
      </form>
    </div>
  );
};

export default PubblicaAnnuncio;
