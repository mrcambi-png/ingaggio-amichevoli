import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';
import useAuth from '../hooks/useAuth'; // Importo l'hook per prendere il profilo

// 1. LISTA CATEGORIE FIGC
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

// 2. LIVELLI DI DIFFICOLTÀ
const LIVELLI_DIFFICOLTA = [
  { valore: 'basso-basso', etichetta: 'basso-basso' },
  { valore: 'basso', etichetta: 'basso' },
  { valore: 'medio-basso', etichetta: 'medio-basso' },
  { valore: 'medio', etichetta: 'medio' },
  { valore: 'medio-alto', etichetta: 'medio-alto' },
  { valore: 'alto', etichetta: 'alto' }
];

// Categorie Attività di Base - per mostrare il livello
const ATTIVITA_BASE = [
  'Piccoli Amici', 'Primi Calci 1° anno', 'Primi Calci 2° anno', 
  'Pulcini 1° anno', 'Pulcini 2° anno', 'Esordienti 1° anno', 'Esordienti 2° anno'
];

// Funzione per capire se mostrare il livello
const deveMostrareLivello = (categoria) => {
  const isBase = ATTIVITA_BASE.includes(categoria);
  const isProvinciale = categoria.includes('Provinciali') || categoria.includes('Provinciale');
  return isBase || isProvinciale;
};

// Genera orari dalle 08:00 alle 21:00 con step 15min
const generaOrari = () => {
  const orari = [];
  for (let h = 8; h <= 21; h++) {
    for (let m = 0; m < 60; m += 15) {
      const ora = h.toString().padStart(2, '0');
      const minuto = m.toString().padStart(2, '0');
      orari.push(`${ora}:${minuto}`);
    }
  }
  return orari;
};

const ORARI_DISPONIBILI = generaOrari();

const PubblicaAnnuncio = ({ societaId, onSuccess }) => {
  const { user } = useAuth(); // Prendo l'utente con profilo
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoria_figc_giovanile: 'Piccoli Amici',
    livello_difficolta: 'medio',
    municipio_num: 'I',
    indirizzo: '',
    data_partita: '',
    ora_partita: '15:00',
    numero_giocatori_cercati: 1,
    messaggio: '' // Campo facoltativo nuovo
  });

  // 2. PRE-COMPILA INDIRIZZO DAL PROFILO
  useEffect(() => {
    if (user?.profilo_societa?.indirizzo) {
      setFormData(prev => ({
        ...prev,
        indirizzo: user.profilo_societa.indirizzo,
        municipio_num: user.profilo_societa.municipio_num || prev.municipio_num
      }));
    }
  }, [user?.profilo_societa?.indirizzo]);

  // 1. SE CAMBIA CATEGORIA E NON SERVE LIVELLO, RESETTALO
  useEffect(() => {
    if (!deveMostrareLivello(formData.categoria_figc_giovanile)) {
      setFormData(prev => ({ ...prev, livello_difficolta: null }));
    } else if (!formData.livello_difficolta) {
      setFormData(prev => ({ ...prev, livello_difficolta: 'medio' }));
    }
  }, [formData.categoria_figc_giovanile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('annunci_amichevoli')
        .insert([
          {
            societa_id: societaId,
            categoria_figc_giovanile: formData.categoria_figc_giovanile,
            livello_difficolta: formData.livello_difficolta, // Sarà null se non serve
            municipio_num: formData.municipio_num,
            indirizzo: formData.indirizzo,
            data_partita: formData.data_partita,
            ora_partita: formData.ora_partita, // Fixato typo ora_part_ita
            numero_giocatori_cercati: formData.numero_giocatori_cercati,
            messaggio: formData.messaggio || null, // Campo nuovo
            stato: 'attivo'
          }
        ]);

      if (error) throw error;
      
      alert("Annuncio pubblicato con successo!");
      if (onSuccess) onSuccess();
      
      // Reset form mantenendo indirizzo
      setFormData(prev => ({
        ...prev,
        categoria_figc_giovanile: 'Piccoli Amici',
        livello_difficolta: 'medio',
        data_partita: '',
        ora_partita: '15:00',
        messaggio: ''
      }));
      
    } catch (error) {
      alert("Errore: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const mostraLivello = deveMostrareLivello(formData.categoria_figc_giovanile);

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

        {/* 1. MENU DIFFICOLTÀ - CONDIZIONALE */}
        {mostraLivello && (
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
        )}

        {/* 2. INDIRIZZO PRE-COMPILATO */}
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

        {/* DATA */}
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

        {/* 3. ORARIO NUOVO */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>A che ora? (Orario):</label>
          <select 
            style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
            value={formData.ora_partita}
            onChange={(e) => setFormData({...formData, ora_partita: e.target.value})}
            required
          >
            {ORARI_DISPONIBILI.map(ora => (
              <option key={ora} value={ora}>{ora}</option>
            ))}
          </select>
        </div>

        {/* 4. MESSAGGIO FACOLTATIVO NUOVO */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Messaggio (facoltativo):</label>
          <textarea 
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '60px' }}
            placeholder="Es: Anche ospitato, colore maglie blu, contattare con WhatsApp, referente: Marco 333..."
            value={formData.messaggio}
            onChange={(e) => setFormData({...formData, messaggio: e.target.value})}
          />
        </div>

        {/* 5. BOTTONE SENZA ICONA */}
        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#1a7a3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Sto salvando...' : 'PUBBLICA ORA!'}
        </button>
      </form>
    </div>
  );
};

export default PubblicaAnnuncio;