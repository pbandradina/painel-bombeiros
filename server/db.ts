import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getBombeiros() {
  // Busca simples apenas na tabela bombeiros para testar a conexão
  const { data, error } = await supabase
    .from("bombeiros")
    .select("*"); 

  if (error) {
    console.error("Erro Supabase:", error.message);
    throw error;
  }
  return data || [];
}