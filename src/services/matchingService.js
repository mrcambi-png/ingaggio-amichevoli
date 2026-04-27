import { supabase } from '../supabaseClient';

export const matchingService = {
  async trovaCaiciatoriPerSocieta(societaId) {
    try {
      const { data: richieste, error: richieste_error } = await supabase
        .from('annunci_cerca_squadra')
        .select(`
          id,
          ruoli_disponibili,
          categoria_figc_cercata,
          municipio_num_preferito,
          calciatore_id
        `)
        .eq('stato', 'attivo');
      if (richieste_error) throw richieste_error;

      const parametriRicerca = {
        ruoli: [],
        categorie: [],
        municipi: []
      };

      richieste.forEach(r => {
        parametriRicerca.ruoli.push(...(r.ruoli_disponibili || []));
        parametriRicerca.categorie.push(...(r.categoria_figc_cercata || []));
        if (r.municipio_num_preferito) {
          parametriRicerca.municipi.push(r.municipio_num_preferito);
        }
      });

      let query = supabase
        .from('profili_calciatori')
        .select('*')
        .eq('stato_ricerca', 'attivo');

      if (parametriRicerca.ruoli.length > 0) {
        query = query.in('ruolo', [...new Set(parametriRicerca.ruoli)]);
      }
      if (parametriRicerca.categorie.length > 0) {
        query = query.in('categoria_figc', [...new Set(parametriRicerca.categorie)]);
      }

      const { data: calciatori, error: calciatori_error } = await query;
      if (calciatori_error) throw calciatori_error;

      const matchingScore = calciatori.map(cal => ({
        ...cal,
        score: this.calcolaMatchScore(cal, parametriRicerca)
      }));

      matchingScore.sort((a, b) => b.score - a.score);
      return { success: true, matches: matchingScore };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async trovaSocietaPerCalciatore(calciatore_id) {
    try {
      const { data: calciatore, error: cal_error } = await supabase
        .from('profili_calciatori')
        .select('*')
        .eq('id', calciatore_id)
        .single();
      if (cal_error) throw cal_error;

      let query = supabase
        .from('annunci_amichevoli')
        .select(`
          *,
          profili_societa (
            id,
            nome_asd,
            categoria_figc,
            municipio_num,
            foto_logo_url
          )
        `)
        .eq('stato', 'attivo')
        .gte('data_partita', new Date().toISOString().split('T')[0]);

      if (calciatore.categoria_figc) {
        query = query.eq('categoria_figc', calciatore.categoria_figc);
      }
      if (calciatore.municipio_num) {
        const municipi_vicini = this.getMunicipiVicini(calciatore.municipio_num);
        query = query.in('municipio_num', municipi_vicini);
      }

      const { data: amichevoli, error: amichevoli_error } = await query;
      if (amichevoli_error) throw amichevoli_error;

      const matchingScore = amichevoli.map(am => ({
        ...am,
        score: this.calcolaMatchScoreSocieta(am, calciatore)
      }));

      matchingScore.sort((a, b) => b.score - a.score);
      return { success: true, matches: matchingScore };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async trovaStaffPerSocieta(societaId) {
    try {
      const { data: richieste, error: req_error } = await supabase
        .from('richieste_staff')
        .select('*')
        .eq('societa_id', societaId)
        .eq('stato', 'attivo');
      if (req_error) throw req_error;

      const specializzazioni = [...new Set(richieste.map(r => r.specializzazione_cercata))];

      let query = supabase
        .from('profili_staff')
        .select('*')
        .eq('stato_ricerca', 'attivo')
        .in('specializzazione', specializzazioni);

      const { data: staff, error: staff_error } = await query;
      if (staff_error) throw staff_error;

      const matchingScore = staff.map(s => ({
        ...s,
        score: this.calcolaMatchScoreStaff(s, richieste)
      }));

      matchingScore.sort((a, b) => b.score - a.score);
      return { success: true, matches: matchingScore };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  calcolaMatchScore(calciatore, parametriRicerca) {
    let score = 0;
    if (parametriRicerca.ruoli.includes(calciatore.ruolo)) score += 30;
    if (parametriRicerca.categorie.includes(calciatore.categoria_figc)) score += 25;
    if (parametriRicerca.municipi.includes(calciatore.municipio_num)) score += 20;
    if (calciatore.foto_profilo_url) score += 15;
    if (calciatore.video_presentazione_url) score += 10;
    return score;
  },

  calcolaMatchScoreSocieta(amichevole, calciatore) {
    let score = 0;
    if (amichevole.categoria_figc === calciatore.categoria_figc) score += 25;
    if (amichevole.municipio_num === calciatore.municipio_num) score += 20;
    
    const oggi = new Date();
    const dataAmichevole = new Date(amichevole.data_partita);
    const giorni_differenza = Math.floor((dataAmichevole - oggi) / (1000 * 60 * 60 * 24));
    
    if (giorni_differenza > 0 && giorni_differenza <= 7) score += 15;
    else if (giorni_differenza <= 14) score += 10;
    
    if (amichevole.numero_iscritti < amichevole.numero_giocatori_cercati) score += 10;
    
    return score;
  },

  calcolaMatchScoreStaff(staff, richieste) {
    let score = 0;
    const specializzazioniRichieste = richieste.map(r => r.specializzazione_cercata);
    if (specializzazioniRichieste.includes(staff.specializzazione)) score += 40;
    
    const esperienzaRichiesta = Math.max(...richieste.map(r => r.livello_esperienza_minimo || 0));
    if (staff.anni_esperienza >= esperienzaRichiesta) score += 30;
    
    score += (staff.patentini?.length || 0) * 10;
    if (staff.foto_profilo_url) score += 10;
    if (staff.cv_url) score += 15;
    return score;
  },

  getMunicipiVicini(municipio_num) {
    const vicini = {
      'I': ['I', 'II', 'III'],
      'II': ['I', 'II', 'III', 'IV'],
      'III': ['I', 'II', 'III', 'IV', 'V'],
      'IV': ['II', 'III', 'IV', 'V', 'VI'],
      'V': ['III', 'IV', 'V', 'VI', 'VII'],
      'VI': ['IV', 'V', 'VI', 'VII', 'VIII'],
      'VII': ['V', 'VI', 'VII', 'VIII', 'IX', 'X'],
      'VIII': ['VI', 'VII', 'VIII', 'IX'],
      'IX': ['VII', 'VIII', 'IX', 'X', 'XI'],
      'X': ['VII', 'IX', 'X', 'XI', 'XII', 'XIII'],
      'XI': ['IX', 'X', 'XI', 'XII'],
      'XII': ['X', 'XI', 'XII', 'XIII', 'XIV'],
      'XIII': ['X', 'XII', 'XIII', 'XIV', 'XV'],
      'XIV': ['XII', 'XIII', 'XIV', 'XV'],
      'XV': ['XIII', 'XIV', 'XV']
    };
    return vicini[municipio_num] || [municipio_num];
  },

  async registraLike(userId, targetId, targetType, tipoAzione = 'like') {
    try {
      const { data, error } = await supabase
        .from('likes_matching')
        .insert([{ user_id: userId, target_id: targetId, target_type: targetType, tipo_azione: tipoAzione }])
        .select();
      if (error) throw error;
      return { success: true, match: data[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async ottieniLikeRicevuti(targetId) {
    try {
      const { data, error } = await supabase
        .from('likes_matching')
        .select('*')
        .eq('target_id', targetId)
        .eq('tipo_azione', 'like');
      if (error) throw error;
      return { success: true, likes: data || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
