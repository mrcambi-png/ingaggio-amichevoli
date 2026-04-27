import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// Assicurati di avere supabaseClient già configurato nel progetto
import { supabase } from '../supabaseClient';

const AnnuncioDettaglio = () => {
  const { id } = useParams();
  const [annuncio, setAnnuncio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTelefono, setShowTelefono] = useState(false);
  const [copiato, setCopiato] = useState(false);

  useEffect(() => {
    const fetchAnnuncio = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('annunci_amichevoli')
        .select('*')
        .eq('id', id)
        .single();
      if (!error) setAnnuncio(data);
      setLoading(false);
    };
    if (id) fetchAnnuncio();
  }, [id]);

  const handleInteressato = async () => {
    if (!showTelefono) {
      setShowTelefono(true);
      try {
        await navigator.clipboard.writeText(annuncio.telefono);
        setCopiato(true);
        setTimeout(() => setCopiato(false), 2000);
      } catch {}
    }
  };

  // Helpers for formatting date/time, if needed
  const formatDataOra = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const giorno = date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const ora = date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    return { giorno, ora };
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>Caricamento...</div>
    );
  }

  if (!annuncio) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>Annuncio non trovato.</div>
    );
  }

  const { giorno, ora } = formatDataOra(annuncio.data_ora);

  return (
    <div style={{ minHeight: '100vh', background: '#fafbfc', color: '#222', paddingBottom: 90 }}>
      {/* Top section: Categoria e Data */}
      <div style={{
        padding: '24px 16px 12px 16px',
        textAlign: 'center',
        background: '#fff',
        borderBottom: '1px solid #eee'
      }}>
        <div style={{
          fontWeight: 600,
          fontSize: 18,
          color: '#444',
          letterSpacing: 1,
        }}>{annuncio.categoria}</div>
        <div style={{ color: '#888', marginTop: 2, fontSize: 15 }}>
          {giorno} &nbsp; {ora}
        </div>
      </div>

      {/* Middle: Società e Municipio */}
      <div style={{
        padding: '36px 14px',
        background: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 14,
          color: '#181a1b'
        }}>{annuncio.nome_societa}</div>
        <div style={{
          fontSize: 17,
          fontWeight: 500,
          padding: '7px 20px',
          borderRadius: 16,
          background: '#eef0f3',
          color: '#444'
        }}>
          Municipio {annuncio.municipio?.toUpperCase?.() || annuncio.municipio}
        </div>
      </div>

      {/* Fixed button */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        padding: 0,
        background: '#fff',
        borderTop: '1px solid #eee',
        zIndex: 10,
        boxShadow: '0 -2px 14px rgba(0,0,0,0.04)'
      }}>
        <button
          style={{
            width: '90%',
            margin: '16px 5%',
            padding: '18px 0',
            fontSize: 18,
            fontWeight: 700,
            color: '#fff',
            background: '#1a7a3c',
            border: 'none',
            borderRadius: 14,
            boxShadow: '0 2px 6px rgba(26,122,60,0.05)',
            cursor: showTelefono ? 'default' : 'pointer',
            letterSpacing: 1,
            transition: 'background 0.13s'
          }}
          onClick={handleInteressato}
          disabled={showTelefono}
        >
          {showTelefono
            ? copiato
              ? 'Copiato!'
              : annuncio.telefono
            : 'Sono interessato'}
        </button>
      </div>
    </div>
  );
};

export default AnnuncioDettaglio;