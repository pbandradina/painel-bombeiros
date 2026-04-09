import { createClient } from '@supabase/supabase-js';

// Inicializar cliente Supabase
// Usar variáveis de ambiente do servidor (sem prefixo VITE)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://gntlcxaoxtzukaizoxoi.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_IoOm3TqfOAQFsudkzImzxA_5_3pui7x';

console.log('[DB] Conectando ao Supabase:', supabaseUrl?.substring(0, 30) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Helpers para Bombeiros
 */
export async function getBombeiros() {
  try {
    const { data, error } = await supabase
      .from('bombeiros')
      .select(`
        id,
        nome,
        equipe,
        data_inicio,
        escalas(id, data, sigla)
      `);

    if (error) {
      console.error('[DB] Erro ao buscar bombeiros:', error);
      throw error;
    }
    console.log('[DB] Bombeiros encontrados:', data?.length || 0);

    return (data || []).map((b: any) => ({
      id: b.id,
      nome: b.nome,
      equipe: b.equipe,
      dataInicio: new Date(b.data_inicio),
      escalas: b.escalas || [],
    }));
  } catch (err) {
    console.error('[DB] Erro na função getBombeiros:', err);
    throw err;
  }
}

export async function getBombeiro(id: string) {
  const { data, error } = await supabase
    .from('bombeiros')
    .select(`
      id,
      nome,
      equipe,
      data_inicio,
      escalas(id, data, sigla)
    `)
    .eq('id', id)
    .limit(1);

  if (error) throw error;

  if (!data || data.length === 0) return [];

  const b = data[0];
  return [{
    id: b.id,
    nome: b.nome,
    equipe: b.equipe,
    dataInicio: new Date(b.data_inicio),
    escalas: b.escalas || [],
  }];
}

export async function createBombeiro(bombeiro: {
  id: string;
  nome: string;
  equipe: string;
  dataInicio: Date;
}) {
  try {
    const { data, error } = await supabase
      .from('bombeiros')
      .insert([{
        id: bombeiro.id,
        nome: bombeiro.nome,
        equipe: bombeiro.equipe,
        data_inicio: bombeiro.dataInicio.toISOString(),
      }])
      .select();

    if (error) {
      console.error('[DB] Erro ao inserir bombeiro:', error);
      throw error;
    }
    console.log('[DB] Bombeiro criado:', data);
    return { success: true };
  } catch (err) {
    console.error('[DB] Erro na função createBombeiro:', err);
    throw err;
  }
}

export async function updateBombeiro(
  id: string,
  updates: {
    nome?: string;
    equipe?: string;
    dataInicio?: Date;
  }
) {
  const updateData: any = {};
  if (updates.nome) updateData.nome = updates.nome;
  if (updates.equipe) updateData.equipe = updates.equipe;
  if (updates.dataInicio) updateData.data_inicio = updates.dataInicio.toISOString();

  const { error } = await supabase
    .from('bombeiros')
    .update(updateData)
    .eq('id', id);

  if (error) throw error;
  return { success: true };
}

export async function deleteBombeiro(id: string) {
  // Primeiro deleta as escalas associadas
  const { error: errorEscalas } = await supabase
    .from('escalas')
    .delete()
    .eq('bombeiro_id', id);

  if (errorEscalas) throw errorEscalas;

  // Depois deleta o bombeiro
  const { error } = await supabase
    .from('bombeiros')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
}

/**
 * Helpers para Escalas
 */
export async function getEscalas(bomberoId: string) {
  const { data, error } = await supabase
    .from('escalas')
    .select('id, data, sigla')
    .eq('bombeiro_id', bomberoId);

  if (error) throw error;

  return (data || []).map((e: any) => ({
    id: e.id,
    bomberoId: bomberoId,
    data: e.data,
    sigla: e.sigla,
  }));
}

export async function getEscala(bomberoId: string, data: string) {
  const { data: result, error } = await supabase
    .from('escalas')
    .select('id, data, sigla')
    .eq('bombeiro_id', bomberoId)
    .eq('data', data)
    .limit(1);

  if (error) throw error;

  if (!result || result.length === 0) return [];

  const e = result[0];
  return [{
    id: e.id,
    bomberoId: bomberoId,
    data: e.data,
    sigla: e.sigla,
  }];
}

export async function createEscala(escala: {
  id: string;
  bomberoId: string;
  data: string;
  sigla: string;
}) {
  const { error } = await supabase
    .from('escalas')
    .insert([{
      id: escala.id,
      bombeiro_id: escala.bomberoId,
      data: escala.data,
      sigla: escala.sigla,
    }]);

  if (error) throw error;
  return { success: true };
}

export async function updateEscala(
  id: string,
  updates: {
    sigla?: string;
  }
) {
  const { error } = await supabase
    .from('escalas')
    .update({ sigla: updates.sigla })
    .eq('id', id);

  if (error) throw error;
  return { success: true };
}

export async function deleteEscala(id: string) {
  const { error } = await supabase
    .from('escalas')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
}

export async function deleteEscalasByBombero(bomberoId: string) {
  const { error } = await supabase
    .from('escalas')
    .delete()
    .eq('bombeiro_id', bomberoId);

  if (error) throw error;
  return { success: true };
}
