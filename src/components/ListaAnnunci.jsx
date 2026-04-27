import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './ListaAnnunci.css';

export default function ListaAnnunci() {
  const navigate = useNavigate();
  const [annunci, setAnnunci] = useState([]);
  const [filtro, setFiltro] = useState('Tutti');

  const fetchAnnunci = async () => {
    let query = supabase.from('annunci').select('*').order('created_at', { ascending: false });
    if (filtro !== 'Tutti') query = query.eq('municipio', filtro);
    const { data } = await query;
    setAnnunci(data || []);
  };

  useEffect(() => { fetchAnnunci(); }, [filtro]);

  return (
    <div className="bacheca">
      <div className="filtri">
        <button onClick={() => setFiltro('Tutti')}>Tutti i Municipi</button>
        {/* Aggiungi qui altri pulsanti municipio se vuoi filtri rapidi */}
      </div>
      {annunci.map(a => (
        <div
          key={a.id}
          className="card-annuncio"
          onClick={() => navigate(`/annuncio/${a.id}`)}
          style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate(`/annuncio/${a.id}`);
            }
          }}
        >
          <h4>{a.squadra} (Mun. {a.municipio})</h4>
          <p>📅 {a.data} ore {a.ora}</p>
          <a
            href={`https://wa.me/${a.contatto}`}
            className="btn-wa"
            onClick={(e) => e.stopPropagation()}
          >
            Contatta su WhatsApp
          </a>
        </div>
      ))}
    </div>
  );
}
