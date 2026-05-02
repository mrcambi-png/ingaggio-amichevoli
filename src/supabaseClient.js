import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL ||!SUPABASE_ANON_KEY) {
  console.error(
    '[Supabase] ERRORE: Manca VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY su Vercel. Vai in Settings > Environment Variables'
  )
}

// ============================================================================
// CLIENT SUPABASE - UNA SOLA ISTANZA PER TUTTA L'APP
// ============================================================================

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // 1. Fai salvare la sessione nel browser. Se metti false, ad ogni F5 ti slogga
    persistSession: true,
    
    // 2. Usa lo storage normale del browser. Quello custom in RAM rompe il lock
    storage: window.localStorage,
    
    // 3. Nome fisso del token. Se cambia ad ogni reload, crea 2 lock
    storageKey: 'sb-ingaggio-auth-token',
    
    // 4. Fai rinnovare il token da solo. Se metti false, dopo 1 ora si blocca
    autoRefreshToken: true,
    
    // 5. Fai leggere il login dall'URL. Serve per login con Google/Magic Link
    detectSessionInUrl: true,
    
    // 6. Usa PKCE sempre. È lo standard. Il tuo "implicit" rompe su Vercel
    flowType: 'pkce'
  }
})

export default supabase