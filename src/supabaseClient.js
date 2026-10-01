import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Mancano le variabili d'ambiente Supabase.\n" +
    'Crea un file .env nella root del progetto con:\n' +
    '  VITE_SUPABASE_URL=...\n' +
    '  VITE_SUPABASE_ANON_KEY=...'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
