const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bojuetqfkijkemtkswey.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvanVldHFma2lqa2VtdGtzd2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MjUwNTEsImV4cCI6MjA3NzAwMTA1MX0.x6qSkhUOePL1k1opYo_3hgLBQw9INLy44N8TJQDv9Y4';
const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('🧪 SIMULANDO SALVAR PACIENTE NO SISTEMA\n');

  // 1. Fazer login
  console.log('1️⃣ Fazendo login...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'paula@nutricionista.com',
    password: 'neco1910'
  });

  if (authError) {
    console.log('❌ Erro no login:', authError.message);
    return;
  }

  console.log('✅ Login OK\n');

  // 2. Simular dados do formulário (como o App.jsx envia)
  const dadosSupabase = {
    nome: 'TESTE - João Silva (DELETAR DEPOIS)',
    data_nascimento: '1990-05-20',
    sexo: 'Masculino',
    telefone: '(21) 99999-9999',
    email: 'joao@teste.com',
    cpf: null,
    dados_completos: {
      paciente: {
        nome: 'TESTE - João Silva',
        dataNascimento: '1990-05-20',
        sexo: 'Masculino',
        telefone: '(21) 99999-9999',
        email: 'joao@teste.com',
        profissao: 'Engenheiro',
        objetivo: 'Emagrecimento',
        restricoes: 'Sem restrições'
      },
      avaliacaoInicial: {
        data: '2025-10-26',
        peso: '85',
        altura: '175',
        circCintura: '90',
        circQuadril: '100',
        imc: '27.76'
      },
      planoAlimentar: {
        objetivoClinico: 'Reduzir 5kg em 2 meses',
        prescricao: {
          vet: '2000',
          cho: '250',
          ptn: '150',
          lip: '67'
        },
        refeicoes: {
          cafeManha: 'Pão integral com queijo branco e café',
          lancheManha: 'Fruta',
          almoco: 'Arroz, feijão, frango grelhado e salada',
          lancheTarde: 'Iogurte natural',
          jantar: 'Peixe grelhado com legumes',
          ceia: 'Chá'
        }
      }
    }
  };

  console.log('2️⃣ Criando paciente com dados completos...\n');
  console.log('📋 Dados:', JSON.stringify(dadosSupabase, null, 2).substring(0, 200) + '...\n');

  // 3. Tentar criar (COM nutricionista_id - como o serviço faz)
  const { data, error } = await supabase
    .from('pacientes')
    .insert({
      ...dadosSupabase,
      nutricionista_id: authData.user.id
    })
    .select()
    .single();

  if (error) {
    console.log('❌ ERRO AO CRIAR PACIENTE:');
    console.log('   Código:', error.code);
    console.log('   Mensagem:', error.message);
    console.log('   Detalhes:', error.details);
    console.log('   Hint:', error.hint);

    // Diagnósticos
    console.log('\n🔍 DIAGNÓSTICO:');

    if (error.message.includes('violates row-level security')) {
      console.log('   ⚠️ Problema: Row Level Security bloqueou');
      console.log('   💡 Solução: Verificar policies no Supabase');
    }

    if (error.message.includes('column')) {
      console.log('   ⚠️ Problema: Coluna não existe ou nome errado');
      console.log('   💡 Solução: Verificar schema da tabela');
    }

    if (error.message.includes('null value')) {
      console.log('   ⚠️ Problema: Campo obrigatório está vazio');
      console.log('   💡 Solução: Preencher campo obrigatório');
    }

    if (error.message.includes('jsonb')) {
      console.log('   ⚠️ Problema: Erro no formato JSON');
      console.log('   💡 Solução: Verificar estrutura do dados_completos');
    }

    return;
  }

  console.log('✅ PACIENTE CRIADO COM SUCESSO!\n');
  console.log('🆔 ID:', data.id);
  console.log('👤 Nome:', data.nome);
  console.log('📧 Email:', data.email);
  console.log('📊 Tem dados_completos:', data.dados_completos ? 'Sim' : 'Não');

  if (data.dados_completos) {
    console.log('\n📋 Dados completos salvos:');
    console.log('   - Peso:', data.dados_completos.avaliacaoInicial?.peso, 'kg');
    console.log('   - Altura:', data.dados_completos.avaliacaoInicial?.altura, 'cm');
    console.log('   - Objetivo:', data.dados_completos.planoAlimentar?.objetivoClinico);
  }

  console.log('\n✅ TESTE PASSOU! Sistema funcionando corretamente.');
  console.log('\n💡 Se o erro foi no navegador, pode ser:');
  console.log('   1. Sessão expirada (fazer logout e login de novo)');
  console.log('   2. Cache do navegador (Ctrl+Shift+R para recarregar)');
  console.log('   3. Erro de JavaScript no console (F12 para ver)');
})();
