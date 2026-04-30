import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ndojhzkecyzortpvjagl.supabase.co' 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kb2poemtlY3l6b3J0cHZqYWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NDQzOTgsImV4cCI6MjA5MjQyMDM5OH0.DqipKBLtwW_5q87LcKNcwmAONZGGh5rJthizFHJMiCI'

// Questo log serve a te per vedere se le chiavi vengono caricate correttamente
console.log("Inizializzazione Supabase con URL:", supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'ingaggio-auth-token' // Specifichiamo una chiave unica
  }
})
