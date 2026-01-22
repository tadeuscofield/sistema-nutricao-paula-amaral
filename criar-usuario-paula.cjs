const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bojuetqfkijkemtkswey.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvanVldHFma2lqa2VtdGtzd2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MjUwNTEsImV4cCI6MjA3NzAwMTA1MX0.x6qSkhUOePL1k1opYo_3hgLBQw9INLy44N8TJQDv9Y4';
const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('👤 CRIANDO NOVO USUÁRIO PARA PAULA\n');

  const email = 'paula@nutricionista.com';
  const senha = 'neco1910'; // Case-insensitive no Supabase

  console.log('📧 Email:', email);
  console.log('🔑 Senha:', senha);
  console.log('');

  // Criar usuário
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: senha,
    options: {
      data: {
        nome: 'Paula do Amaral Santos'
      }
    }
  });

  if (error) {
    console.log('❌ Erro ao criar usuário:', error.message);

    // Se já existe, tentar fazer login
    if (error.message.includes('already registered')) {
      console.log('\n⚠️ Usuário já existe. Testando login...\n');

      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha
      });

      if (loginError) {
        console.log('❌ Erro no login:', loginError.message);
        console.log('\n💡 SOLUÇÃO: Use o Supabase Dashboard para resetar a senha:');
        console.log('https://supabase.com/dashboard/project/bojuetqfkijkemtkswey/auth/users');
      } else {
        console.log('✅ Login OK! Usuário já existe e senha está correta');
        console.log('🆔 User ID:', loginData.user.id);
      }
    }
    return;
  }

  console.log('✅ Usuário criado com sucesso!');
  console.log('🆔 User ID:', data.user.id);
  console.log('📧 Email:', data.user.email);
  console.log('');

  // Aguardar trigger criar nutricionista
  console.log('⏳ Aguardando trigger criar entrada na tabela nutricionistas...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Atualizar dados do nutricionista
  console.log('📝 Atualizando dados da nutricionista...\n');

  const { data: nutriData, error: nutriError } = await supabase
    .from('nutricionistas')
    .update({
      nome: 'Paula do Amaral Santos',
      crn: '08100732',
      telefone: '(21) 99999-9999',
      plano: 'profissional',
      limite_pacientes: 200,
      ativo: true,
      data_expiracao: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 ano
    })
    .eq('id', data.user.id)
    .select()
    .single();

  if (nutriError) {
    console.log('⚠️ Erro ao atualizar nutricionista:', nutriError.message);
    console.log('\n💡 Você pode atualizar manualmente no Supabase Dashboard');
  } else {
    console.log('✅ Dados da nutricionista atualizados!');
    console.log('   Nome:', nutriData.nome);
    console.log('   CRN:', nutriData.crn);
    console.log('   Plano:', nutriData.plano);
    console.log('   Limite Pacientes:', nutriData.limite_pacientes);
    console.log('   Expira em:', nutriData.data_expiracao.split('T')[0]);
  }

  console.log('\n═══════════════════════════════════════');
  console.log('  ✅ USUÁRIO PAULA CONFIGURADO!');
  console.log('═══════════════════════════════════════');
  console.log('\n📋 CREDENCIAIS FINAIS:');
  console.log('   Email: paula@nutricionista.com');
  console.log('   Senha: neco1910');
  console.log('   (Case-insensitive)\n');

  // Testar login
  console.log('🔐 Testando login...\n');

  const { data: testLogin, error: testError } = await supabase.auth.signInWithPassword({
    email: email,
    password: senha
  });

  if (testError) {
    console.log('❌ Erro no teste de login:', testError.message);
  } else {
    console.log('✅ TESTE DE LOGIN: PASSOU!');
    console.log('👤 Email:', testLogin.user.email);
    console.log('🆔 ID:', testLogin.user.id);
  }

  console.log('\n🚀 Próximo passo: Atualizar App.jsx com novo email padrão');
})();
