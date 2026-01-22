/**
 * Script para criar usuário teste no Supabase
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bojuetqfkijkemtkswey.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvanVldHFma2lqa2VtdGtzd2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MjUwNTEsImV4cCI6MjA3NzAwMTA1MX0.x6qSkhUOePL1k1opYo_3hgLBQw9INLy44N8TJQDv9Y4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🎯 Criando usuário teste no Supabase...\n');

async function criarUsuario() {
  try {
    console.log('📧 Email: paula@teste.com');
    console.log('🔑 Senha: Paula@123456\n');

    const { data, error } = await supabase.auth.signUp({
      email: 'paula@teste.com',
      password: 'Paula@123456',
      options: {
        data: {
          nome: 'Paula do Amaral Santos',
        },
        emailRedirectTo: undefined,
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('⚠️  Usuário já existe! Isso é OK.\n');
        console.log('📋 Você pode fazer login com:');
        console.log('   Email: paula@teste.com');
        console.log('   Senha: Paula@123456\n');
        return true;
      }
      throw error;
    }

    console.log('✅ Usuário criado com sucesso!');
    console.log(`🆔 User ID: ${data.user?.id}\n`);

    // Aguardar trigger criar nutricionista
    console.log('⏳ Aguardando trigger criar nutricionista...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Atualizar dados do nutricionista
    console.log('📝 Atualizando dados do nutricionista...\n');

    const { data: nutriData, error: nutriError } = await supabase
      .from('nutricionistas')
      .update({
        nome: 'Paula do Amaral Santos',
        crn: '08100732',
        telefone: '(21) 99999-9999',
        plano: 'profissional',
        limite_pacientes: 500,
      })
      .eq('id', data.user.id)
      .select()
      .single();

    if (nutriError) {
      console.log('⚠️  Erro ao atualizar nutricionista:', nutriError.message);
      console.log('💡 Você pode atualizar manualmente no Supabase Dashboard\n');
    } else {
      console.log('✅ Nutricionista atualizado com sucesso!');
      console.log('📊 Dados:');
      console.log(`   Nome: ${nutriData.nome}`);
      console.log(`   CRN: ${nutriData.crn}`);
      console.log(`   Plano: ${nutriData.plano}`);
      console.log(`   Limite: ${nutriData.limite_pacientes} pacientes\n`);
    }

    return true;
  } catch (error) {
    console.error('❌ Erro:', error.message);
    return false;
  }
}

async function testarLogin() {
  console.log('🔐 Testando login...\n');

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'paula@teste.com',
      password: 'Paula@123456',
    });

    if (error) throw error;

    console.log('✅ Login realizado com sucesso!');
    console.log(`👤 Email: ${data.user.email}`);
    console.log(`🆔 ID: ${data.user.id}\n`);

    // Buscar dados do nutricionista
    const { data: nutri, error: nutriError } = await supabase
      .from('nutricionistas')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (nutriError) {
      console.log('⚠️  Erro ao buscar nutricionista:', nutriError.message);
    } else {
      console.log('📊 Dados do nutricionista:');
      console.log(`   Nome: ${nutri.nome}`);
      console.log(`   CRN: ${nutri.crn || 'Não informado'}`);
      console.log(`   Plano: ${nutri.plano}`);
      console.log(`   Ativo: ${nutri.ativo ? 'Sim' : 'Não'}`);
      console.log(`   Expira em: ${nutri.data_expiracao}\n`);
    }

    return true;
  } catch (error) {
    console.error('❌ Erro no login:', error.message);
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  CRIAR USUÁRIO TESTE - Paula Amaral Nutrition');
  console.log('═══════════════════════════════════════════════════════\n');

  const usuarioCriado = await criarUsuario();

  if (usuarioCriado) {
    await testarLogin();

    console.log('═══════════════════════════════════════════════════════');
    console.log('  ✅ CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('🎉 Supabase está configurado e funcionando!\n');
    console.log('📋 CREDENCIAIS DE TESTE:');
    console.log('   Email: paula@teste.com');
    console.log('   Senha: Paula@123456\n');

    console.log('🚀 PRÓXIMOS PASSOS:');
    console.log('   1. Sistema atual (localStorage) continua funcionando');
    console.log('   2. Migrar App.jsx para usar Supabase (próxima etapa)');
    console.log('   3. Testar com dados do Supabase');
    console.log('   4. Deploy na Vercel com Supabase\n');
  }
}

main().catch(console.error);
