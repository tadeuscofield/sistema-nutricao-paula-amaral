const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bojuetqfkijkemtkswey.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvanVldHFqa2lqa2VtdGtzd2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MjUwNTEsImV4cCI6MjA3NzAwMTA1MX0.x6qSkhUOePL1k1opYo_3hgLBQw9INLy44N8TJQDv9Y4';
const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('🔍 DEBUG COMPLETO - VERIFICANDO ESTRUTURA DO PACIENTE\n');

  // 1. Login
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: 'paula@nutricionista.com',
    password: 'neco1910'
  });

  console.log('✅ Login OK\n');

  // 2. Buscar o paciente "João Silva"
  console.log('📋 Buscando paciente João Silva...\n');

  const { data: pacientes, error } = await supabase
    .from('pacientes')
    .select('*')
    .ilike('nome', '%João Silva%');

  if (error) {
    console.log('❌ Erro:', error.message);
    return;
  }

  if (pacientes.length === 0) {
    console.log('⚠️ Paciente não encontrado');
    return;
  }

  const paciente = pacientes[0];

  console.log('✅ Paciente encontrado!\n');
  console.log('📊 ESTRUTURA DO SUPABASE:');
  console.log(JSON.stringify(paciente, null, 2));

  console.log('\n═══════════════════════════════════════');
  console.log('🔍 ANÁLISE DA ESTRUTURA:');
  console.log('═══════════════════════════════════════\n');

  console.log('🆔 ID:', paciente.id);
  console.log('👤 Nome:', paciente.nome);
  console.log('📅 Data Nascimento:', paciente.data_nascimento);
  console.log('⚧ Sexo:', paciente.sexo);
  console.log('📱 Telefone:', paciente.telefone);
  console.log('📧 Email:', paciente.email);
  console.log('');

  console.log('📊 Tem dados_completos?', paciente.dados_completos ? 'SIM' : 'NÃO');

  if (paciente.dados_completos) {
    console.log('\n📋 ESTRUTURA DO dados_completos:');
    console.log('   - paciente:', paciente.dados_completos.paciente ? 'SIM' : 'NÃO');
    console.log('   - avaliacaoInicial:', paciente.dados_completos.avaliacaoInicial ? 'SIM' : 'NÃO');
    console.log('   - planoAlimentar:', paciente.dados_completos.planoAlimentar ? 'SIM' : 'NÃO');
    console.log('   - anamnese:', paciente.dados_completos.anamnese ? 'SIM' : 'NÃO');
    console.log('   - acompanhamento:', paciente.dados_completos.acompanhamento ? 'SIM' : 'NÃO');
  }

  console.log('\n═══════════════════════════════════════');
  console.log('🎯 ADAPTADOR ESPERADO:');
  console.log('═══════════════════════════════════════\n');

  const adaptado = {
    id: paciente.id,
    dados: {
      nome: paciente.nome,
      dataNascimento: paciente.data_nascimento,
      sexo: paciente.sexo,
      telefone: paciente.telefone,
      email: paciente.email,
      cpf: paciente.cpf,
      profissao: paciente.dados_completos?.paciente?.profissao || '',
      objetivo: paciente.dados_completos?.paciente?.objetivo || '',
      restricoes: paciente.dados_completos?.paciente?.restricoes || '',
      status: 'ativo',
      ultimaConsulta: paciente.updated_at || paciente.created_at
    },
    avaliacaoInicial: paciente.dados_completos?.avaliacaoInicial || {},
    planoAlimentar: paciente.dados_completos?.planoAlimentar || {},
    anamnese: paciente.dados_completos?.anamnese || {},
    acompanhamento: paciente.dados_completos?.acompanhamento || []
  };

  console.log('📦 Estrutura adaptada:');
  console.log(JSON.stringify(adaptado, null, 2));

  console.log('\n═══════════════════════════════════════');
  console.log('✅ DEBUG CONCLUÍDO');
  console.log('═══════════════════════════════════════\n');

  console.log('💡 VERIFICAÇÕES:');
  console.log('   1. adaptado.id existe?', adaptado.id ? 'SIM ✅' : 'NÃO ❌');
  console.log('   2. adaptado.dados existe?', adaptado.dados ? 'SIM ✅' : 'NÃO ❌');
  console.log('   3. adaptado.dados.nome existe?', adaptado.dados.nome ? 'SIM ✅' : 'NÃO ❌');
})();
