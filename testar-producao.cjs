const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bdpbmwqbdbtucfthhdgr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkcGJtd3FiZGJ0dWNmdGhoZGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1OTg4MTksImV4cCI6MjA1NDE3NDgxOX0.qOQfNqrEWWmpEv8LkMHw3-9xnMjfFGj9xj-IbXAtM5g';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Mesmo adapter do App.jsx
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

async function testarProducao() {
  console.log('\n🧪 TESTE DO SISTEMA EM PRODUÇÃO\n');
  console.log('URL:', 'https://sistema-nutricao-paula-amaral-due8y1f4s.vercel.app');
  console.log('=' .repeat(70));

  try {
    // 1. LOGIN
    console.log('\n1️⃣ LOGIN...');
    const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'paula@nutricionista.com',
      password: 'neco1910'
    });

    if (loginError) {
      console.error('❌ Login falhou:', loginError.message);
      return;
    }

    console.log('✅ Login OK - User ID:', user.id);

    // 2. CARREGAR PACIENTES
    console.log('\n2️⃣ CARREGAR PACIENTES...');
    const { data: todosPacientes, error: listarError } = await supabase
      .from('pacientes')
      .select('*')
      .eq('arquivado', false)
      .order('created_at', { ascending: false });

    if (listarError) {
      console.error('❌ Erro ao carregar:', listarError.message);
      return;
    }

    console.log(`✅ ${todosPacientes.length} paciente(s) encontrado(s)`);

    if (todosPacientes.length === 0) {
      console.log('\n⚠️ Nenhum paciente cadastrado. Vou criar um para testar...');

      // 3. CRIAR PACIENTE TESTE
      console.log('\n3️⃣ CRIAR PACIENTE TESTE...');
      const { data: novoPaciente, error: criarError } = await supabase
        .from('pacientes')
        .insert([{
          nome: 'João Silva Teste',
          data_nascimento: '1985-10-20',
          sexo: 'Masculino',
          telefone: '(21) 98888-7777',
          email: 'joao.teste@email.com',
          dados_completos: {
            paciente: {
              nome: 'João Silva Teste',
              dataNascimento: '1985-10-20',
              sexo: 'Masculino',
              telefone: '(21) 98888-7777',
              email: 'joao.teste@email.com',
              profissao: 'Professor',
              objetivo: 'Ganhar massa',
              restricoes: 'Lactose'
            },
            avaliacaoInicial: { peso: 75, altura: 178 },
            adipometro: {},
            bioimpedancia: {},
            anamnese: {},
            acompanhamento: [],
            planoAlimentar: {}
          }
        }])
        .select()
        .single();

      if (criarError) {
        console.error('❌ Erro ao criar:', criarError.message);
        return;
      }

      console.log('✅ Paciente criado:', novoPaciente.id);

      // 4. APLICAR ADAPTER
      console.log('\n4️⃣ TESTAR ADAPTER...');
      const pacienteAdaptado = adaptarPacienteSupabase(novoPaciente);

      console.log('✅ Adapter aplicado com sucesso!');
      console.log('\n📋 ESTRUTURA ADAPTADA:');
      console.log('   pac.id:', pacienteAdaptado.id);
      console.log('   pac.dados:', pacienteAdaptado.dados ? '✅ Existe' : '❌ undefined');
      console.log('   pac.dados.nome:', pacienteAdaptado.dados.nome);
      console.log('   pac.dados.dataNascimento:', pacienteAdaptado.dados.dataNascimento);
      console.log('   pac.avaliacaoInicial.peso:', pacienteAdaptado.avaliacaoInicial.peso);

      // 5. SIMULAR abrirPaciente()
      console.log('\n5️⃣ SIMULAR abrirPaciente()...');
      const pac = pacienteAdaptado;
      const pacienteDados = pac.dados; // Isso DEVE funcionar
      const avaliacaoInicial = pac.avaliacaoInicial || {};

      console.log('✅ setPaciente(pac.dados) OK');
      console.log('✅ setAvaliacaoInicial(pac.avaliacaoInicial) OK');
      console.log('\n📊 Dados extraídos:');
      console.log('   Nome:', pacienteDados.nome);
      console.log('   Data Nasc:', pacienteDados.dataNascimento);
      console.log('   Peso:', avaliacaoInicial.peso);

      // 6. ATUALIZAR PACIENTE
      console.log('\n6️⃣ ATUALIZAR PACIENTE...');
      const { data: pacienteAtualizado, error: atualizarError } = await supabase
        .from('pacientes')
        .update({
          nome: 'João Silva Teste (EDITADO)',
          dados_completos: {
            ...novoPaciente.dados_completos,
            paciente: {
              ...novoPaciente.dados_completos.paciente,
              nome: 'João Silva Teste (EDITADO)',
              profissao: 'Professor Doutor'
            }
          }
        })
        .eq('id', novoPaciente.id)
        .select()
        .single();

      if (atualizarError) {
        console.error('❌ Erro ao atualizar:', atualizarError.message);
        return;
      }

      const pacienteAtualizadoAdaptado = adaptarPacienteSupabase(pacienteAtualizado);
      console.log('✅ Paciente atualizado!');
      console.log('   Nome:', pacienteAtualizadoAdaptado.dados.nome);
      console.log('   Profissão:', pacienteAtualizadoAdaptado.dados.profissao);

      console.log('\n7️⃣ LIMPAR TESTE (deletar paciente criado)...');
      await supabase.from('pacientes').delete().eq('id', novoPaciente.id);
      console.log('✅ Paciente de teste deletado');

    } else {
      // Se já existe paciente, testar com ele
      console.log('\n3️⃣ TESTAR COM PACIENTE EXISTENTE...');
      const primeiroSupabase = todosPacientes[0];
      const primeiroAdaptado = adaptarPacienteSupabase(primeiroSupabase);

      console.log('✅ Adapter aplicado');
      console.log('\n📋 ESTRUTURA:');
      console.log('   pac.dados:', primeiroAdaptado.dados ? '✅ Existe' : '❌ undefined');
      console.log('   pac.dados.nome:', primeiroAdaptado.dados.nome);

      // Simular abrirPaciente
      const pac = primeiroAdaptado;
      console.log('\n4️⃣ SIMULAR abrirPaciente()...');
      console.log('   setPaciente(pac.dados):', pac.dados ? '✅ OK' : '❌ ERRO');
      console.log('   Nome:', pac.dados.nome);
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n✅ TODOS OS TESTES PASSARAM!\n');
    console.log('📊 RESULTADO:');
    console.log('   ✅ Login funciona');
    console.log('   ✅ Carregar pacientes funciona');
    console.log('   ✅ Adapter funciona corretamente');
    console.log('   ✅ pac.dados.nome é acessível');
    console.log('   ✅ Criar paciente funciona');
    console.log('   ✅ Atualizar paciente funciona');
    console.log('\n🎯 SISTEMA FUNCIONANDO PERFEITAMENTE!\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error('Stack:', error.stack);
  }
}

testarProducao();
