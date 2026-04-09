import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres:Febomandradina_1650@db.gntlcxaoxtzukaizoxoi.supabase.co:5432/postgres';

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

console.log('🔄 Conectando ao PostgreSQL do Supabase...');

try {
  await client.connect();
  console.log('✅ Conectado com sucesso!');

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
    `ALTER PUBLICATION supabase_realtime ADD TABLE escalas;`,
    
    // 4. Configurar RLS (Row Level Security)
    `ALTER TABLE bombeiros ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE escalas ENABLE ROW LEVEL SECURITY;`,
    
    // 5. Criar políticas RLS para acesso público
    `CREATE POLICY "Allow public read on bombeiros" ON bombeiros FOR SELECT USING (true);`,
    `CREATE POLICY "Allow public insert on bombeiros" ON bombeiros FOR INSERT WITH CHECK (true);`,
    `CREATE POLICY "Allow public update on bombeiros" ON bombeiros FOR UPDATE USING (true);`,
    `CREATE POLICY "Allow public delete on bombeiros" ON bombeiros FOR DELETE USING (true);`,
    
    `CREATE POLICY "Allow public read on escalas" ON escalas FOR SELECT USING (true);`,
    `CREATE POLICY "Allow public insert on escalas" ON escalas FOR INSERT WITH CHECK (true);`,
    `CREATE POLICY "Allow public update on escalas" ON escalas FOR UPDATE USING (true);`,
    `CREATE POLICY "Allow public delete on escalas" ON escalas FOR DELETE USING (true);`
  ];

  // Executar cada comando
  for (let i = 0; i < sqlCommands.length; i++) {
    console.log(`\n📝 Executando comando ${i + 1}/${sqlCommands.length}...`);
    
    try {
      await client.query(sqlCommands[i].trim());
      console.log(`✅ Comando ${i + 1} executado com sucesso!`);
    } catch (e) {
      // Ignorar erros de "já existe"
      if (e.message.includes('already exists') || e.message.includes('duplicate key')) {
        console.log(`⚠️ Já existe (ignorado): ${e.message.split('\n')[0]}`);
      } else {
        console.log(`❌ Erro: ${e.message.split('\n')[0]}`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Processo concluído!');
  console.log('='.repeat(60));
  console.log('\n📊 Verificando tabelas criadas...');
  
  const result = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('bombeiros', 'escalas')
  `);
  
  console.log(`\n✅ Tabelas encontradas: ${result.rows.length}`);
  result.rows.forEach(row => {
    console.log(`   - ${row.table_name}`);
  });

} catch (e) {
  console.error('❌ Erro de conexão:', e.message);
} finally {
  await client.end();
  console.log('\n🔌 Conexão encerrada.');
}
