// Importiamo lo strumento che serve per parlare con Supabase
import { createClient } from '@supabase/supabase-js';

// Queste sono le "coordinate" del vostro archivio
const supabaseUrl = 'https://ndojhzkecyzortpvjagl.supabase.co' 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kb2poemtlY3l6b3J0cHZqYWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NDQzOTgsImV4cCI6MjA5MjQyMDM5OH0.DqipKBLtwW_5q87LcKNcwmAONZGGh5rJthizFHJMiCI'

// Creiamo il "Postino" (il client) e gli diamo delle regole precise
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Regola 1: Se la chiave scade, chiedine subito una nuova senza fermarti
    autoRefreshToken: true,
    // Regola 2: Ricorda chi è l'utente anche se chiude la pagina
    persistSession: true,
    // Regola 3: Usa un sistema di sicurezza moderno (PKCE) che evita i litigi (i lock)
    flowType: 'pkce'
  }
});