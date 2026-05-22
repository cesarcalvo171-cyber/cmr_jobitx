import { createClient } from '@supabase/supabase-js';

// Cargar variables de entorno de Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ TalosFlow: Faltan las variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en tu archivo .env. ' +
    'Por favor, configúralas en tu entorno Supabase.'
  );
}

// Inicialización del cliente Supabase
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);
