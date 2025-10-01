import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient<Database>;
let connectionError: string | null = null;

if (!supabaseUrl || !supabaseKey) {
  connectionError = "As credenciais do Supabase são obrigatórias. Crie um ficheiro .env e defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.";
  // Create a dummy client to avoid breaking imports everywhere.
  // Any calls to it will fail, but the app can now handle this state gracefully.
  supabase = createClient<Database>('https://placeholder.com', 'placeholderkey', {
    auth: {
        persistSession: false
    }
  });
} else {
  supabase = createClient<Database>(supabaseUrl, supabaseKey);
}

export { supabase, connectionError };

export type { Session } from '@supabase/supabase-js';
