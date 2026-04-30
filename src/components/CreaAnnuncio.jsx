import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
// Qui importiamo la nuova lista precisa che abbiamo appena fatto
import { CATEGORIE_MERCATO, LIVELLI_DISPONIBILI } from '../constants/marketData';

const CreaAnnuncio = () => {
  const [formData, setFormData] = useState({
    macroCategoria: '',
    sottoCategoria: '',
    livello: '',
    descrizione: '',
  });

  const [mostraLivello, setMostraLivello] = useState(false);

  // --- IL CERVELLO DEL MODULO (Logica Passo-Passo) ---
  useEffect(() => {
    // 1. Controlliamo se è un'attività per bambini
    const isBase = formData.macroCategoria === "ATTIVITÀ DI BASE";
    
    // 2. Controlliamo se nella sottocategoria c'è la parola "Provinciali"
    const isProvinciale = formData.sottoCategoria.includes("Provinciali");
    
    // 3. Se una delle due è vera, accendiamo la lampadina "Livello"
    if (isBase || isProvinciale) {
      setMostraLivello(true);
    } else {
      setMostraLivello(false);
      setFormData(prev => ({ ...prev, livello: '' })); // Puliamo se scompare
    }
  }, [formData.macroCategoria, formData.sottoCategoria]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Spedisco i dati a Supabase:", formData);
    // Qui poi aggiungeremo il codice per salvare davvero
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-blue-900">Crea Nuovo Annuncio</h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* SCELTA 1: La Macro-Categoria */}
        <div>
          <label className="block text-sm font-semibold text-gray-600">Cosa cerchi?</label>
          <select 
            className="w-full p-2 border rounded-md"
            value={formData.macroCategoria}
            onChange={(e) => setFormData({...formData, macroCategoria: e.target.value, sottoCategoria: ''})}
            required
          >
            <option value="">Seleziona Categoria...</option>
            {Object.keys(CATEGORIE_MERCATO).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* SCELTA 2: La Squadra specifica (si attiva solo dopo la Scelta 1) */}
        {formData.macroCategoria && (
          <div>
            <label className="block text-sm font-semibold text-gray-600">Per quale annata/livello?</label>
            <select 
              className="w-full p-2 border rounded-md"
              value={formData.sottoCategoria}
              onChange={(e) => setFormData({...formData, sottoCategoria: e.target.value})}
              required
            >
              <option value="">Seleziona Squadra...</option>
              {CATEGORIE_MERCATO[formData.macroCategoria].map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        )}

        {/* SCELTA 3: Il Livello (Appare solo se serve!) */}
        {mostraLivello && (
          <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
            <label className="block text-sm font-bold text-blue-800">Livello di forza *</label>
            <select 
              className="w-full p-2 border border-blue-300 rounded-md"
              value={formData.livello}
              onChange={(e) => setFormData({...formData, livello: e.target.value})}
              required
            >
              <option value="">Seleziona Livello...</option>
              {LIVELLI_DISPONIBILI.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        )}

        {/* DESCRIZIONE */}
        <div>
          <label className="block text-sm font-semibold text-gray-600">Messaggio</label>
          <textarea 
            className="w-full p-2 border rounded-md"
            placeholder="Esempio: Cerchiamo amichevole per Sabato pomeriggio campo proprio..."
            onChange={(e) => setFormData({...formData, descrizione: e.target.value})}
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">
          Pubblica Annuncio
        </button>
      </form>
    </div>
  );
};

export default CreaAnnuncio;
