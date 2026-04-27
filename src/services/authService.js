import { supabase } from '../supabaseClient';

export const authService = {
  async signUp(email, password, tipoUtente, datiProfilo) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            tipo_utente: tipoUtente
          }
        }
      });

      if (authError) throw authError;

      const userId = authData.user.id;

      const { data: profiloBase, error: profiloBaseError } = await supabase
        .from('profili_utenti')
        .insert([{
          id: userId,
          email,
          tipo_utente: tipoUtente
        }])
        .select();

      if (profiloBaseError) throw profiloBaseError;

      let profiloSpecifico;

      if (tipoUtente === 'calciatore') {
        const { data, error } = await supabase
          .from('profili_calciatori')
          .insert([{
            utente_id: userId,
            email,
            nome: datiProfilo.nome || '',
            cognome: datiProfilo.cognome || '',
            ruolo: datiProfilo.ruolo || 'Attaccante',
            categoria_figc: datiProfilo.categoria_figc || 'Dilettante',
            // NUOVO: Categoria Giovanile per il calciatore
            categoria_figc_giovanile: datiProfilo.categoria_figc_giovanile || 'Pulcini 1° anno',
            municipio_num: datiProfilo.municipio_num || 'I'
          }])
          .select();

        if (error) throw error;
        profiloSpecifico = data[0];

      } else if (tipoUtente === 'societa') {
        const { data, error } = await supabase
          .from('profili_societa')
          .insert([{
            utente_id: userId,
            email,
            nome_asd: datiProfilo.nome_asd || '',
            categoria_figc: datiProfilo.categoria_figc || 'Dilettante',
            // NUOVO: Anche la società può avere una categoria giovanile predefinita
            categoria_figc_giovanile: datiProfilo.categoria_figc_giovanile || 'Pulcini 1° anno',
            municipio_num: datiProfilo.municipio_num || 'I',
            indirizzo: datiProfilo.indirizzo || '',
            civico: datiProfilo.civico || ''
          }])
          .select();

        if (error) throw error;
        profiloSpecifico = data[0];

      } else if (tipoUtente === 'staff') {
        const { data, error } = await supabase
          .from('profili_staff')
          .insert([{
            utente_id: userId,
            email,
            nome: datiProfilo.nome || '',
            cognome: datiProfilo.cognome || '',
            specializzazione: datiProfilo.specializzazione || 'Allenatore',
            municipio_num: datiProfilo.municipio_num || 'I'
          }])
          .select();

        if (error) throw error;
        profiloSpecifico = data[0];
      }

      return {
        success: true,
        user: authData.user,
        profilo: profiloSpecifico,
        message: 'Registrazione completata. Controlla email per confermare.'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

   async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      
      const profilo = await this.caricaProfilo(data.user.id);
      
      return {
        success: true, // <--- Se manca questo, il tasto non saprà mai che è andata bene!
        user: data.user,
        profilo,
        message: 'Login completato'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async caricaProfilo(userId) {
    try {
      const { data: tipoData, error: tipoError } = await supabase
        .from('profili_utenti')
        .select('tipo_utente')
        .eq('id', userId)
        .single();

      if (tipoError) throw tipoError;
      const tipoUtente = tipoData.tipo_utente;

      let table;
      if (tipoUtente === 'calciatore') {
        table = 'profili_calciatori';
      } else if (tipoUtente === 'societa') {
        table = 'profili_societa';
      } else if (tipoUtente === 'staff') {
        table = 'profili_staff';
      }

      const { data: profilo, error: profiloError } = await supabase
        .from(table)
        .select('*')
        .eq('utente_id', userId)
        .single();

      if (profiloError) throw profiloError;
      return {
        tipo_utente: tipoUtente,
        ...profilo
      };
    } catch (error) {
      console.error('Errore caricamento profilo:', error);
      return null;
    }
  },

async signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Errore signOut:', error);
    return { success: false, error: error.message };
  }
},

  async aggiornaProfilo(userId, tipoUtente, dati) {
    try {
      let table;
      if (tipoUtente === 'calciatore') {
        table = 'profili_calciatori';
      } else if (tipoUtente === 'societa') {
        table = 'profili_societa';
      } else if (tipoUtente === 'staff') {
        table = 'profili_staff';
      }
      const { data, error } = await supabase
        .from(table)
        .update(dati)
        .eq('utente_id', userId)
        .select();

      if (error) throw error;
      return {
        success: true,
        profilo: data[0]
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async uploadFotoProfilo(userId, file, tipoUtente) {
    try {
      const fileName = `${tipoUtente}s/profili/${userId}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('ingaggio-media')
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('ingaggio-media')
        .getPublicUrl(fileName);

      return {
        success: true,
        url: publicUrl.publicUrl
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async getSessione() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (data.session) {
        const profilo = await this.caricaProfilo(data.session.user.id);
        return {
          user: data.session.user,
          profilo
        };
      }
      return null;
    } catch (error) {
      console.error('Errore sessione:', error);
      return null;
    }
  }
}
