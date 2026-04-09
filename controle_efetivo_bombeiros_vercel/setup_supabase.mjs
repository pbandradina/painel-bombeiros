import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://gntlcxaoxtzukaizoxoi.supabase.co'
const SUPABASE_KEY = 'sb_publishable_IoOm3TqfOAQFsudkzImzxA_5_3pui7x'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

console.log('🔄 Conectando ao Supabase...')
console.log(`URL: ${SUPABASE_URL}`)

// SQL para criar as tabelas
const sqlCommands = [
  // 1. Criar tabela de bombeiros
  `
  CREATE TABLE IF NOT EXISTS bombeiros (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome text NOT NULL,
    equipe text NOT NULL,
    data_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  `,
  
  // 2. Criar tabela de escalas
  `
  CREATE TABLE IF NOT EXISTS escalas (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    bombeiro_id uuid REFERENCES bombeiros(id) ON DELETE CASCADE,
    data date NOT NULL,
    sigla text NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(bombeiro_id, data)
  );
  `,
  
  // 3. Habilitar Realtime
  `ALTER PUBLICATION supabase_realtime ADD TABLE bombeiros;`,
  `ALTER PUBLICATION supabase_realtime ADD TABLE escalas;`
]

// Executar cada comando
for (let i = 0; i < sqlCommands.length; i++) {
  console.log(`\n📝 Executando comando ${i + 1}/${sqlCommands.length}...`)
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlCommands[i].trim()
    })
    
    if (error) {
      console.log(`⚠️ Erro: ${error.message}`)
    } else {
      console.log(`✅ Comando ${i + 1} executado com sucesso!`)
    }
  } catch (e) {
    console.log(`❌ Erro ao executar comando ${i + 1}: ${e.message}`)
  }
}

console.log('\n' + '='.repeat(50))
console.log('✅ Processo concluído!')
console.log('='.repeat(50))
