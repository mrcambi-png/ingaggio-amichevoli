import { createClient } from '@supabase/supabase-js'

const FALLBACK_SUPABASE_URL = 'https://ndojhzkecyzortpvjagl.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kb2poemtlY3l6b3J0cHZqYWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NDQzOTgsImV4cCI6MjA5MjQyMDM5OH0.DqipKBLtwW_5q87LcKNcwmAONZGGh5rJthizFHJMiCI'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY

console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error('Variabili Supabase mancanti in ambiente: uso fallback locale.')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
