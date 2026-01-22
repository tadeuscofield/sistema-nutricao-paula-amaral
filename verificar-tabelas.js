/**
 * Script rápido para verificar se as tabelas foram criadas
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bojuetqfkijkemtkswey.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvanVldHFma2lqa2VtdGtzd2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MjUwNTEsImV4cCI6MjA3NzAwMTA1MX0.x6qSkhUOePL1k1opYo_3hgLBQw9INLy44N8TJQDv9Y4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔍 Verificando tabelas no Supabase...\n');

const tabelas = [
  'nutricionistas',
  'pacientes',
  'avaliacoes_antropometricas',
  'anamneses',
  'planos_alimentares',
  'acompanhamentos',
  'arquivos'
];

let tabelasCriadas = 0;

for (const tabela of tabelas) {
  try {
    const { data, error } = await supabase
      .from(tabela)
      .select('count')
      .limit(1);

    if (error) {
      console.log(`❌ ${tabela}: NÃO CRIADA`);
      console.log(`   Erro: ${error.message}\n`);
    } else {
      console.log(`✅ ${tabela}: OK`);
      tabelasCriadas++;
    }
  } catch (error) {
    console.log(`❌ ${tabela}: ERRO`);
    console.log(`   ${error.message}\n`);
  }
}

console.log('\n═══════════════════════════════════════');
console.log(`Tabelas criadas: ${tabelasCriadas}/7`);
console.log('═══════════════════════════════════════\n');

if (tabelasCriadas === 7) {
  console.log('🎉 TODAS AS TABELAS FORAM CRIADAS COM SUCESSO!\n');
  console.log('📋 Próximos passos:');
  console.log('   1. Pressione ENTER no script anterior (npm run setup)');
  console.log('   2. O script vai criar o usuário teste');
  console.log('   3. Testar login\n');
} else {
  console.log('⚠️  FALTAM TABELAS!\n');
  console.log('📋 O que fazer:');
  console.log('   1. Vá no Supabase SQL Editor');
  console.log('   2. Execute o arquivo schema.sql completo');
  console.log('   3. Rode este script novamente: node verificar-tabelas.js\n');
}

process.exit(0);
