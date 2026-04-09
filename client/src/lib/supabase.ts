import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Credenciais do Supabase não configuradas. Verifique as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Tipos para o banco de dados
export interface Bombeiro {
  id: string;
  nome: string;
  equipe: 'VD' | 'AM' | 'AZ';
  data_inicio: string;
  created_at?: string;
}

export interface Escala {
  id: string;
  bombeiro_id: string;
  data: string;
  sigla: string;
  created_at?: string;
}
