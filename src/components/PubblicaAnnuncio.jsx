import { useState } from 'react';
import { supabase } from '../supabaseClient';
import './PubblicaAnnuncio.css';

export default function PubblicaAnnuncio({ onSettled }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ squadra: '', municipio: '', data: '', ora: '', contatto: '' });

  // Generiamo gli orari dalle 08:00 alle 21:00 ogni 15 minuti
  const generateTimes = () => {
    const times = [];
    for (let h = 8; h <= 21; h++) {
      ['00', '15', '30', '45'].forEach(m => {
        const time = `${h.toString().padStart(2, '0')}:${m}`;
        times.push(time);
      });
    }
    return times;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('annunci')
      .insert([{ 
        squadra: formData.squadra, 
        municipio: formData.municipio, 
        data: formData.data, 
        ora: formData.ora, 
        contatto: formData.contatto 
      }]);

    if (error) {
      alert("Ops! C'è un errore: " + error.message);
    } else {
      alert("EVVIVA! Annuncio caricato con successo! 🎉");
      setFormData({ squadra: '', municipio: '', data: '', ora: '', contatto: '' });
      onSettled(); 
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="form-ingaggio" style={{display: 'flex', flexDirection: 'column', gap: '10px', padding: '20px'}}>
      <label>Nome ASD</label>
      <input placeholder="Es. Trastevere FC" value={formData.squadra} onChange={e => setFormData({...formData, squadra: e.target.value})} required />
      
      <label>Municipio</label>
      <select value={formData.municipio} onChange={e => setFormData({...formData, municipio: e.target.value})} required>
        <option value="">Scegli Municipio</option>
        {[...Array(15)].map((_, i) => <option key={i+1} value={i+1}>Municipio {i+1}</option>)}
      </select>

      <label>Giorno</label>
      <input type="date" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} required />

      <label>Orario Calcio d'Inizio</label>
      <select value={formData.ora} onChange={e => setFormData({...formData, ora: e.target.value})} required>
        <option value="">Seleziona orario...</option>
        {generateTimes().map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      <label>Tuo WhatsApp</label>
      <input placeholder="Es. 3381234567" value={formData.contatto} onChange={e => setFormData({...formData, contatto: e.target.value})} required />

      <button type="submit" disabled={loading} style={{background: '#28a745', color: 'white', padding: '12px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px'}}>
        {loading ? 'Sto salvando...' : 'PUBBLICA ORA'}
      </button>
    </form>
  );
}
