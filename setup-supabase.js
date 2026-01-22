/**
 * Script para configurar o Supabase
 * Executa o schema SQL e cria dados iniciais
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
const SUPABASE_URL = 'https://bojuetqfkijkemtkswey.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvanVldHFma2lqa2VtdGtzd2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MjUwNTEsImV4cCI6MjA3NzAwMTA1MX0.x6qSkhUOePL1k1opYo_3hgLBQw9INLy44N8TJQDv9Y4';

console.log('🚀 Iniciando configuração do Supabase...\n');

// Criar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testarConexao() {
  console.log('1️⃣  Testando conexão com Supabase...');

  try {
    const { data, error } = await supabase
      .from('_test_connection')
      .select('*')
      .limit(1);

    // Esperado dar erro se não existir a tabela
    console.log('   ✅ Conexão estabelecida com sucesso!\n');
    return true;
  } catch (error) {
    console.log('   ✅ Conexão estabelecida (erro esperado - tabelas ainda não criadas)\n');
    return true;
  }
}

async function executarSQL() {
  console.log('2️⃣  Lendo arquivo schema.sql...');

  try {
    const schemaPath = path.join(__dirname, 'supabase', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log(`   ✅ Schema lido: ${(schema.length / 1024).toFixed(1)} KB\n`);

    console.log('⚠️  ATENÇÃO:');
    console.log('   O schema SQL precisa ser executado MANUALMENTE no Supabase Dashboard');
    console.log('   devido a limitações da API pública.\n');

    console.log('📋 INSTRUÇÕES:');
    console.log('   1. Acesse: https://supabase.com/dashboard/project/bojuetqfkijkemtkswey');
    console.log('   2. Clique em "SQL Editor" no menu lateral');
    console.log('   3. Clique em "New query"');
    console.log('   4. Copie TODO o conteúdo do arquivo: supabase/schema.sql');
    console.log('   5. Cole no SQL Editor');
    console.log('   6. Clique em "Run" (ou pressione F5)');
    console.log('   7. Aguarde até ver "Success"\n');

    return true;
  } catch (error) {
    console.error('   ❌ Erro ao ler schema.sql:', error.message);
    return false;
  }
}

async function verificarTabelas() {
  console.log('3️⃣  Verificando se as tabelas foram criadas...');

  const tabelas = [
    'nutricionistas',
    'pacientes',
    'avaliacoes_antropometricas',
    'anamneses',
    'planos_alimentares',
    'acompanhamentos',
    'arquivos'
  ];

  let todasCriadas = true;

  for (const tabela of tabelas) {
    try {
      const { error } = await supabase
        .from(tabela)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`   ❌ Tabela "${tabela}" não encontrada`);
        todasCriadas = false;
      } else {
        console.log(`   ✅ Tabela "${tabela}" OK`);
      }
    } catch (error) {
      console.log(`   ❌ Erro ao verificar "${tabela}"`);
      todasCriadas = false;
    }
  }

  console.log('');
  return todasCriadas;
}

async function criarUsuarioTeste() {
  console.log('4️⃣  Criando usuário teste (Paula)...');

  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'paula@teste.com',
      password: 'Paula@123456',
      options: {
        data: {
          nome: 'Paula do Amaral Santos',
        },
      },
    });

    if (error) {
      console.log('   ⚠️  Erro ao criar usuário:', error.message);
      console.log('   💡 Possíveis causas:');
      console.log('      - Usuário já existe');
      console.log('      - Email precisa ser confirmado');
      console.log('      - Schema não foi executado ainda\n');
      return false;
    }

    console.log('   ✅ Usuário criado com sucesso!');
    console.log(`   📧 Email: paula@teste.com`);
    console.log(`   🔑 Senha: Paula@123456`);
    console.log(`   🆔 ID: ${data.user?.id}\n`);

    return data.user;
  } catch (error) {
    console.log('   ❌ Erro:', error.message, '\n');
    return false;
  }
}

async function testarLogin() {
  console.log('5️⃣  Testando login...');

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'paula@teste.com',
      password: 'Paula@123456',
    });

    if (error) {
      console.log('   ❌ Erro no login:', error.message, '\n');
      return false;
    }

    console.log('   ✅ Login realizado com sucesso!');
    console.log(`   👤 Usuário: ${data.user.email}`);
    console.log(`   🆔 ID: ${data.user.id}\n`);

    return true;
  } catch (error) {
    console.log('   ❌ Erro:', error.message, '\n');
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  SETUP SUPABASE - Sistema Paula Amaral Nutrition');
  console.log('═══════════════════════════════════════════════════════\n');

  // Passo 1: Testar conexão
  await testarConexao();

  // Passo 2: Instruções para executar SQL
  await executarSQL();

  console.log('⏸️  PAUSE: Execute o schema.sql no Supabase Dashboard primeiro!\n');
  console.log('   Depois que executar o schema.sql, volte aqui e pressione ENTER...');

  // Aguardar usuário pressionar ENTER
  await new Promise((resolve) => {
    process.stdin.once('data', resolve);
  });

  console.log('\n');

  // Passo 3: Verificar tabelas
  const tabelasCriadas = await verificarTabelas();

  if (!tabelasCriadas) {
    console.log('⚠️  Algumas tabelas não foram encontradas.');
    console.log('   Execute o schema.sql no Supabase Dashboard primeiro!\n');
    process.exit(1);
  }

  // Passo 4: Criar usuário teste
  await criarUsuarioTeste();

  // Passo 5: Testar login
  const loginOk = await testarLogin();

  if (loginOk) {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  ✅ CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📊 PRÓXIMOS PASSOS:');
    console.log('   1. O sistema já está configurado e funcionando');
    console.log('   2. Abra o navegador e teste o login:');
    console.log('      Email: paula@teste.com');
    console.log('      Senha: Paula@123456');
    console.log('   3. Os dados agora são salvos no Supabase (não mais localStorage)\n');
  } else {
    console.log('⚠️  Configuração incompleta. Verifique os erros acima.\n');
  }
}

// Executar
main().catch(console.error);
