import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const AnnuncioDettaglio = () => {
  const { id } = useParams();
  const [annuncio, setAnnuncio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [buttonLabel, setButtonLabel] = useState('Sono interessato');

  useEffect(() => {
    const fetchAnnuncio = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('annunci_amichevoli')
        .select('*')
        .eq('id', id)
        .single();

      if (!error) {
        setAnnuncio(data);
      }
      setLoading(false);
    };

    fetchAnnuncio();
  }, [id]);

  const handleButtonClick = () => {
    if (annuncio && annuncio.telefono && !phoneVisible) {
      setPhoneVisible(true);
      navigator.clipboard.writeText(annuncio.telefono).catch(() => {});
      setButtonLabel('Copiato!');
      setTimeout(() => setButtonLabel('Sono interessato'), 2000);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fafbfc' }}>
        <span>Caricamento...</span>
      </div>
    );
  }

  if (!annuncio) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fafbfc' }}>
        <span>Nessun annuncio trovato.</span>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#fafbfc',
        color: '#232323',
        paddingBottom: '90px',
        fontFamily: 'system-ui, sans-serif'
      }}
    >
      <div style={{ background: '#fff', padding: '24px 16px 12px 16px', borderBottom: '1px solid #ececec' }}>
        <div style={{ fontSize: '15px', color: '#868e96', marginBottom: 8, fontWeight: 500 }}>
          {annuncio.categoria || 'Amichevole'}
        </div>
        <div style={{ fontSize: '17px', color: '#232323', fontWeight: 600 }}>
          {annuncio.data ? new Date(annuncio.data).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
        </div>
      </div>

      <div style={{ padding: '32px 16px 24px 16px', background: '#f3f5f7', minHeight: '220px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ fontSize: '22px', color: '#232323', fontWeight: 700 }}>
          {annuncio.nome_societa}
        </div>
        <div style={{ fontSize: '18px', color: '#787878', fontWeight: 500 }}>
          {annuncio.municipio ? `Municipio ${annuncio.municipio}` : ''}
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          left: 0,
          bottom: 0,
          width: '100%',
          background: 'rgba(250,250,250,0.96)',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.04)',
          padding: '16px 16px 28px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {!phoneVisible ? (
          <button
            onClick={handleButtonClick}
            style={{
              width: '100%',
              maxWidth: 420,
              padding: '16px',
              fontSize: '18px',
              fontWeight: 700,
              background: '#1a7a3c',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background 0.18s'
            }}
          >
            {buttonLabel}
          </button>
        ) : (
          <div style={{ width: '100%', maxWidth: 420, textAlign: 'center', fontSize: '19px', color: '#1a7a3c', fontWeight: 700, padding: '15px 0 10px 0', background: '#e5ffe8', borderRadius: '8px' }}>
            {annuncio.telefono}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnuncioDettaglio;