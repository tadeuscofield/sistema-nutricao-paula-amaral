import { useState, useEffect } from 'react';
import {
  Download, Plus, Trash2, User, Activity, FileText, Calendar,
  Search, Save, Upload, Users, Camera, Ruler, ArrowLeft,
  CheckCircle, FolderOpen, Archive, LogOut, HelpCircle, X,
  TrendingUp, AlertTriangle, BarChart3
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Supabase imports
import { login as loginSupabase, logout as logoutSupabase, getSession } from './services/auth';
import {
  listarPacientes as listarPacientesSupabase,
  criarPaciente as criarPacienteSupabase,
  atualizarPaciente as atualizarPacienteSupabase,
  arquivarPaciente as arquivarPacienteSupabase,
  deletarPaciente as deletarPacienteSupabase
} from './services/pacientes';

const VERSAO_SISTEMA = '3.0';
const USAR_SUPABASE = true; // ✅ REATIVADO - Adapter centralizado implementado
const PASSWORD_HASH = 'neco1910'; // Senha padrão Paula

// 🔄 ADAPTER: Converte estrutura Supabase → App
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
    avaliacaoInicial: pacienteSupabase.dados_completos?.avaliacaoInicial || {
      data: new Date().toISOString().split('T')[0],
      peso: '',
      altura: '',
      circCintura: '',
      circQuadril: '',
      circBraco: '',
      circCoxa: '',
      circPanturrilha: '',
      percentualGordura: '',
      massaMagra: '',
      massaGorda: '',
      fotos: { frontal: '', costas: '', lateral: '' }
    },
    adipometro: pacienteSupabase.dados_completos?.adipometro || {
      data: new Date().toISOString().split('T')[0],
      dobras: {
        tricepsE: '', tricepsD: '',
        bicepsE: '', bicepsD: '',
        coxaE: '', coxaD: '',
        panturrilhaE: '', panturrilhaD: '',
        subescapular: '', suprailiaca: '', abdominal: ''
      },
      somaDobras: 0,
      percentualGordura: '',
      massaGorda: '',
      massaMagra: '',
      observacoes: ''
    },
    bioimpedancia: pacienteSupabase.dados_completos?.bioimpedancia || {
      data: new Date().toISOString().split('T')[0],
      peso: '',
      altura: '',
      percentualGordura: '',
      massaMagra: '',
      massaGorda: '',
      aguaCorporal: '',
      metabolismoBasal: '',
      idadeMetabolica: '',
      gorduraVisceral: '',
      massaOssea: '',
      massamuscular: '',
      observacoes: ''
    },
    anamnese: pacienteSupabase.dados_completos?.anamnese || {},
    acompanhamento: pacienteSupabase.dados_completos?.acompanhamento || [],
    planoAlimentar: pacienteSupabase.dados_completos?.planoAlimentar || {},
    arquivado: pacienteSupabase.arquivado || false
  };
};

const App = () => {
  // Estados de autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailInput, setEmailInput] = useState('paula@nutricionista.com'); // Email padrão para Supabase
  const [nutricionista, setNutricionista] = useState(null);

  // Estados principais
  const [view, setView] = useState('lista');
  const [pacientes, setPacientes] = useState([]);
  const [pacientesArquivados, setPacientesArquivados] = useState([]);
  const [pacienteAtual, setPacienteAtual] = useState(null);
  const [activeTab, setActiveTab] = useState('cadastro');
  const [busca, setBusca] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showSearchAssistant, setShowSearchAssistant] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchivedView, setShowArchivedView] = useState(false);

  // Verificar autenticação ao carregar
  useEffect(() => {
    if (USAR_SUPABASE) {
      // Verificar sessão do Supabase
      checkSupabaseSession();
    } else {
      // Fallback para localStorage
      const authData = localStorage.getItem('nutricao-auth');
      if (authData) {
        const { timestamp } = JSON.parse(authData);
        const now = Date.now();
        if (now - timestamp < 8 * 60 * 60 * 1000) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('nutricao-auth');
        }
      }
    }
  }, []);

  const checkSupabaseSession = async () => {
    try {
      const session = await getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        // Buscar dados do nutricionista poderia ser feito aqui
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
    }
  };

  // Login
  const handleLogin = async () => {
    if (USAR_SUPABASE) {
      // Login com Supabase
      try {
        const { user, nutricionista } = await loginSupabase(emailInput, passwordInput);
        setIsAuthenticated(true);
        setNutricionista(nutricionista);
        setPasswordInput('');
        mostrarNotificacao(`✅ Bem-vinda, ${nutricionista.nome}!`);
      } catch (error) {
        mostrarNotificacao('❌ Email ou senha incorretos!');
        console.error('Erro no login:', error);
        setPasswordInput('');
      }
    } else {
      // Fallback localStorage
      if (passwordInput.toUpperCase() === PASSWORD_HASH) {
        setIsAuthenticated(true);
        localStorage.setItem('nutricao-auth', JSON.stringify({ timestamp: Date.now() }));
        setPasswordInput('');
        mostrarNotificacao('✅ Bem-vinda, Paula!');
      } else {
        mostrarNotificacao('❌ Senha incorreta!');
        setPasswordInput('');
      }
    }
  };

  // Logout
  const handleLogout = async () => {
    if (window.confirm('Deseja realmente sair do sistema?')) {
      if (USAR_SUPABASE) {
        try {
          await logoutSupabase();
        } catch (error) {
          console.error('Erro no logout:', error);
        }
      } else {
        localStorage.removeItem('nutricao-auth');
      }

      setIsAuthenticated(false);
      setNutricionista(null);
      setView('lista');
      setPacienteAtual(null);
      mostrarNotificacao('✅ Logout realizado com sucesso!');
    }
  };

  // Estados do paciente (mantém a estrutura anterior)
  const [paciente, setPaciente] = useState({
    id: '',
    nome: '',
    dataNascimento: '',
    sexo: 'Feminino',
    telefone: '',
    email: '',
    profissao: '',
    objetivo: '',
    restricoes: '',
    dataCadastro: new Date().toISOString(),
    ultimaConsulta: new Date().toISOString(),
    status: 'ativo'
  });

  const [avaliacaoInicial, setAvaliacaoInicial] = useState({
    data: new Date().toISOString().split('T')[0],
    peso: '',
    altura: '',
    circCintura: '',
    circQuadril: '',
    circBraco: '',
    circCoxa: '',
    circPanturrilha: '',
    percentualGordura: '',
    massaMagra: '',
    massaGorda: '',
    fotos: { frontal: '', costas: '', lateral: '' }
  });

  const [adipometro, setAdipometro] = useState({
    data: new Date().toISOString().split('T')[0],
    dobras: {
      // Dobras bilaterais (medidas em ambos os lados)
      tricepsE: '', tricepsD: '',
      bicepsE: '', bicepsD: '',
      coxaE: '', coxaD: '',
      panturrilhaE: '', panturrilhaD: '',
      // Dobras centrais (medidas uma vez)
      subescapular: '', suprailiaca: '', abdominal: ''
    },
    somaDobras: 0,
    percentualGordura: '',
    massaGorda: '',
    massaMagra: '',
    observacoes: ''
  });

  const [bioimpedancia, setBioimpedancia] = useState({
    data: new Date().toISOString().split('T')[0],
    peso: '', altura: '', imc: '', tmb: '',
    percentualGordura: '', massaGordura: '', massaMagra: '',
    massaMuscular: '', aguaTotal: '', aguaIntracelular: '',
    aguaExtracelular: '', proteinas: '', minerais: '',
    gorduraVisceral: '', anguloFase: '', impedancia: '',
    observacoes: ''
  });

  const [anamnese, setAnamnese] = useState({
    cafeManhaHorario: '', cafeManhaAlimentos: '', lancheManha: '',
    almocoHorario: '', almocoAlimentos: '', lancheTarde: '',
    jantarHorario: '', jantarAlimentos: '', ceia: '',
    ingestaoAgua: '', atividadeFisica: '', frequenciaAtividade: '',
    medicamentos: '', patologias: '', historicoPeso: '',
    historicoFamiliar: '', intestino: '', sono: '', nivelEstresse: ''
  });

  const [acompanhamento, setAcompanhamento] = useState([]);

  const [planoAlimentar, setPlanoAlimentar] = useState({
    objetivoClinico: '',
    prescricao: { vet: '', cho: '', ptn: '', lip: '' },
    observacoes: '',
    orientacoes: '',
    refeicoes: {
      cafeManha: '',
      lancheManha: '',
      almoco: '',
      lancheTarde: '',
      jantar: '',
      ceia: ''
    }
  });

  // Carregar pacientes
  useEffect(() => {
    if (!isAuthenticated) return;

    if (USAR_SUPABASE) {
      carregarPacientesSupabase();
    } else {
      // Fallback localStorage
      const stored = localStorage.getItem('nutricao-pacientes');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setPacientes(data.pacientes || []);
        } catch (error) {
          console.error('Erro ao carregar pacientes:', error);
        }
      }

      const storedArchived = localStorage.getItem('nutricao-pacientes-arquivados');
      if (storedArchived) {
        try {
          const data = JSON.parse(storedArchived);
          setPacientesArquivados(data.pacientes || []);
        } catch (error) {
          console.error('Erro ao carregar arquivados:', error);
        }
      }
    }
  }, [isAuthenticated]);

  const carregarPacientesSupabase = async () => {
    try {
      const todosPacientes = await listarPacientesSupabase(true);

      // Adaptar estrutura usando função centralizada
      const pacientesAdaptados = todosPacientes.map(adaptarPacienteSupabase);

      const ativos = pacientesAdaptados.filter(p => !p.arquivado);
      const arquivados = pacientesAdaptados.filter(p => p.arquivado);

      setPacientes(ativos);
      setPacientesArquivados(arquivados);
    } catch (error) {
      console.error('Erro ao carregar pacientes do Supabase:', error);
      mostrarNotificacao('❌ Erro ao carregar pacientes');
    }
  };

  // Salvar pacientes
  const salvarPacientes = async (listaPacientes) => {
    if (USAR_SUPABASE) {
      // Não precisa fazer nada - Supabase já salvou via criarPaciente/atualizarPaciente
      setPacientes(listaPacientes);
    } else {
      // Fallback localStorage
      const data = {
        versao: VERSAO_SISTEMA,
        dataAtualizacao: new Date().toISOString(),
        pacientes: listaPacientes
      };
      localStorage.setItem('nutricao-pacientes', JSON.stringify(data));
      setPacientes(listaPacientes);
    }
  };

  // Salvar arquivados
  const salvarArquivados = async (listaArquivados) => {
    if (USAR_SUPABASE) {
      // Não precisa fazer nada - Supabase já salvou via arquivarPaciente
      setPacientesArquivados(listaArquivados);
    } else {
      // Fallback localStorage
      const data = {
        versao: VERSAO_SISTEMA,
        dataAtualizacao: new Date().toISOString(),
        pacientes: listaArquivados
      };
      localStorage.setItem('nutricao-pacientes-arquivados', JSON.stringify(data));
      setPacientesArquivados(listaArquivados);
    }
  };

  // Funções de utilidade
  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return 0;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  // Mensagens motivacionais para o plano alimentar
  const getMensagemMotivacional = () => {
    const mensagens = [
      "Cada escolha alimentar é um passo em direção ao seu objetivo. Você é mais forte do que imagina!",
      "A transformação acontece um dia de cada vez. Confie no processo e acredite em você!",
      "Seu corpo é o reflexo do seu cuidado. Continue firme, os resultados virão!",
      "Não é sobre perfeição, é sobre progresso. Cada pequena vitória conta!",
      "Você merece se sentir bem consigo mesmo. Este plano é o caminho para sua melhor versão!",
      "Lembre-se: disciplina é escolher entre o que você quer agora e o que você mais quer!",
      "Seu compromisso com sua saúde é um ato de amor próprio. Continue assim!",
      "Grandes mudanças começam com pequenas ações consistentes. Você está no caminho certo!",
      "Acredite no seu potencial! Cada refeição equilibrada é um investimento no seu bem-estar!",
      "A jornada pode ser desafiadora, mas você não está sozinho(a). Estamos juntos nessa!",
      "Seu esforço de hoje é a saúde de amanhã. Continue focado(a) no seu objetivo!",
      "Alimentar-se bem é um ato de autocuidado. Você merece toda essa dedicação!"
    ];
    return mensagens[Math.floor(Math.random() * mensagens.length)];
  };

  const calcularIMC = () => {
    const peso = parseFloat(avaliacaoInicial.peso);
    const altura = parseFloat(avaliacaoInicial.altura) / 100;
    if (peso && altura) {
      return (peso / (altura * altura)).toFixed(2);
    }
    return '-';
  };

  const classificarIMC = (imc) => {
    if (imc < 18.5) return 'Baixo peso';
    if (imc < 25) return 'Peso normal';
    if (imc < 30) return 'Sobrepeso';
    if (imc < 35) return 'Obesidade grau I';
    if (imc < 40) return 'Obesidade grau II';
    return 'Obesidade grau III';
  };

  const getCorIMC = (imc) => {
    if (imc < 18.5) return 'red';
    if (imc < 25) return 'green';
    if (imc < 30) return 'yellow';
    return 'red';
  };

  const calcularRCQ = () => {
    const cintura = parseFloat(avaliacaoInicial.circCintura);
    const quadril = parseFloat(avaliacaoInicial.circQuadril);
    if (cintura && quadril) {
      return (cintura / quadril).toFixed(2);
    }
    return '-';
  };

  const getCorRCQ = (rcq, sexo) => {
    const limite = sexo === 'Masculino' ? 0.90 : 0.85;
    return rcq <= limite ? 'green' : 'red';
  };

  const calcularAdipometro = () => {
    const dobras = adipometro.dobras;

    // Calcular médias das dobras bilaterais
    const triceps = ((parseFloat(dobras.tricepsE) || 0) + (parseFloat(dobras.tricepsD) || 0)) / 2;
    const biceps = ((parseFloat(dobras.bicepsE) || 0) + (parseFloat(dobras.bicepsD) || 0)) / 2;
    const coxa = ((parseFloat(dobras.coxaE) || 0) + (parseFloat(dobras.coxaD) || 0)) / 2;
    const panturrilha = ((parseFloat(dobras.panturrilhaE) || 0) + (parseFloat(dobras.panturrilhaD) || 0)) / 2;

    // Dobras centrais (medidas uma vez)
    const subescapular = parseFloat(dobras.subescapular) || 0;
    const suprailiaca = parseFloat(dobras.suprailiaca) || 0;
    const abdominal = parseFloat(dobras.abdominal) || 0;

    // Soma das 7 dobras (protocolo Jackson & Pollock)
    const soma = triceps + biceps + subescapular + suprailiaca + abdominal + coxa + panturrilha;

    let percentual = 0;
    const idade = calcularIdade(paciente.dataNascimento);

    if (paciente.sexo === 'Masculino') {
      const densidade = 1.112 - 0.00043499 * soma + 0.00000055 * Math.pow(soma, 2) - 0.00028826 * idade;
      percentual = ((4.95 / densidade) - 4.5) * 100;
    } else {
      const densidade = 1.097 - 0.00046971 * soma + 0.00000056 * Math.pow(soma, 2) - 0.00012828 * idade;
      percentual = ((4.95 / densidade) - 4.5) * 100;
    }

    const peso = parseFloat(avaliacaoInicial.peso) || 0;
    const massaGorda = (peso * percentual / 100).toFixed(2);
    const massaMagra = (peso - massaGorda).toFixed(2);

    return {
      soma: soma.toFixed(1),
      percentual: percentual.toFixed(2),
      massaGorda,
      massaMagra
    };
  };

  const getCorGorduraCorporal = (percentual, sexo) => {
    const p = parseFloat(percentual);
    if (sexo === 'Masculino') {
      if (p < 6) return 'red';
      if (p <= 13) return 'green';
      if (p <= 17) return 'yellow';
      if (p <= 24) return 'orange';
      return 'red';
    } else {
      if (p < 14) return 'red';
      if (p <= 20) return 'green';
      if (p <= 24) return 'yellow';
      if (p <= 31) return 'orange';
      return 'red';
    }
  };

  const getClassificacaoGordura = (percentual, sexo) => {
    const p = parseFloat(percentual);
    if (sexo === 'Masculino') {
      if (p < 6) return 'Muito Baixo (Risco)';
      if (p <= 13) return 'Ótimo';
      if (p <= 17) return 'Normal';
      if (p <= 24) return 'Acima do Normal';
      return 'Risco Elevado';
    } else {
      if (p < 14) return 'Muito Baixo (Risco)';
      if (p <= 20) return 'Ótimo';
      if (p <= 24) return 'Normal';
      if (p <= 31) return 'Acima do Normal';
      return 'Risco Elevado';
    }
  };

  // Atualizar cálculos automaticamente
  useEffect(() => {
    if (Object.values(adipometro.dobras).some(v => v !== '')) {
      const calc = calcularAdipometro();
      setAdipometro(prev => ({
        ...prev,
        somaDobras: calc.soma,
        percentualGordura: calc.percentual,
        massaGorda: calc.massaGorda,
        massaMagra: calc.massaMagra
      }));
    }
  }, [adipometro.dobras, paciente.sexo, paciente.dataNascimento, avaliacaoInicial.peso]);

  // Criar novo paciente
  const novoPaciente = () => {
    const id = 'pac_' + Date.now();
    const novoPac = {
      id, nome: '', dataNascimento: '', sexo: 'Feminino',
      telefone: '', email: '', profissao: '', objetivo: '', restricoes: '',
      dataCadastro: new Date().toISOString(),
      ultimaConsulta: new Date().toISOString(),
      status: 'ativo'
    };
    setPaciente(novoPac);
    setPacienteAtual(id);
    setView('paciente');
    setActiveTab('cadastro');
    limparFormularios();
  };

  // Criar paciente de exemplo completo para demonstração
  const carregarPacienteExemplo = () => {
    const id = 'pac_exemplo_' + Date.now();
    setPacienteAtual(id);

    // Dados do paciente
    setPaciente({
      id,
      nome: 'Carlos Alberto Silva',
      dataNascimento: '1969-03-15', // 55 anos
      sexo: 'Masculino',
      email: 'carlos.silva@email.com',
      telefone: '(11) 98765-4321',
      endereco: 'Rua das Palmeiras, 234 - São Paulo, SP',
      cpf: '123.456.789-00',
      profissao: 'Engenheiro Civil',
      objetivo: 'Perder peso e melhorar condicionamento físico para prática de corrida. Deseja participar de uma meia maratona em 6 meses e reduzir o percentual de gordura corporal.',
      restricoes: 'Intolerância à lactose. Evita alimentos processados e prefere refeições naturais. Não consome bebidas alcoólicas.',
      dataCadastro: new Date().toISOString(),
      ultimaConsulta: new Date().toISOString(),
      status: 'ativo'
    });

    // Avaliação Inicial
    setAvaliacaoInicial({
      data: new Date().toISOString().split('T')[0],
      peso: '80',
      altura: '175',
      circunferencias: {
        cintura: '92',
        quadril: '98',
        braco: '32',
        coxa: '56',
        panturrilha: '38'
      },
      percentualGordura: '22.5',
      massaMagra: '62',
      massaGorda: '18',
      fotos: { frontal: '', costas: '', lateral: '' }
    });

    // Adipômetro
    setAdipometro({
      data: new Date().toISOString().split('T')[0],
      dobras: {
        tricepsE: '14.2', tricepsD: '14.8',
        bicepsE: '11.5', bicepsD: '11.2',
        coxaE: '24.5', coxaD: '25.0',
        panturrilhaE: '16.8', panturrilhaD: '17.2',
        subescapular: '20.5',
        suprailiaca: '22.0',
        abdominal: '28.5'
      },
      somaDobras: '0',
      percentualGordura: '',
      massaGorda: '',
      massaMagra: '',
      observacoes: 'Paciente apresenta boa mobilidade articular e cooperação durante as medições. Dobras abdominais e supra-ilíacas indicam concentração de gordura na região central, típico do sexo masculino. Recomenda-se acompanhamento mensal para avaliar resposta ao plano alimentar e atividade física proposta.'
    });

    // Bioimpedância
    setBioimpedancia({
      data: new Date().toISOString().split('T')[0],
      peso: '80', altura: '175', imc: '26.1', tmb: '1750',
      percentualGordura: '22.5', massaGorda: '18', massaMagra: '62',
      massaMuscular: '58.5', aguaTotal: '42', aguaIntracelular: '28',
      aguaExtracelular: '14', proteinas: '11.5', minerais: '3.8',
      gorduraVisceral: '8', anguloDeFase: '6.2', impedancia: '520',
      observacoes: 'Ângulo de fase dentro da normalidade. Hidratação adequada. Gordura visceral levemente elevada, indicando necessidade de intervenção nutricional e aumento de atividade física aeróbica.'
    });

    // Anamnese
    setAnamnese({
      recordatorio24h: {
        cafeManha: 'Pão francês com margarina, café com leite integral, suco de laranja',
        lancheManha: 'Biscoito recheado e café',
        almoco: 'Arroz branco, feijão, bife de carne bovina, batata frita, salada de alface e tomate, refrigerante',
        lancheTarde: 'Sanduíche de queijo prato com presunto, suco industrializado',
        jantar: 'Pizza de calabresa (4 fatias), refrigerante',
        ceia: 'Iogurte integral com granola'
      },
      habitosVida: {
        agua: '1.5',
        atividadeFisica: 'Caminhada 3x por semana',
        frequenciaExercicios: '3 dias/semana',
        sono: '6-7 horas',
        intestino: 'Regular, 1x ao dia',
        tabagismo: 'Não',
        alcool: 'Não consome'
      },
      historicoClinico: {
        medicamentos: 'Losartana 50mg (pressão alta)',
        suplementos: 'Nenhum',
        patologias: 'Hipertensão arterial controlada',
        cirurgias: 'Apendicectomia em 2005',
        alergias: 'Nenhuma alergia medicamentosa conhecida',
        historicoFamiliar: 'Pai com diabetes tipo 2, mãe com hipertensão. Irmão com sobrepeso.'
      },
      examesLaboratoriais: 'Glicemia: 95 mg/dL, Colesterol total: 215 mg/dL, LDL: 145 mg/dL, HDL: 42 mg/dL, Triglicerídeos: 180 mg/dL, Hemoglobina glicada: 5.6%, Creatinina: 0.9 mg/dL'
    });

    // Plano Alimentar
    setPlanoAlimentar({
      prescricao: { vet: '1850', cho: '220', ptn: '120', lip: '60' },
      refeicoes: {
        cafeManha: 'Opção 1: Tapioca com ovo mexido + café sem açúcar + 1 fruta\nOpção 2: Pão integral com pasta de amendoim + iogurte natural',
        lancheManha: 'Castanhas (10 unidades) + 1 fruta',
        almoco: 'Arroz integral (4 col sopa) + Feijão (1 concha) + Proteína grelhada (120g) + Salada verde à vontade + Legumes cozidos',
        lancheTarde: 'Iogurte natural sem açúcar + aveia (2 col sopa)',
        jantar: 'Omelete com legumes + Salada verde + Batata doce pequena',
        ceia: 'Chá de camomila + 2 castanhas'
      },
      orientacoes: 'Beber 2 litros de água por dia. Evitar frituras e alimentos industrializados. Priorizar alimentos integrais e proteínas magras. Realizar atividade física 5x por semana (3x caminhada, 2x musculação). Mastigar bem os alimentos. Fazer refeições em horários regulares.'
    });

    setView('paciente');
    setActiveTab('cadastro');
    mostrarNotificacao('✅ Paciente de exemplo carregado! (Não salvo automaticamente)');
  };

  const limparFormularios = () => {
    setAvaliacaoInicial({
      data: new Date().toISOString().split('T')[0],
      peso: '', altura: '', circCintura: '', circQuadril: '',
      circBraco: '', circCoxa: '', circPanturrilha: '',
      percentualGordura: '', massaMagra: '', massaGorda: '',
      fotos: { frontal: '', costas: '', lateral: '' }
    });
    setAdipometro({
      data: new Date().toISOString().split('T')[0],
      dobras: {
        tricepsE: '', tricepsD: '', bicepsE: '', bicepsD: '',
        coxaE: '', coxaD: '', panturrilhaE: '', panturrilhaD: '',
        subescapular: '', suprailiaca: '', abdominal: ''
      },
      somaDobras: 0, percentualGordura: '', massaGorda: '', massaMagra: '', observacoes: ''
    });
    setBioimpedancia({
      data: new Date().toISOString().split('T')[0],
      peso: '', altura: '', imc: '', tmb: '', percentualGordura: '',
      massaGordura: '', massaMagra: '', massaMuscular: '', aguaTotal: '',
      aguaIntracelular: '', aguaExtracelular: '', proteinas: '', minerais: '',
      gorduraVisceral: '', anguloFase: '', impedancia: '', observacoes: ''
    });
    setAnamnese({
      cafeManhaHorario: '', cafeManhaAlimentos: '', lancheManha: '',
      almocoHorario: '', almocoAlimentos: '', lancheTarde: '',
      jantarHorario: '', jantarAlimentos: '', ceia: '', ingestaoAgua: '',
      atividadeFisica: '', frequenciaAtividade: '', medicamentos: '',
      patologias: '', historicoPeso: '', historicoFamiliar: '',
      intestino: '', sono: '', nivelEstresse: ''
    });
    setAcompanhamento([]);
    setPlanoAlimentar({
      objetivoClinico: '',
      prescricao: { vet: '', cho: '', ptn: '', lip: '' },
      observacoes: '',
      orientacoes: '',
      refeicoes: {
        cafeManha: '',
        lancheManha: '',
        almoco: '',
        lancheTarde: '',
        jantar: '',
        ceia: ''
      }
    });
  };

  // Abrir paciente
  const abrirPaciente = (id) => {
    const pac = pacientes.find(p => p.id === id);
    if (pac) {
      setPaciente(pac.dados);
      setAvaliacaoInicial(pac.avaliacaoInicial || avaliacaoInicial);
      setAdipometro(pac.adipometro || adipometro);
      setBioimpedancia(pac.bioimpedancia || bioimpedancia);
      setAnamnese(pac.anamnese || anamnese);
      setAcompanhamento(pac.acompanhamento || []);
      setPlanoAlimentar(pac.planoAlimentar || planoAlimentar);
      setPacienteAtual(id);
      setView('paciente');
      setActiveTab('cadastro');
    }
  };

  // Salvar paciente
  const salvarPacienteAtual = async () => {
    if (!paciente.nome) {
      mostrarNotificacao('❌ Nome do paciente é obrigatório!');
      return;
    }

    try {
      if (USAR_SUPABASE) {
        // Preparar dados para Supabase (formato simplificado)
        const dadosSupabase = {
          nome: paciente.nome,
          data_nascimento: paciente.dataNascimento || null,
          sexo: paciente.sexo || null,
          telefone: paciente.telefone || null,
          email: paciente.email || null,
          cpf: null, // Pode adicionar se tiver no formulário
          // Dados completos salvos em JSON (opcional - para manter estrutura antiga)
          dados_completos: {
            paciente,
            avaliacaoInicial,
            adipometro,
            bioimpedancia,
            anamnese,
            acompanhamento,
            planoAlimentar
          }
        };

        // Detectar se é ID antigo do localStorage (formato: pac_xxxxx)
        const isIdAntigo = pacienteAtual && pacienteAtual.startsWith('pac_');

        console.log('📤 Salvando no Supabase:', {
          modo: pacienteAtual && pacienteAtual !== 'novo' && !isIdAntigo ? 'ATUALIZAR' : 'CRIAR',
          pacienteId: pacienteAtual,
          isIdAntigo,
          nome: dadosSupabase.nome
        });

        // Se for ID antigo do localStorage, sempre criar novo registro
        if (pacienteAtual && pacienteAtual !== 'novo' && !isIdAntigo) {
          // Atualizar existente (ID válido do Supabase)
          console.log('🔄 Atualizando paciente ID:', pacienteAtual);
          const atualizado = await atualizarPacienteSupabase(pacienteAtual, dadosSupabase);
          console.log('✅ Paciente atualizado:', atualizado);

          // Adaptar estrutura usando função centralizada
          const pacienteAdaptado = adaptarPacienteSupabase(atualizado);

          setPacientes(pacientes.map(p => p.id === pacienteAdaptado.id ? pacienteAdaptado : p));
        } else {
          // Criar novo (novo paciente OU paciente com ID antigo do localStorage)
          if (isIdAntigo) {
            console.log('⚠️ ID antigo detectado - criando novo registro no Supabase');
          } else {
            console.log('➕ Criando novo paciente');
          }

          const novo = await criarPacienteSupabase(dadosSupabase);
          console.log('✅ Paciente criado:', novo);

          // Adaptar estrutura usando função centralizada
          const pacienteAdaptado = adaptarPacienteSupabase(novo);

          if (isIdAntigo) {
            // Substituir paciente antigo pelo novo na lista
            setPacientes(pacientes.map(p => p.id === pacienteAtual ? pacienteAdaptado : p));
          } else {
            // Adicionar novo paciente à lista
            setPacientes([...pacientes, pacienteAdaptado]);
          }

          setPacienteAtual(novo.id); // Atualizar para o ID do Supabase
        }
      } else {
        // Modo localStorage
        const dadosPaciente = {
          id: pacienteAtual,
          dados: { ...paciente, ultimaConsulta: new Date().toISOString() },
          avaliacaoInicial, adipometro, bioimpedancia, anamnese, acompanhamento, planoAlimentar
        };

        const lista = pacientes.filter(p => p.id !== pacienteAtual);
        lista.push(dadosPaciente);
        await salvarPacientes(lista);
      }

      mostrarNotificacao('✅ Paciente salvo com sucesso!');
    } catch (error) {
      console.error('❌ ERRO COMPLETO ao salvar:', error);
      console.error('Mensagem:', error.message);
      console.error('Details:', error.details);
      console.error('Hint:', error.hint);
      mostrarNotificacao(`❌ Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
    }
  };

  // Arquivar paciente
  const arquivarPaciente = async (id) => {
    const pac = pacientes.find(p => p.id === id);
    if (!pac) return;

    const nomeExibicao = pac.dados?.nome || pac.nome || 'este paciente';

    if (window.confirm(`Dar alta e arquivar ${nomeExibicao}? O paciente será movido para "Arquivados" e um backup será exportado.`)) {
      try {
        // Exportar backup individual
        const backup = {
          versaoSistema: VERSAO_SISTEMA,
          dataArquivamento: new Date().toISOString(),
          paciente: { ...pac, dados: { ...pac.dados, status: 'arquivado' } }
        };

        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ARQUIVADO_${nomeExibicao.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);

        if (USAR_SUPABASE) {
          // Arquivar no Supabase
          await arquivarPacienteSupabase(id, true);

          // Atualizar estados locais
          const pacArquivado = { ...pac, arquivado: true };
          setPacientesArquivados([...pacientesArquivados, pacArquivado]);
          setPacientes(pacientes.filter(p => p.id !== id));
        } else {
          // Mover para arquivados (localStorage)
          const pacArquivado = { ...pac, dados: { ...pac.dados, status: 'arquivado', dataArquivamento: new Date().toISOString() } };
          await salvarArquivados([...pacientesArquivados, pacArquivado]);

          // Remover dos ativos
          const lista = pacientes.filter(p => p.id !== id);
          await salvarPacientes(lista);
        }

        mostrarNotificacao('✅ Paciente arquivado e backup exportado!');
      } catch (error) {
        console.error('Erro ao arquivar paciente:', error);
        mostrarNotificacao('❌ Erro ao arquivar paciente');
      }
    }
  };

  // Deletar paciente
  const deletarPaciente = async (id) => {
    const pac = pacientes.find(p => p.id === id);
    const nomeExibicao = pac?.dados?.nome || pac?.nome || 'este paciente';

    if (window.confirm(`Deletar paciente ${nomeExibicao}? Esta ação não pode ser desfeita.`)) {
      try {
        if (USAR_SUPABASE) {
          await deletarPacienteSupabase(id);
          setPacientes(pacientes.filter(p => p.id !== id));
        } else {
          const lista = pacientes.filter(p => p.id !== id);
          await salvarPacientes(lista);
        }

        mostrarNotificacao('✅ Paciente deletado com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar paciente:', error);
        mostrarNotificacao('❌ Erro ao deletar paciente');
      }
    }
  };

  const voltarParaLista = () => {
    setView('lista');
    setPacienteAtual(null);
    setBusca('');
  };

  const mostrarNotificacao = (mensagem) => {
    setNotificationMessage(mensagem);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Exportar backup
  const exportarBackupCompleto = () => {
    const backup = {
      versaoSistema: VERSAO_SISTEMA,
      dataBackup: new Date().toISOString(),
      totalPacientes: pacientes.length,
      pacientes: pacientes
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-pacientes-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    mostrarNotificacao('✅ Backup exportado com sucesso!');
  };

  // Importar backup
  const importarBackup = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target.result);
        if (backup.versaoSistema && backup.pacientes) {
          if (window.confirm(`Importar ${backup.totalPacientes} pacientes? Isso substituirá todos os dados atuais.`)) {
            salvarPacientes(backup.pacientes);
            mostrarNotificacao(`✅ ${backup.totalPacientes} pacientes importados!`);
          }
        } else if (backup.paciente) {
          // Restaurar paciente arquivado
          if (window.confirm(`Restaurar paciente ${backup.paciente.dados.nome}?`)) {
            const pac = { ...backup.paciente, dados: { ...backup.paciente.dados, status: 'ativo' } };
            salvarPacientes([...pacientes, pac]);
            mostrarNotificacao('✅ Paciente restaurado com sucesso!');
          }
        } else {
          mostrarNotificacao('❌ Arquivo de backup inválido!');
        }
      } catch (error) {
        mostrarNotificacao('❌ Erro ao importar backup!');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Filtrar pacientes
  const pacientesFiltrados = pacientes.filter(p =>
    p.dados.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.dados.email.toLowerCase().includes(busca.toLowerCase()) ||
    p.dados.telefone.includes(busca)
  );

  // Upload de foto
  const handleFotoUpload = (tipo, event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      mostrarNotificacao('❌ Foto muito grande! Máximo 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvaliacaoInicial(prev => ({
        ...prev,
        fotos: { ...prev.fotos, [tipo]: reader.result }
      }));
      mostrarNotificacao('✅ Foto adicionada!');
    };
    reader.readAsDataURL(file);
  };

  // Acompanhamento
  const adicionarConsulta = () => {
    const novaConsulta = {
      data: new Date().toISOString().split('T')[0],
      peso: '', imc: '', circCintura: '', circQuadril: '',
      percentualGordura: '', observacoes: ''
    };
    setAcompanhamento([...acompanhamento, novaConsulta]);
  };

  const removerConsulta = (index) => {
    setAcompanhamento(acompanhamento.filter((_, i) => i !== index));
  };

  const atualizarConsulta = (index, campo, valor) => {
    const novoAcompanhamento = [...acompanhamento];
    novoAcompanhamento[index][campo] = valor;

    if (campo === 'peso') {
      const peso = parseFloat(valor);
      const altura = parseFloat(avaliacaoInicial.altura) / 100;
      if (peso && altura) {
        novoAcompanhamento[index].imc = (peso / (altura * altura)).toFixed(2);
      }
    }

    setAcompanhamento(novoAcompanhamento);
  };

  // Preparar dados para gráfico
  const prepararDadosGrafico = () => {
    const dados = [];

    // Avaliação inicial
    if (avaliacaoInicial.peso) {
      dados.push({
        data: avaliacaoInicial.data,
        peso: parseFloat(avaliacaoInicial.peso),
        imc: parseFloat(calcularIMC()),
        gordura: parseFloat(avaliacaoInicial.percentualGordura) || parseFloat(adipometro.percentualGordura) || 0
      });
    }

    // Acompanhamentos
    acompanhamento.forEach(consulta => {
      if (consulta.peso) {
        dados.push({
          data: consulta.data,
          peso: parseFloat(consulta.peso),
          imc: parseFloat(consulta.imc) || 0,
          gordura: parseFloat(consulta.percentualGordura) || 0
        });
      }
    });

    return dados.sort((a, b) => new Date(a.data) - new Date(b.data));
  };

  // Assistente de pesquisa
  const handleSearchAssistant = (tipo) => {
    if (!searchQuery.trim()) return;

    const urls = {
      google: `https://www.google.com/search?q=${encodeURIComponent(searchQuery + ' nutrição')}`,
      pubmed: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(searchQuery)}`,
      chatgpt: `https://chat.openai.com/?q=${encodeURIComponent(searchQuery)}`
    };

    window.open(urls[tipo], '_blank');
    setShowSearchAssistant(false);
    setSearchQuery('');
  };

  // Exportar para Excel (mantém função anterior + melhorias)
  const exportarParaExcel = () => {
    const wb = XLSX.utils.book_new();

    // ABA 1: DADOS DO PACIENTE
    const dadosPaciente = [
      ['SISTEMA PROFISSIONAL DE NUTRIÇÃO'],
      ['Nutricionista Paula do Amaral Santos - CRN: 08100732'],
      [''],
      ['DADOS DO PACIENTE'],
      ['Nome', paciente.nome || ''],
      ['Data de Nascimento', paciente.dataNascimento || ''],
      ['Idade', calcularIdade(paciente.dataNascimento) + ' anos' || ''],
      ['Sexo', paciente.sexo || ''],
      ['Email', paciente.email || ''],
      ['Telefone', paciente.telefone || ''],
      ['Endereço', paciente.endereco || ''],
      ['CPF', paciente.cpf || ''],
      ['Profissão', paciente.profissao || ''],
      [''],
      ['OBJETIVO'],
      ['', paciente.objetivo || ''],
      [''],
      ['RESTRIÇÕES ALIMENTARES'],
      ['', paciente.restricoes || '']
    ];
    const wsPaciente = XLSX.utils.aoa_to_sheet(dadosPaciente);
    XLSX.utils.book_append_sheet(wb, wsPaciente, 'Dados do Paciente');

    // ABA 2: AVALIAÇÃO INICIAL
    const avaliacaoData = [
      ['AVALIAÇÃO ANTROPOMÉTRICA INICIAL'],
      ['Data da Avaliação', avaliacaoInicial.data || ''],
      [''],
      ['MEDIDAS BÁSICAS'],
      ['Peso (kg)', avaliacaoInicial.peso || ''],
      ['Altura (m)', avaliacaoInicial.altura || ''],
      ['IMC', calcularIMC()],
      ['Classificação IMC', getClassificacaoIMC(parseFloat(calcularIMC()))],
      [''],
      ['CIRCUNFERÊNCIAS (cm)'],
      ['Cintura', avaliacaoInicial.circunferencias.cintura || ''],
      ['Quadril', avaliacaoInicial.circunferencias.quadril || ''],
      ['Braço', avaliacaoInicial.circunferencias.braco || ''],
      ['Coxa', avaliacaoInicial.circunferencias.coxa || ''],
      ['Panturrilha', avaliacaoInicial.circunferencias.panturrilha || ''],
      [''],
      ['RELAÇÃO CINTURA/QUADRIL (RCQ)'],
      ['RCQ', calcularRCQ()],
      ['Risco Cardiovascular', getClassificacaoRCQ(parseFloat(calcularRCQ()), paciente.sexo)]
    ];
    const wsAvaliacao = XLSX.utils.aoa_to_sheet(avaliacaoData);
    XLSX.utils.book_append_sheet(wb, wsAvaliacao, 'Avaliação Inicial');

    // ABA 3: ADIPÔMETRO
    const adipoCalc = calcularAdipometro();
    const adipometroData = [
      ['ADIPÔMETRO DIGITAL - PROTOCOLO JACKSON & POLLOCK (7 DOBRAS)'],
      ['Equipamento: Adipômetro Digital Científico Classic Sanny - KNS2001'],
      [''],
      ['DOBRAS BILATERAIS (mm)', 'Esquerdo (E)', 'Direito (D)', 'Média'],
      ['Tríceps', adipometro.dobras.tricepsE || '', adipometro.dobras.tricepsD || '',
        (((parseFloat(adipometro.dobras.tricepsE) || 0) + (parseFloat(adipometro.dobras.tricepsD) || 0)) / 2).toFixed(2)],
      ['Bíceps', adipometro.dobras.bicepsE || '', adipometro.dobras.bicepsD || '',
        (((parseFloat(adipometro.dobras.bicepsE) || 0) + (parseFloat(adipometro.dobras.bicepsD) || 0)) / 2).toFixed(2)],
      ['Coxa', adipometro.dobras.coxaE || '', adipometro.dobras.coxaD || '',
        (((parseFloat(adipometro.dobras.coxaE) || 0) + (parseFloat(adipometro.dobras.coxaD) || 0)) / 2).toFixed(2)],
      ['Panturrilha', adipometro.dobras.panturrilhaE || '', adipometro.dobras.panturrilhaD || '',
        (((parseFloat(adipometro.dobras.panturrilhaE) || 0) + (parseFloat(adipometro.dobras.panturrilhaD) || 0)) / 2).toFixed(2)],
      [''],
      ['DOBRAS CENTRAIS (mm)'],
      ['Subescapular', adipometro.dobras.subescapular || ''],
      ['Supra-ilíaca', adipometro.dobras.suprailiaca || ''],
      ['Abdominal', adipometro.dobras.abdominal || ''],
      [''],
      ['RESULTADOS CALCULADOS'],
      ['Soma das Dobras (mm)', adipoCalc.soma],
      ['% Gordura Corporal', adipoCalc.percentual + '%'],
      ['Massa Gorda (kg)', adipoCalc.massaGorda],
      ['Massa Magra (kg)', adipoCalc.massaMagra],
      [''],
      ['Classificação', getClassificacaoGorduraCorporal(parseFloat(adipoCalc.percentual), paciente.sexo, calcularIdade(paciente.dataNascimento))]
    ];
    const wsAdipometro = XLSX.utils.aoa_to_sheet(adipometroData);
    XLSX.utils.book_append_sheet(wb, wsAdipometro, 'Adipômetro');

    // ABA 4: BIOIMPEDÂNCIA
    const bioimpedanciaData = [
      ['ANÁLISE DE BIOIMPEDÂNCIA'],
      [''],
      ['COMPOSIÇÃO CORPORAL'],
      ['Peso (kg)', bioimpedancia.peso || ''],
      ['% Gordura Corporal', bioimpedancia.percentualGordura || ''],
      ['Massa Gorda (kg)', bioimpedancia.massaGorda || ''],
      ['Massa Magra (kg)', bioimpedancia.massaMagra || ''],
      ['Massa Muscular (kg)', bioimpedancia.massaMuscular || ''],
      [''],
      ['METABOLISMO'],
      ['TMB (kcal)', bioimpedancia.tmb || ''],
      [''],
      ['PROTEÍNAS E MINERAIS'],
      ['Proteínas (kg)', bioimpedancia.proteinas || ''],
      ['Minerais (kg)', bioimpedancia.minerais || ''],
      [''],
      ['ÁGUA CORPORAL'],
      ['Água Total (L)', bioimpedancia.aguaTotal || ''],
      ['Água Intracelular (L)', bioimpedancia.aguaIntracelular || ''],
      ['Água Extracelular (L)', bioimpedancia.aguaExtracelular || ''],
      [''],
      ['ANÁLISES AVANÇADAS'],
      ['Gordura Visceral', bioimpedancia.gorduraVisceral || ''],
      ['Ângulo de Fase (°)', bioimpedancia.anguloDeFase || ''],
      ['Impedância (Ω)', bioimpedancia.impedancia || ''],
      [''],
      ['OBSERVAÇÕES'],
      ['', bioimpedancia.observacoes || '']
    ];
    const wsBioimpedancia = XLSX.utils.aoa_to_sheet(bioimpedanciaData);
    XLSX.utils.book_append_sheet(wb, wsBioimpedancia, 'Bioimpedância');

    // ABA 5: ANAMNESE
    const anamneseData = [
      ['ANAMNESE ALIMENTAR'],
      [''],
      ['RECORDATÓRIO 24 HORAS'],
      ['Café da Manhã', anamnese.recordatorio24h.cafeManha || ''],
      ['Lanche da Manhã', anamnese.recordatorio24h.lancheManha || ''],
      ['Almoço', anamnese.recordatorio24h.almoco || ''],
      ['Lanche da Tarde', anamnese.recordatorio24h.lancheTarde || ''],
      ['Jantar', anamnese.recordatorio24h.jantar || ''],
      ['Ceia', anamnese.recordatorio24h.ceia || ''],
      [''],
      ['HÁBITOS DE VIDA'],
      ['Consumo de Água (L/dia)', anamnese.habitosVida.agua || ''],
      ['Atividade Física', anamnese.habitosVida.atividadeFisica || ''],
      ['Frequência de Exercícios', anamnese.habitosVida.frequenciaExercicios || ''],
      ['Horas de Sono', anamnese.habitosVida.sono || ''],
      ['Funcionamento Intestinal', anamnese.habitosVida.intestino || ''],
      ['Tabagismo', anamnese.habitosVida.tabagismo || ''],
      ['Consumo de Álcool', anamnese.habitosVida.alcool || ''],
      [''],
      ['HISTÓRICO CLÍNICO'],
      ['Medicamentos em Uso', anamnese.historicoClinico.medicamentos || ''],
      ['Suplementos', anamnese.historicoClinico.suplementos || ''],
      ['Patologias', anamnese.historicoClinico.patologias || ''],
      ['Cirurgias Prévias', anamnese.historicoClinico.cirurgias || ''],
      ['Alergias', anamnese.historicoClinico.alergias || ''],
      ['Histórico Familiar', anamnese.historicoClinico.historicoFamiliar || ''],
      [''],
      ['EXAMES LABORATORIAIS'],
      ['', anamnese.examesLaboratoriais || '']
    ];
    const wsAnamnese = XLSX.utils.aoa_to_sheet(anamneseData);
    XLSX.utils.book_append_sheet(wb, wsAnamnese, 'Anamnese');

    // ABA 6: ACOMPANHAMENTO
    const acompanhamentoData = [
      ['ACOMPANHAMENTO NUTRICIONAL'],
      ['']
    ];

    acompanhamento.forEach((consulta, index) => {
      acompanhamentoData.push(
        [`CONSULTA ${index + 1}`],
        ['Data', consulta.data || ''],
        ['Peso (kg)', consulta.peso || ''],
        ['IMC', consulta.imc || ''],
        ['% Gordura', consulta.percentualGordura || ''],
        ['Circunferência Cintura (cm)', consulta.circunferenciaCintura || ''],
        ['Circunferência Quadril (cm)', consulta.circunferenciaQuadril || ''],
        [''],
        ['Evolução Clínica'],
        ['', consulta.evolucao || ''],
        [''],
        ['Conduta'],
        ['', consulta.conduta || ''],
        ['']
      );
    });
    const wsAcompanhamento = XLSX.utils.aoa_to_sheet(acompanhamentoData);
    XLSX.utils.book_append_sheet(wb, wsAcompanhamento, 'Acompanhamento');

    // ABA 7: PLANO ALIMENTAR
    const planoData = [
      ['PLANO ALIMENTAR'],
      ['Nutricionista Paula do Amaral Santos - CRN: 08100732'],
      ['Paciente: ' + (paciente.nome || '')],
      [''],
      ['PRESCRIÇÃO DIETÉTICA'],
      ['VET (kcal)', planoAlimentar.prescricao.vet || ''],
      ['CHO (g)', planoAlimentar.prescricao.cho || ''],
      ['PTN (g)', planoAlimentar.prescricao.ptn || ''],
      ['LIP (g)', planoAlimentar.prescricao.lip || ''],
      [''],
      ['CAFÉ DA MANHÃ'],
      ['', planoAlimentar.refeicoes.cafeManha || ''],
      [''],
      ['LANCHE DA MANHÃ'],
      ['', planoAlimentar.refeicoes.lancheManha || ''],
      [''],
      ['ALMOÇO'],
      ['', planoAlimentar.refeicoes.almoco || ''],
      [''],
      ['LANCHE DA TARDE'],
      ['', planoAlimentar.refeicoes.lancheTarde || ''],
      [''],
      ['JANTAR'],
      ['', planoAlimentar.refeicoes.jantar || ''],
      [''],
      ['CEIA'],
      ['', planoAlimentar.refeicoes.ceia || ''],
      [''],
      ['ORIENTAÇÕES GERAIS'],
      ['', planoAlimentar.orientacoes || '']
    ];
    const wsPlano = XLSX.utils.aoa_to_sheet(planoData);
    XLSX.utils.book_append_sheet(wb, wsPlano, 'Plano Alimentar');

    XLSX.writeFile(wb, `Ficha_${paciente.nome || 'Paciente'}_${new Date().toISOString().split('T')[0]}.xlsx`);
    mostrarNotificacao('✅ Excel exportado com sucesso!');
  };

  // Exportar PDF (mantém função anterior)
  const exportarPlanoParaPDF = () => {
    try {
      const doc = new jsPDF();

      // CABEÇALHO
      doc.setFillColor(20, 184, 166); // Teal-500
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont(undefined, 'bold');
      doc.text('PLANO ALIMENTAR', 105, 15, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text('Nutricionista Paula do Amaral Santos', 105, 25, { align: 'center' });
      doc.text('CRN: 08100732', 105, 32, { align: 'center' });

      // DADOS DO PACIENTE
      let yPos = 50;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('DADOS DO PACIENTE', 20, yPos);

      yPos += 8;
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.text(`Nome: ${paciente.nome || 'Não informado'}`, 20, yPos);
      yPos += 6;
      doc.text(`Data de Nascimento: ${paciente.dataNascimento || 'Não informada'}`, 20, yPos);
      yPos += 6;
      doc.text(`Idade: ${calcularIdade(paciente.dataNascimento)} anos`, 20, yPos);
      yPos += 6;
      doc.text(`Sexo: ${paciente.sexo || 'Não informado'}`, 20, yPos);

      // PRESCRIÇÃO DIETÉTICA
      yPos += 12;
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setFillColor(240, 253, 250); // Teal-50
      doc.rect(15, yPos - 5, 180, 8, 'F');
      doc.text('PRESCRIÇÃO DIETÉTICA', 20, yPos);

      yPos += 8;
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.text(`VET: ${planoAlimentar.prescricao.vet || '--'} kcal`, 20, yPos);
      doc.text(`CHO: ${planoAlimentar.prescricao.cho || '--'} g`, 75, yPos);
      doc.text(`PTN: ${planoAlimentar.prescricao.ptn || '--'} g`, 120, yPos);
      doc.text(`LIP: ${planoAlimentar.prescricao.lip || '--'} g`, 165, yPos);

      // REFEIÇÕES
      const refeicoes = [
        { titulo: 'CAFÉ DA MANHÃ', conteudo: planoAlimentar.refeicoes.cafeManha },
        { titulo: 'LANCHE DA MANHÃ', conteudo: planoAlimentar.refeicoes.lancheManha },
        { titulo: 'ALMOÇO', conteudo: planoAlimentar.refeicoes.almoco },
        { titulo: 'LANCHE DA TARDE', conteudo: planoAlimentar.refeicoes.lancheTarde },
        { titulo: 'JANTAR', conteudo: planoAlimentar.refeicoes.jantar },
        { titulo: 'CEIA', conteudo: planoAlimentar.refeicoes.ceia }
      ];

      refeicoes.forEach((refeicao, index) => {
        yPos += 10;

        // Verificar se precisa de nova página
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setFillColor(20, 184, 166); // Teal-500
        doc.rect(15, yPos - 5, 180, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(refeicao.titulo, 20, yPos);

        yPos += 7;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');

        const linhas = doc.splitTextToSize(refeicao.conteudo || 'Não especificado', 170);
        linhas.forEach(linha => {
          if (yPos > 280) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(linha, 20, yPos);
          yPos += 5;
        });
      });

      // ORIENTAÇÕES GERAIS
      if (planoAlimentar.orientacoes) {
        yPos += 10;

        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setFillColor(240, 253, 250); // Teal-50
        doc.rect(15, yPos - 5, 180, 8, 'F');
        doc.setTextColor(0, 0, 0);
        doc.text('ORIENTAÇÕES GERAIS', 20, yPos);

        yPos += 8;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');

        const linhasOrientacoes = doc.splitTextToSize(planoAlimentar.orientacoes, 170);
        linhasOrientacoes.forEach(linha => {
          if (yPos > 280) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(linha, 20, yPos);
          yPos += 5;
        });
      }

      // GRÁFICO DE EVOLUÇÃO (como tabela)
      const dadosGrafico = prepararDadosGrafico();
      if (dadosGrafico.length > 0) {
        yPos += 15;
        if (yPos > 230) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setFillColor(240, 253, 250); // Teal-50
        doc.rect(15, yPos - 5, 180, 8, 'F');
        doc.setTextColor(0, 0, 0);
        doc.text('EVOLUÇÃO DO PACIENTE', 20, yPos);

        yPos += 10;

        // Preparar dados da tabela
        const evolucaoData = dadosGrafico.map((d, index) => [
          index === 0 ? 'Inicial' : `Consulta ${index}`,
          new Date(d.data).toLocaleDateString('pt-BR'),
          d.peso.toFixed(1) + ' kg',
          d.imc.toFixed(1),
          d.gordura.toFixed(1) + '%'
        ]);

        // Adicionar variação se houver mais de 1 consulta
        if (dadosGrafico.length >= 2) {
          const primeiro = dadosGrafico[0];
          const ultimo = dadosGrafico[dadosGrafico.length - 1];
          const difPeso = (ultimo.peso - primeiro.peso).toFixed(1);
          const difIMC = (ultimo.imc - primeiro.imc).toFixed(1);
          const difGordura = (ultimo.gordura - primeiro.gordura).toFixed(1);

          evolucaoData.push([
            'VARIAÇÃO',
            '',
            (difPeso > 0 ? '+' : '') + difPeso + ' kg',
            (difIMC > 0 ? '+' : '') + difIMC,
            (difGordura > 0 ? '+' : '') + difGordura + '%'
          ]);
        }

        doc.autoTable({
          startY: yPos,
          head: [['Consulta', 'Data', 'Peso', 'IMC', '% Gordura']],
          body: evolucaoData,
          theme: 'grid',
          headStyles: {
            fillColor: [20, 184, 166],
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 9
          },
          alternateRowStyles: {
            fillColor: [240, 253, 250]
          },
          margin: { left: 15, right: 15 }
        });

        yPos = doc.lastAutoTable.finalY + 10;
      }

      // MENSAGEM MOTIVACIONAL
      yPos += 15;
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFillColor(20, 184, 166); // Teal-500
      doc.rect(15, yPos - 5, 180, 35, 'F');

      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('MENSAGEM DE MOTIVACAO', 105, yPos, { align: 'center' });

      yPos += 8;
      doc.setFontSize(9);
      doc.setFont(undefined, 'italic');
      const mensagem = getMensagemMotivacional();
      const linhasMensagem = doc.splitTextToSize(mensagem, 160);
      linhasMensagem.forEach(linha => {
        doc.text(linha, 105, yPos, { align: 'center' });
        yPos += 5;
      });

      // RODAPÉ
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Gerado em: ${new Date().toLocaleDateString('pt-BR')} - Página ${i} de ${totalPages}`,
          105,
          290,
          { align: 'center' }
        );
      }

      doc.save(`Plano_Alimentar_${paciente.nome || 'Paciente'}_${new Date().toISOString().split('T')[0]}.pdf`);
      mostrarNotificacao('✅ PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      mostrarNotificacao('❌ Erro ao gerar PDF');
    }
  };

  const imc = calcularIMC();
  const rcq = calcularRCQ();

  // TELA DE LOGIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-600 via-emerald-600 to-green-600 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="bg-teal-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="text-teal-600" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Sistema de Nutrição</h1>
            <p className="text-gray-600">Paula do Amaral Santos</p>
            <p className="text-sm text-gray-500">CRN: 08100732</p>
          </div>

          <div className="space-y-4">
            {USAR_SUPABASE && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha de Acesso
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Digite sua senha"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="mr-2"
              />
              <label className="text-sm text-gray-600">Mostrar senha</label>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-3 rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              Entrar no Sistema
            </button>
          </div>

          <p className="text-xs text-center text-gray-500 mt-6">
            Sistema Profissional v{VERSAO_SISTEMA} - Todos os direitos reservados
          </p>
        </div>
      </div>
    );
  }

  // CONTINUAÇÃO DO CÓDIGO (View de Lista e Paciente)...
  // [O restante do código continua igual, mas com os novos componentes]

  // Por questão de espaço, vou criar o restante em um próximo bloco
  // Mas a estrutura principal está completa

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">
      {/* Notificação */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg p-4 border-l-4 border-teal-600 animate-slide-in">
          <p className="text-gray-800">{notificationMessage}</p>
        </div>
      )}

      {/* Assistente de Pesquisa */}
      {showSearchAssistant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <HelpCircle className="text-teal-600" size={24} />
                Assistente de Pesquisa
              </h3>
              <button onClick={() => setShowSearchAssistant(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchAssistant('google')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent mb-4"
              placeholder="Digite o termo para pesquisar..."
              autoFocus
            />

            <div className="space-y-2">
              <button
                onClick={() => handleSearchAssistant('google')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                🔍 Pesquisar no Google
              </button>
              <button
                onClick={() => handleSearchAssistant('pubmed')}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                📚 Pesquisar no PubMed
              </button>
              <button
                onClick={() => handleSearchAssistant('chatgpt')}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                🤖 Perguntar ao ChatGPT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botão Flutuante de Pesquisa */}
      <button
        onClick={() => setShowSearchAssistant(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all z-40 hover:scale-110"
        title="Assistente de Pesquisa"
      >
        <HelpCircle size={28} />
      </button>

      {/* Botão Logout - Compacto */}
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 bg-red-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-red-700 transition-all z-50 flex items-center gap-1.5 text-sm"
      >
        <LogOut size={16} />
        Sair
      </button>

      {/* ========== VIEW DE LISTA DE PACIENTES ========== */}
      {view === 'lista' && (
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-8 text-white">
                <h1 className="text-3xl font-bold mb-2">Sistema Profissional de Nutrição</h1>
                <p className="text-teal-100">Nutricionista Paula do Amaral Santos - CRN: 08100732</p>
              </div>

              {/* Barra de ações */}
              <div className="p-6 border-b bg-gray-50">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Buscar paciente por nome, email ou telefone..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={novoPaciente}
                      className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg font-semibold"
                    >
                      <Plus size={20} />
                      Novo Paciente
                    </button>
                    <button
                      onClick={() => setShowArchivedView(!showArchivedView)}
                      className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-all shadow-md hover:shadow-lg font-semibold"
                    >
                      <Archive size={20} />
                      Arquivados ({pacientesArquivados.length})
                    </button>
                    <button
                      onClick={exportarBackupCompleto}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-semibold"
                    >
                      <Download size={20} />
                      Backup
                    </button>
                    <label className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all shadow-md hover:shadow-lg font-semibold cursor-pointer">
                      <Upload size={20} />
                      Restaurar
                      <input
                        type="file"
                        accept=".json"
                        onChange={importarBackup}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Lista de pacientes */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="text-teal-600" size={24} />
                  <h2 className="text-xl font-bold text-gray-800">
                    {showArchivedView
                      ? `Pacientes Arquivados (${pacientesArquivados.length})`
                      : `Pacientes Ativos (${pacientesFiltrados.length})`
                    }
                  </h2>
                </div>

                {showArchivedView ? (
                  // Lista de Arquivados
                  pacientesArquivados.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <Archive className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-600 text-lg">Nenhum paciente arquivado</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pacientesArquivados.map((pac) => (
                        <div
                          key={pac.id}
                          className="bg-gradient-to-br from-gray-100 to-gray-200 p-5 rounded-lg border border-gray-300 hover:shadow-lg transition-all opacity-75"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="bg-gray-500 text-white rounded-full p-2">
                                <Archive size={24} />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-800 text-lg">{pac.dados.nome}</h3>
                                <p className="text-sm text-gray-600">
                                  {calcularIdade(pac.dados.dataNascimento)} anos • {pac.dados.sexo}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold">Arquivado em:</span> {new Date(pac.dados.dataArquivamento).toLocaleDateString('pt-BR')}
                            </p>
                            <p className="text-xs text-gray-500 italic">
                              Para restaurar, use o botão "Restaurar" e selecione o arquivo de backup individual.
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  // Lista de Pacientes Ativos
                  pacientesFiltrados.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <Users className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-600 text-lg">
                        {busca ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {busca ? 'Tente buscar por outro termo' : 'Clique em "Novo Paciente" para começar'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pacientesFiltrados.map((pac) => (
                        <div
                          key={pac.id}
                          className="bg-gradient-to-br from-white to-teal-50 p-5 rounded-lg border border-teal-200 hover:shadow-lg transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="bg-teal-600 text-white rounded-full p-2">
                                <User size={24} />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-800 text-lg">{pac.dados.nome}</h3>
                                <p className="text-sm text-gray-600">
                                  {calcularIdade(pac.dados.dataNascimento)} anos • {pac.dados.sexo}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold">Tel:</span> {pac.dados.telefone || 'Não informado'}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold">Email:</span> {pac.dados.email || 'Não informado'}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold">Objetivo:</span> {pac.dados.objetivo || 'Não informado'}
                            </p>
                            <p className="text-xs text-gray-500">
                              Última consulta: {new Date(pac.dados.ultimaConsulta).toLocaleDateString('pt-BR')}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => abrirPaciente(pac.id)}
                              className="flex-1 flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors font-semibold"
                            >
                              <FolderOpen size={16} />
                              Abrir
                            </button>
                            <button
                              onClick={() => arquivarPaciente(pac.id)}
                              className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                              title="Dar Alta e Arquivar"
                            >
                              <Archive size={16} />
                            </button>
                            <button
                              onClick={() => deletarPaciente(pac.id)}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== VIEW DO PACIENTE ========== */}
      {view === 'paciente' && (
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Header do Paciente */}
              <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 text-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={voltarParaLista}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                    >
                      <ArrowLeft size={24} />
                    </button>
                    <div>
                      <h1 className="text-2xl font-bold">
                        {paciente.nome || 'Novo Paciente'}
                      </h1>
                      <p className="text-teal-100 text-sm">
                        Nutricionista Paula do Amaral Santos - CRN: 08100732
                      </p>
                      {paciente.dataNascimento && (
                        <p className="text-teal-100 text-sm">
                          {calcularIdade(paciente.dataNascimento)} anos • {paciente.sexo}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={salvarPacienteAtual}
                      className="flex items-center gap-2 bg-white text-teal-600 px-6 py-3 rounded-lg hover:bg-teal-50 transition-all shadow-md hover:shadow-lg font-semibold"
                    >
                      <Save size={20} />
                      Salvar
                    </button>
                    <button
                      onClick={exportarParaExcel}
                      className="flex items-center gap-2 bg-emerald-700 text-white px-6 py-3 rounded-lg hover:bg-emerald-800 transition-all shadow-md hover:shadow-lg font-semibold"
                    >
                      <Download size={20} />
                      Excel
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs de Navegação */}
              <div className="flex overflow-x-auto border-b bg-gray-50">
                {[
                  { id: 'cadastro', label: 'Cadastro', icon: User },
                  { id: 'avaliacao', label: 'Avaliação', icon: Activity },
                  { id: 'adipometro', label: 'Adipômetro', icon: Ruler },
                  { id: 'bioimpedancia', label: 'Bioimpedância', icon: Activity },
                  { id: 'anamnese', label: 'Anamnese', icon: FileText },
                  { id: 'acompanhamento', label: 'Acompanhamento', icon: TrendingUp },
                  { id: 'plano', label: 'Plano Alimentar', icon: FileText },
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-b-2 border-teal-600 text-teal-600 bg-white'
                          : 'text-gray-600 hover:text-teal-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={18} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Conteúdo das Abas */}
              <div className="p-8">

                {/* ===== ABA CADASTRO ===== */}
                {activeTab === 'cadastro' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Dados do Paciente</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                        <input
                          type="text"
                          value={paciente.nome}
                          onChange={(e) => setPaciente({...paciente, nome: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Nome completo do paciente"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento *</label>
                        <input
                          type="date"
                          value={paciente.dataNascimento}
                          onChange={(e) => setPaciente({...paciente, dataNascimento: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                        {paciente.dataNascimento && (
                          <p className="text-sm text-gray-600 mt-1">
                            Idade: {calcularIdade(paciente.dataNascimento)} anos
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sexo *</label>
                        <select
                          value={paciente.sexo}
                          onChange={(e) => setPaciente({...paciente, sexo: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                          <option>Feminino</option>
                          <option>Masculino</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                        <input
                          type="tel"
                          value={paciente.telefone}
                          onChange={(e) => setPaciente({...paciente, telefone: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={paciente.email}
                          onChange={(e) => setPaciente({...paciente, email: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="email@exemplo.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profissão</label>
                        <input
                          type="text"
                          value={paciente.profissao}
                          onChange={(e) => setPaciente({...paciente, profissao: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Objetivo Principal *</label>
                        <textarea
                          value={paciente.objetivo}
                          onChange={(e) => setPaciente({...paciente, objetivo: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          rows="3"
                          placeholder="Ex: Perda de peso, ganho de massa muscular, reeducação alimentar..."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Restrições Alimentares / Alergias</label>
                        <textarea
                          value={paciente.restricoes}
                          onChange={(e) => setPaciente({...paciente, restricoes: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          rows="3"
                          placeholder="Ex: Intolerância à lactose, alergia a frutos do mar..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ===== ABA AVALIAÇÃO (parte 1) ===== */}
                {activeTab === 'avaliacao' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">Avaliação Antropométrica Inicial</h2>
                      <div className="text-sm text-gray-600">
                        Data: <input
                          type="date"
                          value={avaliacaoInicial.data}
                          onChange={(e) => setAvaliacaoInicial({...avaliacaoInicial, data: e.target.value})}
                          className="ml-2 px-3 py-1 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Medidas Básicas com Cores */}
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Peso (kg) *</label>
                        <input
                          type="number"
                          step="0.1"
                          value={avaliacaoInicial.peso}
                          onChange={(e) => setAvaliacaoInicial({...avaliacaoInicial, peso: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="65.5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Altura (cm) *</label>
                        <input
                          type="number"
                          step="0.1"
                          value={avaliacaoInicial.altura}
                          onChange={(e) => setAvaliacaoInicial({...avaliacaoInicial, altura: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="165"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">IMC</label>
                        <div className={`w-full px-4 py-3 border-2 rounded-lg font-bold text-lg ${
                          imc === '-' ? 'bg-gray-50 border-gray-200 text-gray-500' :
                          getCorIMC(parseFloat(imc)) === 'green' ? 'bg-green-50 border-green-400 text-green-700' :
                          getCorIMC(parseFloat(imc)) === 'yellow' ? 'bg-yellow-50 border-yellow-400 text-yellow-700' :
                          'bg-red-50 border-red-400 text-red-700'
                        }`}>
                          {imc}
                          {imc !== '-' && (
                            <span className="text-xs ml-2 block mt-1">
                              {classificarIMC(parseFloat(imc))}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Circunferências */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-4">Circunferências (cm)</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Cintura</label>
                          <input
                            type="number"
                            step="0.1"
                            value={avaliacaoInicial.circCintura}
                            onChange={(e) => setAvaliacaoInicial({...avaliacaoInicial, circCintura: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Quadril</label>
                          <input
                            type="number"
                            step="0.1"
                            value={avaliacaoInicial.circQuadril}
                            onChange={(e) => setAvaliacaoInicial({...avaliacaoInicial, circQuadril: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">RCQ (Relação Cintura/Quadril)</label>
                          <div className={`w-full px-4 py-2 border-2 rounded-lg font-bold ${
                            rcq === '-' ? 'bg-gray-50 border-gray-200 text-gray-500' :
                            getCorRCQ(parseFloat(rcq), paciente.sexo) === 'green' ? 'bg-green-50 border-green-400 text-green-700' :
                            'bg-red-50 border-red-400 text-red-700'
                          }`}>
                            {rcq}
                            {rcq !== '-' && (
                              <span className="text-xs ml-2">
                                {getCorRCQ(parseFloat(rcq), paciente.sexo) === 'green' ? '✓ Normal' : '⚠ Risco CV'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Braço</label>
                          <input
                            type="number"
                            step="0.1"
                            value={avaliacaoInicial.circBraco}
                            onChange={(e) => setAvaliacaoInicial({...avaliacaoInicial, circBraco: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Coxa</label>
                          <input
                            type="number"
                            step="0.1"
                            value={avaliacaoInicial.circCoxa}
                            onChange={(e) => setAvaliacaoInicial({...avaliacaoInicial, circCoxa: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Panturrilha</label>
                          <input
                            type="number"
                            step="0.1"
                            value={avaliacaoInicial.circPanturrilha}
                            onChange={(e) => setAvaliacaoInicial({...avaliacaoInicial, circPanturrilha: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Composição Corporal */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-4">Composição Corporal</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">% Gordura</label>
                          <input
                            type="number"
                            step="0.1"
                            value={avaliacaoInicial.percentualGordura}
                            onChange={(e) => setAvaliacaoInicial({...avaliacaoInicial, percentualGordura: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Massa Magra (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={avaliacaoInicial.massaMagra}
                            onChange={(e) => setAvaliacaoInicial({...avaliacaoInicial, massaMagra: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Massa Gorda (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={avaliacaoInicial.massaGorda}
                            onChange={(e) => setAvaliacaoInicial({...avaliacaoInicial, massaGorda: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* REGISTRO FOTOGRÁFICO */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Camera className="text-blue-600" size={24} />
                        <h3 className="font-semibold text-gray-800 text-lg">Registro Fotográfico</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Adicione fotos para acompanhar a evolução visual do paciente (máximo 2MB cada)
                      </p>

                      <div className="grid md:grid-cols-3 gap-4">
                        {['frontal', 'costas', 'lateral'].map((tipo) => (
                          <div key={tipo} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 capitalize">
                              Foto {tipo === 'frontal' ? 'Frontal' : tipo === 'costas' ? 'de Costas' : 'Lateral'}
                            </label>
                            {avaliacaoInicial.fotos[tipo] ? (
                              <div className="relative">
                                <img
                                  src={avaliacaoInicial.fotos[tipo]}
                                  alt={`Foto ${tipo}`}
                                  className="w-full h-48 object-cover rounded-lg border-2 border-blue-300"
                                />
                                <button
                                  onClick={() => setAvaliacaoInicial(prev => ({
                                    ...prev,
                                    fotos: { ...prev.fotos, [tipo]: '' }
                                  }))}
                                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                                <Camera className="text-blue-400 mb-2" size={32} />
                                <span className="text-sm text-gray-600">Clique para adicionar</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFotoUpload(tipo, e)}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ===== ABA ADIPÔMETRO COM CORES ===== */}
                {activeTab === 'adipometro' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg border border-orange-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">Avaliação por Adipômetro</h2>
                          <p className="text-sm text-gray-600 mt-1">
                            Equipamento: Adipômetro Digital Científico Classic Sanny - KNS2001
                          </p>
                          <p className="text-sm text-gray-600">
                            Protocolo: Jackson & Pollock (7 Dobras Cutâneas)
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Paciente: {paciente.sexo} • {calcularIdade(paciente.dataNascimento)} anos
                          </p>
                        </div>
                        <div className="text-sm text-gray-600">
                          Data: <input
                            type="date"
                            value={adipometro.data}
                            onChange={(e) => setAdipometro({...adipometro, data: e.target.value})}
                            className="ml-2 px-3 py-1 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-orange-200">
                        <h3 className="font-semibold text-gray-800 mb-4">Dobras Cutâneas (mm)</h3>

                        {/* DOBRAS BILATERAIS (E/D) */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-orange-700 mb-3 flex items-center gap-2">
                            <span className="bg-orange-100 px-2 py-1 rounded">Medidas Bilaterais</span>
                            <span className="text-xs text-gray-500">(Medir ambos os lados)</span>
                          </h4>
                          <div className="grid md:grid-cols-2 gap-6">
                            {[
                              { keyE: 'tricepsE', keyD: 'tricepsD', label: 'Tríceps', desc: 'Ponto médio entre acrômio e olécrano' },
                              { keyE: 'bicepsE', keyD: 'bicepsD', label: 'Bíceps', desc: 'Mesmo ponto do tríceps, face anterior' },
                              { keyE: 'coxaE', keyD: 'coxaD', label: 'Coxa', desc: 'Ponto médio entre ligamento inguinal e patela' },
                              { keyE: 'panturrilhaE', keyD: 'panturrilhaD', label: 'Panturrilha', desc: 'Maior perímetro da panturrilha' }
                            ].map(dobra => (
                              <div key={dobra.keyE} className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                                <label className="block text-sm font-bold text-gray-800 mb-2">
                                  {dobra.label}
                                </label>
                                <p className="text-xs text-gray-600 mb-3">{dobra.desc}</p>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Esquerdo (E)</label>
                                    <input
                                      type="number"
                                      step="0.1"
                                      value={adipometro.dobras[dobra.keyE]}
                                      onChange={(e) => setAdipometro({
                                        ...adipometro,
                                        dobras: { ...adipometro.dobras, [dobra.keyE]: e.target.value }
                                      })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                      placeholder="0.0"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Direito (D)</label>
                                    <input
                                      type="number"
                                      step="0.1"
                                      value={adipometro.dobras[dobra.keyD]}
                                      onChange={(e) => setAdipometro({
                                        ...adipometro,
                                        dobras: { ...adipometro.dobras, [dobra.keyD]: e.target.value }
                                      })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                      placeholder="0.0"
                                    />
                                  </div>
                                </div>
                                {(adipometro.dobras[dobra.keyE] && adipometro.dobras[dobra.keyD]) && (
                                  <div className="mt-2 text-center">
                                    <span className="text-xs text-green-700 font-semibold">
                                      Média: {(((parseFloat(adipometro.dobras[dobra.keyE]) || 0) + (parseFloat(adipometro.dobras[dobra.keyD]) || 0)) / 2).toFixed(2)} mm
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* DOBRAS CENTRAIS (única medida) */}
                        <div>
                          <h4 className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2">
                            <span className="bg-blue-100 px-2 py-1 rounded">Medidas Centrais</span>
                            <span className="text-xs text-gray-500">(Medir uma vez)</span>
                          </h4>
                          <div className="grid md:grid-cols-3 gap-4">
                            {[
                              { key: 'subescapular', label: 'Subescapular', desc: '2cm abaixo do ângulo inferior da escápula' },
                              { key: 'suprailiaca', label: 'Supra-ilíaca', desc: 'Acima da crista ilíaca, linha axilar média' },
                              { key: 'abdominal', label: 'Abdominal', desc: '2cm lateral à cicatriz umbilical' }
                            ].map(dobra => (
                              <div key={dobra.key} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <label className="block text-sm font-bold text-gray-800 mb-1">
                                  {dobra.label}
                                </label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={adipometro.dobras[dobra.key]}
                                  onChange={(e) => setAdipometro({
                                    ...adipometro,
                                    dobras: { ...adipometro.dobras, [dobra.key]: e.target.value }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="0.0"
                                />
                                <p className="text-xs text-gray-600 mt-1">{dobra.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RESULTADOS COM CORES INTELIGENTES */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                      <h3 className="font-semibold text-gray-800 mb-4 text-lg flex items-center gap-2">
                        <CheckCircle className="text-green-600" size={24} />
                        Resultados Calculados Automaticamente
                      </h3>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Soma das Dobras (mm)</label>
                          <div className="w-full px-4 py-3 bg-blue-100 border border-blue-300 rounded-lg font-bold text-blue-700 text-lg">
                            {adipometro.somaDobras}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">% Gordura Corporal</label>
                          <div className={`w-full px-4 py-3 border-2 rounded-lg font-bold text-lg ${
                            !adipometro.percentualGordura ? 'bg-gray-50 border-gray-200 text-gray-500' :
                            getCorGorduraCorporal(adipometro.percentualGordura, paciente.sexo) === 'green' ? 'bg-green-50 border-green-400 text-green-700' :
                            getCorGorduraCorporal(adipometro.percentualGordura, paciente.sexo) === 'yellow' ? 'bg-yellow-50 border-yellow-400 text-yellow-700' :
                            getCorGorduraCorporal(adipometro.percentualGordura, paciente.sexo) === 'orange' ? 'bg-orange-50 border-orange-400 text-orange-700' :
                            'bg-red-50 border-red-400 text-red-700'
                          }`}>
                            {adipometro.percentualGordura || '-'}%
                            {adipometro.percentualGordura && (
                              <span className="text-xs block mt-1">
                                {getClassificacaoGordura(adipometro.percentualGordura, paciente.sexo)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Massa Gorda (kg)</label>
                          <div className="w-full px-4 py-3 bg-purple-100 border border-purple-300 rounded-lg font-bold text-purple-700 text-lg">
                            {adipometro.massaGorda || '-'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Massa Magra (kg)</label>
                          <div className="w-full px-4 py-3 bg-indigo-100 border border-indigo-300 rounded-lg font-bold text-indigo-700 text-lg">
                            {adipometro.massaMagra || '-'}
                          </div>
                        </div>
                      </div>

                      {/* Faixas de Referência */}
                      {adipometro.percentualGordura && (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                          <h4 className="font-semibold text-gray-700 mb-2 text-sm">Faixas de Referência ({paciente.sexo}):</h4>
                          <div className="grid md:grid-cols-5 gap-2 text-xs">
                            <div className="p-2 bg-red-50 border border-red-300 rounded text-center">
                              <div className="font-semibold text-red-700">Muito Baixo</div>
                              <div className="text-gray-600">{paciente.sexo === 'Masculino' ? '< 6%' : '< 14%'}</div>
                            </div>
                            <div className="p-2 bg-green-50 border border-green-300 rounded text-center">
                              <div className="font-semibold text-green-700">Ótimo</div>
                              <div className="text-gray-600">{paciente.sexo === 'Masculino' ? '6-13%' : '14-20%'}</div>
                            </div>
                            <div className="p-2 bg-yellow-50 border border-yellow-300 rounded text-center">
                              <div className="font-semibold text-yellow-700">Normal</div>
                              <div className="text-gray-600">{paciente.sexo === 'Masculino' ? '14-17%' : '21-24%'}</div>
                            </div>
                            <div className="p-2 bg-orange-50 border border-orange-300 rounded text-center">
                              <div className="font-semibold text-orange-700">Acima</div>
                              <div className="text-gray-600">{paciente.sexo === 'Masculino' ? '18-24%' : '25-31%'}</div>
                            </div>
                            <div className="p-2 bg-red-50 border border-red-300 rounded text-center">
                              <div className="font-semibold text-red-700">Risco</div>
                              <div className="text-gray-600">{paciente.sexo === 'Masculino' ? '> 25%' : '> 32%'}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Observações Clínicas</label>
                      <textarea
                        value={adipometro.observacoes}
                        onChange={(e) => setAdipometro({...adipometro, observacoes: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        rows="4"
                        placeholder="Registre observações sobre as medições, dificuldades encontradas, áreas de atenção..."
                      />
                    </div>
                  </div>
                )}

                {/* ===== ABA BIOIMPEDÂNCIA ===== */}
                {activeTab === 'bioimpedancia' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">Análise de Bioimpedância</h2>
                      <div className="text-sm text-gray-600">
                        Data do Exame: <input
                          type="date"
                          value={bioimpedancia.data}
                          onChange={(e) => setBioimpedancia({...bioimpedancia, data: e.target.value})}
                          className="ml-2 px-3 py-1 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Peso (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={bioimpedancia.peso}
                          onChange={(e) => setBioimpedancia({...bioimpedancia, peso: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Altura (cm)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={bioimpedancia.altura}
                          onChange={(e) => setBioimpedancia({...bioimpedancia, altura: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">IMC</label>
                        <input
                          type="number"
                          step="0.1"
                          value={bioimpedancia.imc}
                          onChange={(e) => setBioimpedancia({...bioimpedancia, imc: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <h3 className="font-semibold text-gray-800 mb-4">Metabolismo</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">TMB - Taxa Metabólica Basal (kcal/dia)</label>
                          <input
                            type="number"
                            step="1"
                            value={bioimpedancia.tmb}
                            onChange={(e) => setBioimpedancia({...bioimpedancia, tmb: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-gray-800 mb-4">Composição Corporal</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">% Gordura Corporal</label>
                          <input
                            type="number"
                            step="0.1"
                            value={bioimpedancia.percentualGordura}
                            onChange={(e) => setBioimpedancia({...bioimpedancia, percentualGordura: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Massa de Gordura (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={bioimpedancia.massaGordura}
                            onChange={(e) => setBioimpedancia({...bioimpedancia, massaGordura: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Massa Magra (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={bioimpedancia.massaMagra}
                            onChange={(e) => setBioimpedancia({...bioimpedancia, massaMagra: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Massa Muscular (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={bioimpedancia.massaMuscular}
                            onChange={(e) => setBioimpedancia({...bioimpedancia, massaMuscular: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Proteínas (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={bioimpedancia.proteinas}
                            onChange={(e) => setBioimpedancia({...bioimpedancia, proteinas: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Minerais (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={bioimpedancia.minerais}
                            onChange={(e) => setBioimpedancia({...bioimpedancia, minerais: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                      <h3 className="font-semibold text-gray-800 mb-4">Água Corporal</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Água Total (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={bioimpedancia.aguaTotal}
                            onChange={(e) => setBioimpedancia({...bioimpedancia, aguaTotal: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Água Intracelular (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={bioimpedancia.aguaIntracelular}
                            onChange={(e) => setBioimpedancia({...bioimpedancia, aguaIntracelular: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Água Extracelular (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={bioimpedancia.aguaExtracelular}
                            onChange={(e) => setBioimpedancia({...bioimpedancia, aguaExtracelular: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h3 className="font-semibold text-gray-800 mb-4">Análises Avançadas</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Gordura Visceral (nível)</label>
                          <input
                            type="number"
                            step="1"
                            value={bioimpedancia.gorduraVisceral}
                            onChange={(e) => setBioimpedancia({...bioimpedancia, gorduraVisceral: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Ângulo de Fase (°)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={bioimpedancia.anguloFase}
                            onChange={(e) => setBioimpedancia({...bioimpedancia, anguloFase: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Impedância (Ohms)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={bioimpedancia.impedancia}
                            onChange={(e) => setBioimpedancia({...bioimpedancia, impedancia: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Observações Clínicas</label>
                      <textarea
                        value={bioimpedancia.observacoes}
                        onChange={(e) => setBioimpedancia({...bioimpedancia, observacoes: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        rows="4"
                        placeholder="Registre aqui observações sobre os resultados da bioimpedância..."
                      />
                    </div>
                  </div>
                )}

                {/* ===== ABA ANAMNESE ===== */}
                {activeTab === 'anamnese' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Anamnese Alimentar e Clínica</h2>

                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg border border-orange-200">
                      <h3 className="font-semibold text-gray-800 mb-4 text-lg">Recordatório Alimentar 24h</h3>

                      <div className="space-y-4">
                        <div className="grid md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Café da Manhã - Horário</label>
                            <input
                              type="time"
                              value={anamnese.cafeManhaHorario}
                              onChange={(e) => setAnamnese({...anamnese, cafeManhaHorario: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                          <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Alimentos / Bebidas</label>
                            <input
                              type="text"
                              value={anamnese.cafeManhaAlimentos}
                              onChange={(e) => setAnamnese({...anamnese, cafeManhaAlimentos: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                              placeholder="Ex: Café com leite, pão integral, queijo branco..."
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Lanche da Manhã</label>
                          <input
                            type="text"
                            value={anamnese.lancheManha}
                            onChange={(e) => setAnamnese({...anamnese, lancheManha: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            placeholder="Ex: Fruta, iogurte..."
                          />
                        </div>

                        <div className="grid md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Almoço - Horário</label>
                            <input
                              type="time"
                              value={anamnese.almocoHorario}
                              onChange={(e) => setAnamnese({...anamnese, almocoHorario: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                          <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Alimentos / Bebidas</label>
                            <input
                              type="text"
                              value={anamnese.almocoAlimentos}
                              onChange={(e) => setAnamnese({...anamnese, almocoAlimentos: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                              placeholder="Ex: Arroz, feijão, frango grelhado, salada..."
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Lanche da Tarde</label>
                          <input
                            type="text"
                            value={anamnese.lancheTarde}
                            onChange={(e) => setAnamnese({...anamnese, lancheTarde: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            placeholder="Ex: Pão integral, café..."
                          />
                        </div>

                        <div className="grid md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Jantar - Horário</label>
                            <input
                              type="time"
                              value={anamnese.jantarHorario}
                              onChange={(e) => setAnamnese({...anamnese, jantarHorario: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                          <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Alimentos / Bebidas</label>
                            <input
                              type="text"
                              value={anamnese.jantarAlimentos}
                              onChange={(e) => setAnamnese({...anamnese, jantarAlimentos: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                              placeholder="Ex: Sopa, sanduíche..."
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Ceia</label>
                          <input
                            type="text"
                            value={anamnese.ceia}
                            onChange={(e) => setAnamnese({...anamnese, ceia: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            placeholder="Ex: Chá, biscoito..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-gray-800 mb-4 text-lg">Hábitos de Vida</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Ingestão de Água (L/dia)</label>
                          <input
                            type="text"
                            value={anamnese.ingestaoAgua}
                            onChange={(e) => setAnamnese({...anamnese, ingestaoAgua: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            placeholder="Ex: 2 litros"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Atividade Física</label>
                          <input
                            type="text"
                            value={anamnese.atividadeFisica}
                            onChange={(e) => setAnamnese({...anamnese, atividadeFisica: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            placeholder="Ex: Caminhada, musculação..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Frequência da Atividade</label>
                          <input
                            type="text"
                            value={anamnese.frequenciaAtividade}
                            onChange={(e) => setAnamnese({...anamnese, frequenciaAtividade: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            placeholder="Ex: 3x por semana"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Qualidade do Sono</label>
                          <input
                            type="text"
                            value={anamnese.sono}
                            onChange={(e) => setAnamnese({...anamnese, sono: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            placeholder="Ex: 7 horas por noite, acorda durante a noite..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Funcionamento Intestinal</label>
                          <input
                            type="text"
                            value={anamnese.intestino}
                            onChange={(e) => setAnamnese({...anamnese, intestino: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            placeholder="Ex: Regular, diário, constipação..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nível de Estresse</label>
                          <select
                            value={anamnese.nivelEstresse}
                            onChange={(e) => setAnamnese({...anamnese, nivelEstresse: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="">Selecione...</option>
                            <option value="Baixo">Baixo</option>
                            <option value="Moderado">Moderado</option>
                            <option value="Alto">Alto</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                      <h3 className="font-semibold text-gray-800 mb-4 text-lg">Histórico Clínico</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Medicamentos em Uso</label>
                          <textarea
                            value={anamnese.medicamentos}
                            onChange={(e) => setAnamnese({...anamnese, medicamentos: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            rows="2"
                            placeholder="Liste os medicamentos e dosagens..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Patologias / Doenças Diagnosticadas</label>
                          <textarea
                            value={anamnese.patologias}
                            onChange={(e) => setAnamnese({...anamnese, patologias: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            rows="2"
                            placeholder="Ex: Diabetes, hipertensão, hipotireoidismo..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Histórico de Peso</label>
                          <textarea
                            value={anamnese.historicoPeso}
                            onChange={(e) => setAnamnese({...anamnese, historicoPeso: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            rows="2"
                            placeholder="Peso máximo, mínimo, variações ao longo da vida..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Histórico Familiar</label>
                          <textarea
                            value={anamnese.historicoFamiliar}
                            onChange={(e) => setAnamnese({...anamnese, historicoFamiliar: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            rows="2"
                            placeholder="Doenças na família (diabetes, obesidade, câncer, etc)..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ===== ABA ACOMPANHAMENTO COM GRÁFICOS 📊 ===== */}
                {activeTab === 'acompanhamento' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-gray-800">Acompanhamento Mensal</h2>
                      <button
                        onClick={adicionarConsulta}
                        className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                      >
                        <Plus size={18} />
                        Nova Consulta
                      </button>
                    </div>

                    {/* GRÁFICOS DE EVOLUÇÃO */}
                    {prepararDadosGrafico().length > 0 && (
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-200">
                        <div className="flex items-center gap-2 mb-4">
                          <BarChart3 className="text-indigo-600" size={24} />
                          <h3 className="font-semibold text-gray-800 text-lg">Gráfico de Evolução</h3>
                        </div>

                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={prepararDadosGrafico()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="data"
                              tick={{fontSize: 12}}
                              tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                            />
                            <YAxis tick={{fontSize: 12}} />
                            <Tooltip
                              labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                              contentStyle={{backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px'}}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="peso" stroke="#14b8a6" strokeWidth={2} name="Peso (kg)" />
                            <Line type="monotone" dataKey="imc" stroke="#3b82f6" strokeWidth={2} name="IMC" />
                            <Line type="monotone" dataKey="gordura" stroke="#f59e0b" strokeWidth={2} name="% Gordura" />
                          </LineChart>
                        </ResponsiveContainer>

                        <div className="mt-4 grid md:grid-cols-3 gap-4">
                          {prepararDadosGrafico().length >= 2 && (() => {
                            const dados = prepararDadosGrafico();
                            const primeiro = dados[0];
                            const ultimo = dados[dados.length - 1];
                            const difPeso = (ultimo.peso - primeiro.peso).toFixed(1);
                            const difIMC = (ultimo.imc - primeiro.imc).toFixed(1);
                            const difGordura = (ultimo.gordura - primeiro.gordura).toFixed(1);

                            return (
                              <>
                                <div className={`p-4 rounded-lg border-2 ${difPeso < 0 ? 'bg-green-50 border-green-300' : difPeso > 0 ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-300'}`}>
                                  <div className="text-sm font-medium text-gray-700">Variação de Peso</div>
                                  <div className={`text-2xl font-bold ${difPeso < 0 ? 'text-green-700' : difPeso > 0 ? 'text-red-700' : 'text-gray-700'}`}>
                                    {difPeso > 0 ? '+' : ''}{difPeso} kg
                                  </div>
                                </div>
                                <div className={`p-4 rounded-lg border-2 ${difIMC < 0 ? 'bg-green-50 border-green-300' : difIMC > 0 ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-300'}`}>
                                  <div className="text-sm font-medium text-gray-700">Variação de IMC</div>
                                  <div className={`text-2xl font-bold ${difIMC < 0 ? 'text-green-700' : difIMC > 0 ? 'text-red-700' : 'text-gray-700'}`}>
                                    {difIMC > 0 ? '+' : ''}{difIMC}
                                  </div>
                                </div>
                                <div className={`p-4 rounded-lg border-2 ${difGordura < 0 ? 'bg-green-50 border-green-300' : difGordura > 0 ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-300'}`}>
                                  <div className="text-sm font-medium text-gray-700">Variação % Gordura</div>
                                  <div className={`text-2xl font-bold ${difGordura < 0 ? 'text-green-700' : difGordura > 0 ? 'text-red-700' : 'text-gray-700'}`}>
                                    {difGordura > 0 ? '+' : ''}{difGordura}%
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {acompanhamento.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-600">Nenhuma consulta de acompanhamento registrada</p>
                        <p className="text-sm text-gray-500 mt-2">Clique em "Nova Consulta" para adicionar</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {acompanhamento.map((consulta, index) => (
                          <div key={index} className="bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-lg border border-teal-200">
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="font-semibold text-lg text-gray-800">Consulta #{index + 1}</h3>
                              <button
                                onClick={() => removerConsulta(index)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                                <input
                                  type="date"
                                  value={consulta.data}
                                  onChange={(e) => atualizarConsulta(index, 'data', e.target.value)}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Peso (kg)</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={consulta.peso}
                                  onChange={(e) => atualizarConsulta(index, 'peso', e.target.value)}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">IMC</label>
                                <div className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold text-teal-700">
                                  {consulta.imc || '-'}
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Circunf. Cintura (cm)</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={consulta.circCintura}
                                  onChange={(e) => atualizarConsulta(index, 'circCintura', e.target.value)}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Circunf. Quadril (cm)</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={consulta.circQuadril}
                                  onChange={(e) => atualizarConsulta(index, 'circQuadril', e.target.value)}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">% Gordura</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={consulta.percentualGordura}
                                  onChange={(e) => atualizarConsulta(index, 'percentualGordura', e.target.value)}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                />
                              </div>
                            </div>

                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                              <textarea
                                value={consulta.observacoes}
                                onChange={(e) => atualizarConsulta(index, 'observacoes', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                rows="3"
                                placeholder="Registre observações, evolução do paciente, dificuldades relatadas..."
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ===== ABA PLANO ALIMENTAR ===== */}
                {activeTab === 'plano' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">Plano Alimentar Individualizado</h2>
                      <button
                        onClick={exportarPlanoParaPDF}
                        className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg font-semibold"
                      >
                        <Download size={20} />
                        Exportar Plano (PDF)
                      </button>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                      <h3 className="font-semibold text-gray-800 mb-4 text-lg">Prescrição Dietética</h3>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Objetivo Clínico</label>
                          <textarea
                            value={planoAlimentar.objetivoClinico}
                            onChange={(e) => setPlanoAlimentar({...planoAlimentar, objetivoClinico: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            rows="2"
                            placeholder="Ex: Redução de peso de forma saudável, ganho de massa magra..."
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">VET (kcal/dia)</label>
                          <input
                            type="number"
                            value={planoAlimentar.prescricao.vet}
                            onChange={(e) => setPlanoAlimentar({...planoAlimentar, prescricao: {...planoAlimentar.prescricao, vet: e.target.value}})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            placeholder="1800"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">CHO (g)</label>
                          <input
                            type="number"
                            value={planoAlimentar.prescricao.cho}
                            onChange={(e) => setPlanoAlimentar({...planoAlimentar, prescricao: {...planoAlimentar.prescricao, cho: e.target.value}})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            placeholder="225"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">PTN (g)</label>
                          <input
                            type="number"
                            value={planoAlimentar.prescricao.ptn}
                            onChange={(e) => setPlanoAlimentar({...planoAlimentar, prescricao: {...planoAlimentar.prescricao, ptn: e.target.value}})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            placeholder="90"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">LIP (g)</label>
                          <input
                            type="number"
                            value={planoAlimentar.prescricao.lip}
                            onChange={(e) => setPlanoAlimentar({...planoAlimentar, prescricao: {...planoAlimentar.prescricao, lip: e.target.value}})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            placeholder="60"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-800 text-lg">Distribuição das Refeições</h3>

                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Café da Manhã</label>
                        <textarea
                          value={planoAlimentar.refeicoes.cafeManha}
                          onChange={(e) => setPlanoAlimentar({...planoAlimentar, refeicoes: {...planoAlimentar.refeicoes, cafeManha: e.target.value}})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          rows="3"
                          placeholder="Ex: 1 fatia de pão integral, 1 ovo mexido, 1 fruta..."
                        />
                      </div>

                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Lanche da Manhã</label>
                        <textarea
                          value={planoAlimentar.refeicoes.lancheManha}
                          onChange={(e) => setPlanoAlimentar({...planoAlimentar, refeicoes: {...planoAlimentar.refeicoes, lancheManha: e.target.value}})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          rows="3"
                          placeholder="Ex: 1 iogurte natural, castanhas..."
                        />
                      </div>

                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Almoço</label>
                        <textarea
                          value={planoAlimentar.refeicoes.almoco}
                          onChange={(e) => setPlanoAlimentar({...planoAlimentar, refeicoes: {...planoAlimentar.refeicoes, almoco: e.target.value}})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          rows="3"
                          placeholder="Ex: Arroz integral, feijão, proteína, salada..."
                        />
                      </div>

                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Lanche da Tarde</label>
                        <textarea
                          value={planoAlimentar.refeicoes.lancheTarde}
                          onChange={(e) => setPlanoAlimentar({...planoAlimentar, refeicoes: {...planoAlimentar.refeicoes, lancheTarde: e.target.value}})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          rows="3"
                          placeholder="Ex: Frutas, iogurte, pão integral..."
                        />
                      </div>

                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Jantar</label>
                        <textarea
                          value={planoAlimentar.refeicoes.jantar}
                          onChange={(e) => setPlanoAlimentar({...planoAlimentar, refeicoes: {...planoAlimentar.refeicoes, jantar: e.target.value}})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          rows="3"
                          placeholder="Ex: Proteína grelhada, legumes, arroz..."
                        />
                      </div>

                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ceia</label>
                        <textarea
                          value={planoAlimentar.refeicoes.ceia}
                          onChange={(e) => setPlanoAlimentar({...planoAlimentar, refeicoes: {...planoAlimentar.refeicoes, ceia: e.target.value}})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          rows="3"
                          placeholder="Ex: Chá, biscoito integral..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Orientações Gerais</label>
                      <textarea
                        value={planoAlimentar.orientacoes}
                        onChange={(e) => setPlanoAlimentar({...planoAlimentar, orientacoes: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        rows="4"
                        placeholder="Orientações sobre preparo, suplementação, restrições, substituições permitidas..."
                      />
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
