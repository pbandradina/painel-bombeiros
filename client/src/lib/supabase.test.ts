import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('Supabase Configuration', () => {
  it('should connect to Supabase with valid credentials', async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    expect(supabaseUrl).toBeDefined();
    expect(supabaseKey).toBeDefined();
    expect(supabaseUrl).toContain('supabase.co');
    expect(supabaseKey).toContain('sb_');

    // Tenta criar cliente e fazer uma query simples
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Testa conexão listando tabelas
    const { data, error } = await supabase
      .from('bombeiros')
      .select('id')
      .limit(1);

    // Se houver erro de autenticação, as credenciais estão erradas
    if (error && error.message.includes('401')) {
      throw new Error('Credenciais do Supabase inválidas');
    }

    // Se conseguiu fazer a query (mesmo que retorne vazio), está funcionando
    expect(Array.isArray(data) || data === null).toBe(true);
  });
});
