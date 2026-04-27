import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ndojhzkecyzortpvjagl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kb2poemtlY3l6b3J0cHZqYWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NDQzOTgsImV4cCI6MjA5MjQyMDM5OH0.DqipKBLtwW_5q87LcKNcwmAONZGGh5rJthizFHJMiCI'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
