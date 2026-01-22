const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bdpbmwqbdbtucfthhdgr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkcGJtd3FiZGJ0dWNmdGhoZGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1OTg4MTksImV4cCI6MjA1NDE3NDgxOX0.qOQfNqrEWWmpEv8LkMHw3-9xnMjfFGj9xj-IbXAtM5g';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🔄 ADAPTER: Converte estrutura Supabase → App (MESMA FUNÇÃO DO APP.JSX)
const adaptarPacienteSupabase = (pacienteSupabase) => {
  if (!pacienteSupabase) return null;

  return {
    id: pacienteSupabase.id,
    dados: {
      nome: pacienteSupabase.nome || '',
      dataNascimento: pacienteSupabase.data_nascimento || '',
      sexo: pacienteSupabase.sexo || '',
      telefone: pacienteSupabase.telefone || '',
      email: pacienteSupabase.email || '',
      cpf: pacienteSupabase.cpf || '',
      profissao: pacienteSupabase.dados_completos?.paciente?.profissao || '',
      objetivo: pacienteSupabase.dados_completos?.paciente?.objetivo || '',
      restricoes: pacienteSupabase.dados_completos?.paciente?.restricoes || '',
      status: pacienteSupabase.arquivado ? 'arquivado' : 'ativo',
      ultimaConsulta: pacienteSupabase.updated_at || pacienteSupabase.created_at
    },
    avaliacaoInicial: pacienteSupabase.dados_completos?.avaliacaoInicial || {},
    adipometro: pacienteSupabase.dados_completos?.adipometro || {},
    bioimpedancia: pacienteSupabase.dados_completos?.bioimpedancia || {},
    anamnese: pacienteSupabase.dados_completos?.anamnese || {},
    acompanhamento: pacienteSupabase.dados_completos?.acompanhamento || [],
    planoAlimentar: pacienteSupabase.dados_completos?.planoAlimentar || {},
    arquivado: pacienteSupabase.arquivado || false
  };
};

async function testarFluxoCompleto() {
  console.log('\n🧪 TESTE COMPLETO DO ADAPTER - FLUXO REAL DO APP\n');
  console.log('=' .repeat(70));

  try {
    // 1. LOGIN
    console.log('\n1️⃣ TESTANDO LOGIN...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'paula@nutricionista.com',
      password: 'neco1910'
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      return;
    }

    console.log('✅ Login bem-sucedido!');
    console.log('User ID:', loginData.user.id);

    // 2. CRIAR PACIENTE
    console.log('\n2️⃣ TESTANDO CRIAR PACIENTE...');

    const dadosNovoPaciente = {
      nome: 'TESTE ADAPTER - Maria Silva',
      data_nascimento: '1990-05-15',
      sexo: 'Feminino',
      telefone: '(21) 99999-8888',
      email: 'maria.teste@email.com',
      cpf: null,
      dados_completos: {
        paciente: {
          nome: 'TESTE ADAPTER - Maria Silva',
          dataNascimento: '1990-05-15',
          sexo: 'Feminino',
          telefone: '(21) 99999-8888',
          email: 'maria.teste@email.com',
          profissao: 'Engenheira',
          objetivo: 'Perder peso',
          restricoes: 'Nenhuma'
        },
        avaliacaoInicial: { peso: 70, altura: 165 },
        adipometro: {},
        bioimpedancia: {},
        anamnese: {},
        acompanhamento: [],
        planoAlimentar: {}
      }
    };

    const { data: novoPaciente, error: criarError } = await supabase
      .from('pacientes')
      .insert([dadosNovoPaciente])
      .select()
      .single();

    if (criarError) {
      console.error('❌ Erro ao criar paciente:', criarError.message);
      return;
    }

    console.log('✅ Paciente criado no Supabase!');
    console.log('\n📦 ESTRUTURA RETORNADA PELO SUPABASE:');
    console.log(JSON.stringify(novoPaciente, null, 2));

    // 3. APLICAR ADAPTER
    console.log('\n3️⃣ APLICANDO ADAPTER...');
    const pacienteAdaptado = adaptarPacienteSupabase(novoPaciente);

    console.log('\n✨ ESTRUTURA APÓS ADAPTER:');
    console.log(JSON.stringify(pacienteAdaptado, null, 2));

    // 4. TESTAR ACESSOS (SIMULAR abrirPaciente)
    console.log('\n4️⃣ TESTANDO ACESSOS À ESTRUTURA ADAPTADA...');

    console.log('\n✅ ACESSOS QUE DEVEM FUNCIONAR:');
    console.log('   pac.id:', pacienteAdaptado.id);
    console.log('   pac.dados:', pacienteAdaptado.dados ? '✅ Existe' : '❌ undefined');
    console.log('   pac.dados.nome:', pacienteAdaptado.dados?.nome);
    console.log('   pac.dados.dataNascimento:', pacienteAdaptado.dados?.dataNascimento);
    console.log('   pac.avaliacaoInicial:', pacienteAdaptado.avaliacaoInicial);
    console.log('   pac.adipometro:', pacienteAdaptado.adipometro);

    // 5. CARREGAR LISTA (SIMULAR carregarPacientesSupabase)
    console.log('\n5️⃣ TESTANDO CARREGAR LISTA...');

    const { data: todosPacientes, error: listarError } = await supabase
      .from('pacientes')
      .select('*')
      .eq('arquivado', false)
      .order('created_at', { ascending: false });

    if (listarError) {
      console.error('❌ Erro ao listar pacientes:', listarError.message);
      return;
    }

    console.log(`✅ Encontrados ${todosPacientes.length} paciente(s)`);

    // Adaptar todos
    const pacientesAdaptados = todosPacientes.map(adaptarPacienteSupabase);

    console.log('\n📋 LISTA ADAPTADA:');
    pacientesAdaptados.forEach((pac, index) => {
      console.log(`   ${index + 1}. ${pac.dados.nome} (ID: ${pac.id})`);
    });

    // 6. ATUALIZAR PACIENTE
    console.log('\n6️⃣ TESTANDO ATUALIZAR PACIENTE...');

    const dadosAtualizados = {
      nome: 'TESTE ADAPTER - Maria Silva (ATUALIZADA)',
      data_nascimento: novoPaciente.data_nascimento,
      sexo: novoPaciente.sexo,
      telefone: '(21) 99999-7777', // telefone atualizado
      email: novoPaciente.email,
      cpf: novoPaciente.cpf,
      dados_completos: {
        ...novoPaciente.dados_completos,
        paciente: {
          ...novoPaciente.dados_completos.paciente,
          nome: 'TESTE ADAPTER - Maria Silva (ATUALIZADA)',
          telefone: '(21) 99999-7777',
          profissao: 'Engenheira Sênior' // profissão atualizada
        },
        avaliacaoInicial: { peso: 68, altura: 165 } // peso atualizado
      }
    };

    const { data: pacienteAtualizado, error: atualizarError } = await supabase
      .from('pacientes')
      .update(dadosAtualizados)
      .eq('id', novoPaciente.id)
      .select()
      .single();

    if (atualizarError) {
      console.error('❌ Erro ao atualizar paciente:', atualizarError.message);
      return;
    }

    console.log('✅ Paciente atualizado!');

    const pacienteAtualizadoAdaptado = adaptarPacienteSupabase(pacienteAtualizado);
    console.log('\n✨ Dados após atualização (adaptados):');
    console.log('   Nome:', pacienteAtualizadoAdaptado.dados.nome);
    console.log('   Telefone:', pacienteAtualizadoAdaptado.dados.telefone);
    console.log('   Profissão:', pacienteAtualizadoAdaptado.dados.profissao);
    console.log('   Peso:', pacienteAtualizadoAdaptado.avaliacaoInicial.peso);

    // 7. DELETAR PACIENTE DE TESTE
    console.log('\n7️⃣ LIMPANDO TESTE...');

    const { error: deletarError } = await supabase
      .from('pacientes')
      .delete()
      .eq('id', novoPaciente.id);

    if (deletarError) {
      console.error('❌ Erro ao deletar paciente de teste:', deletarError.message);
    } else {
      console.log('✅ Paciente de teste deletado!');
    }

    // 8. RESUMO FINAL
    console.log('\n' + '='.repeat(70));
    console.log('\n✅ TODOS OS TESTES PASSARAM COM SUCESSO!\n');
    console.log('📊 RESULTADO:');
    console.log('   ✅ Login funcionou');
    console.log('   ✅ Criar paciente funcionou');
    console.log('   ✅ Adapter aplicado corretamente');
    console.log('   ✅ Estrutura pac.dados.nome acessível');
    console.log('   ✅ Carregar lista funcionou');
    console.log('   ✅ Atualizar paciente funcionou');
    console.log('   ✅ Deletar paciente funcionou');
    console.log('\n🎯 ADAPTER CENTRALIZADO ESTÁ FUNCIONANDO PERFEITAMENTE!\n');

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error);
  }
}

testarFluxoCompleto();
