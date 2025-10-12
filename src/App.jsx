import { useState } from 'react';
import { Download, Plus, Trash2, User, Activity, FileText, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const App = () => {
  const [activeTab, setActiveTab] = useState('cadastro');
  const [bioimpedancia, setBioimpedancia] = useState({
    data: new Date().toISOString().split('T')[0],
    peso: '',
    altura: '',
    imc: '',
    tmb: '',
    percentualGordura: '',
    massaGordura: '',
    massaMagra: '',
    massaMuscular: '',
    aguaTotal: '',
    aguaIntracelular: '',
    aguaExtracelular: '',
    proteinas: '',
    minerais: '',
    gorduraVisceral: '',
    anguloFase: '',
    impedancia: '',
    observacoes: '',
  });
  const [paciente, setPaciente] = useState({
    nome: '',
    dataNascimento: '',
    sexo: 'Feminino',
    telefone: '',
    email: '',
    profissao: '',
    objetivo: '',
    restricoes: '',
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
    dobCutanea: '',
    percentualGordura: '',
    massaMagra: '',
    massaGorda: '',
  });

  const [acompanhamento, setAcompanhamento] = useState([]);
  const [anamnese, setAnamnese] = useState({
    cafeManhaHorario: '',
    cafeManhaAlimentos: '',
    lancheManha: '',
    almocoHorario: '',
    almocoAlimentos: '',
    lancheTarde: '',
    jantarHorario: '',
    jantarAlimentos: '',
    ceia: '',
    ingestaoAgua: '',
    atividadeFisica: '',
    frequenciaAtividade: '',
    medicamentos: '',
    patologias: '',
    historicoPeso: '',
    historicoFamiliar: '',
    intestino: '',
    sono: '',
    nivelEstresse: '',
  });

  const [planoAlimentar, setPlanoAlimentar] = useState({
    objetivoClinico: '',
    vet: '',
    cho: '',
    ptn: '',
    lip: '',
    observacoes: '',
    refeicoes: [
      { nome: 'Café da Manhã', horario: '7h', alimentos: '' },
      { nome: 'Lanche da Manhã', horario: '10h', alimentos: '' },
      { nome: 'Almoço', horario: '12h', alimentos: '' },
      { nome: 'Lanche da Tarde', horario: '15h', alimentos: '' },
      { nome: 'Jantar', horario: '19h', alimentos: '' },
      { nome: 'Ceia', horario: '21h', alimentos: '' },
    ]
  });

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

  const calcularRCQ = () => {
    const cintura = parseFloat(avaliacaoInicial.circCintura);
    const quadril = parseFloat(avaliacaoInicial.circQuadril);
    if (cintura && quadril) {
      return (cintura / quadril).toFixed(2);
    }
    return '-';
  };

  const adicionarConsulta = () => {
    const novaConsulta = {
      data: new Date().toISOString().split('T')[0],
      peso: '',
      imc: '',
      circCintura: '',
      circQuadril: '',
      percentualGordura: '',
      observacoes: '',
    };
    setAcompanhamento([...acompanhamento, novaConsulta]);
  };

  const removerConsulta = (index) => {
    setAcompanhamento(acompanhamento.filter((_, i) => i !== index));
  };

  const atualizarConsulta = (index, campo, valor) => {
    const novoAcompanhamento = [...acompanhamento];
    novoAcompanhamento[index][campo] = valor;

    if (campo === 'peso' || campo === 'altura') {
      const peso = parseFloat(novoAcompanhamento[index].peso);
      const altura = parseFloat(avaliacaoInicial.altura) / 100;
      if (peso && altura) {
        novoAcompanhamento[index].imc = (peso / (altura * altura)).toFixed(2);
      }
    }

    setAcompanhamento(novoAcompanhamento);
  };

  const exportarParaExcel = () => {
    // Criar workbook
    const wb = XLSX.utils.book_new();

    // Aba 1: Dados do Paciente
    const dadosPaciente = [
      ['FICHA DE ACOMPANHAMENTO NUTRICIONAL'],
      ['Nutricionista: Paula Amaral'],
      [],
      ['DADOS DO PACIENTE'],
      ['Nome:', paciente.nome],
      ['Data de Nascimento:', paciente.dataNascimento],
      ['Sexo:', paciente.sexo],
      ['Telefone:', paciente.telefone],
      ['Email:', paciente.email],
      ['Profissão:', paciente.profissao],
      ['Objetivo Principal:', paciente.objetivo],
      ['Restrições Alimentares:', paciente.restricoes],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(dadosPaciente);
    XLSX.utils.book_append_sheet(wb, ws1, 'Dados do Paciente');

    // Aba 2: Avaliação Inicial
    const avaliacaoData = [
      ['AVALIAÇÃO ANTROPOMÉTRICA INICIAL'],
      [],
      ['Data:', avaliacaoInicial.data],
      ['Peso (kg):', avaliacaoInicial.peso],
      ['Altura (cm):', avaliacaoInicial.altura],
      ['IMC:', calcularIMC(), classificarIMC(parseFloat(calcularIMC()))],
      ['RCQ:', calcularRCQ()],
      [],
      ['CIRCUNFERÊNCIAS (cm)'],
      ['Cintura:', avaliacaoInicial.circCintura],
      ['Quadril:', avaliacaoInicial.circQuadril],
      ['Braço:', avaliacaoInicial.circBraco],
      ['Coxa:', avaliacaoInicial.circCoxa],
      ['Panturrilha:', avaliacaoInicial.circPanturrilha],
      [],
      ['COMPOSIÇÃO CORPORAL'],
      ['% Gordura:', avaliacaoInicial.percentualGordura],
      ['Massa Magra (kg):', avaliacaoInicial.massaMagra],
      ['Massa Gorda (kg):', avaliacaoInicial.massaGorda],
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(avaliacaoData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Avaliação Inicial');

    // Aba 3: Bioimpedância
    const bioimpedanciaData = [
      ['ANÁLISE DE BIOIMPEDÂNCIA'],
      [],
      ['Data do Exame:', bioimpedancia.data],
      ['Peso (kg):', bioimpedancia.peso],
      ['Altura (cm):', bioimpedancia.altura],
      ['IMC:', bioimpedancia.imc],
      [],
      ['METABOLISMO'],
      ['TMB (kcal/dia):', bioimpedancia.tmb],
      [],
      ['COMPOSIÇÃO CORPORAL'],
      ['% Gordura Corporal:', bioimpedancia.percentualGordura],
      ['Massa de Gordura (kg):', bioimpedancia.massaGordura],
      ['Massa Magra (kg):', bioimpedancia.massaMagra],
      ['Massa Muscular (kg):', bioimpedancia.massaMuscular],
      ['Proteínas (kg):', bioimpedancia.proteinas],
      ['Minerais (kg):', bioimpedancia.minerais],
      [],
      ['ÁGUA CORPORAL'],
      ['Água Total (%):', bioimpedancia.aguaTotal],
      ['Água Intracelular (%):', bioimpedancia.aguaIntracelular],
      ['Água Extracelular (%):', bioimpedancia.aguaExtracelular],
      [],
      ['ANÁLISES AVANÇADAS'],
      ['Gordura Visceral (nível):', bioimpedancia.gorduraVisceral],
      ['Ângulo de Fase (°):', bioimpedancia.anguloFase],
      ['Impedância (Ohms):', bioimpedancia.impedancia],
      [],
      ['Observações:', bioimpedancia.observacoes],
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(bioimpedanciaData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Bioimpedância');

    // Aba 4: Anamnese
    const anamneseData = [
      ['ANAMNESE ALIMENTAR E CLÍNICA'],
      [],
      ['RECORDATÓRIO ALIMENTAR 24H'],
      ['Café da Manhã - Horário:', anamnese.cafeManhaHorario],
      ['Café da Manhã - Alimentos:', anamnese.cafeManhaAlimentos],
      ['Lanche da Manhã:', anamnese.lancheManha],
      ['Almoço - Horário:', anamnese.almocoHorario],
      ['Almoço - Alimentos:', anamnese.almocoAlimentos],
      ['Lanche da Tarde:', anamnese.lancheTarde],
      ['Jantar - Horário:', anamnese.jantarHorario],
      ['Jantar - Alimentos:', anamnese.jantarAlimentos],
      ['Ceia:', anamnese.ceia],
      [],
      ['HÁBITOS DE VIDA'],
      ['Ingestão de Água (L/dia):', anamnese.ingestaoAgua],
      ['Atividade Física:', anamnese.atividadeFisica],
      ['Frequência da Atividade:', anamnese.frequenciaAtividade],
      ['Qualidade do Sono:', anamnese.sono],
      ['Funcionamento Intestinal:', anamnese.intestino],
      ['Nível de Estresse:', anamnese.nivelEstresse],
      [],
      ['HISTÓRICO CLÍNICO'],
      ['Medicamentos em Uso:', anamnese.medicamentos],
      ['Patologias:', anamnese.patologias],
      ['Histórico de Peso:', anamnese.historicoPeso],
      ['Histórico Familiar:', anamnese.historicoFamiliar],
    ];
    const ws4 = XLSX.utils.aoa_to_sheet(anamneseData);
    XLSX.utils.book_append_sheet(wb, ws4, 'Anamnese');

    // Aba 5: Acompanhamento
    const acompanhamentoData = [
      ['ACOMPANHAMENTO MENSAL'],
      [],
      ['#', 'Data', 'Peso (kg)', 'IMC', 'Circ. Cintura (cm)', 'Circ. Quadril (cm)', '% Gordura', 'Observações']
    ];
    acompanhamento.forEach((consulta, i) => {
      acompanhamentoData.push([
        i + 1,
        consulta.data,
        consulta.peso,
        consulta.imc,
        consulta.circCintura,
        consulta.circQuadril,
        consulta.percentualGordura,
        consulta.observacoes
      ]);
    });
    const ws5 = XLSX.utils.aoa_to_sheet(acompanhamentoData);
    XLSX.utils.book_append_sheet(wb, ws5, 'Acompanhamento');

    // Aba 6: Plano Alimentar
    const planoData = [
      ['PLANO ALIMENTAR INDIVIDUALIZADO'],
      [],
      ['PRESCRIÇÃO DIETÉTICA'],
      ['Objetivo Clínico:', planoAlimentar.objetivoClinico],
      ['VET (kcal/dia):', planoAlimentar.vet],
      ['CHO (g):', planoAlimentar.cho],
      ['PTN (g):', planoAlimentar.ptn],
      ['LIP (g):', planoAlimentar.lip],
      [],
      ['DISTRIBUIÇÃO DAS REFEIÇÕES'],
      ['Refeição', 'Horário', 'Alimentos e Quantidades']
    ];
    planoAlimentar.refeicoes.forEach(refeicao => {
      planoData.push([refeicao.nome, refeicao.horario, refeicao.alimentos]);
    });
    planoData.push([]);
    planoData.push(['Observações:', planoAlimentar.observacoes]);
    const ws6 = XLSX.utils.aoa_to_sheet(planoData);
    XLSX.utils.book_append_sheet(wb, ws6, 'Plano Alimentar');

    // Gerar e baixar arquivo
    XLSX.writeFile(wb, `Ficha_${paciente.nome || 'Paciente'}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportarPlanoParaPDF = () => {
    try {
      const doc = new jsPDF();

    // Título
    doc.setFontSize(20);
    doc.setTextColor(20, 184, 166);
    doc.text('PLANO ALIMENTAR INDIVIDUALIZADO', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Nutricionista Paula Amaral', 105, 28, { align: 'center' });

    // Dados do Paciente
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Paciente: ${paciente.nome}`, 20, 40);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 46);

    // Linha divisória
    doc.setDrawColor(20, 184, 166);
    doc.line(20, 50, 190, 50);

    // Prescrição Dietética
    let y = 58;
    doc.setFontSize(14);
    doc.setTextColor(20, 184, 166);
    doc.text('PRESCRIÇÃO DIETÉTICA', 20, y);

    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    if (planoAlimentar.objetivoClinico) {
      doc.text(`Objetivo: ${planoAlimentar.objetivoClinico}`, 20, y);
      y += 6;
    }

    if (planoAlimentar.vet || planoAlimentar.cho || planoAlimentar.ptn || planoAlimentar.lip) {
      doc.text(`VET: ${planoAlimentar.vet} kcal/dia | CHO: ${planoAlimentar.cho}g | PTN: ${planoAlimentar.ptn}g | LIP: ${planoAlimentar.lip}g`, 20, y);
      y += 10;
    }

    // Distribuição das Refeições
    doc.setFontSize(14);
    doc.setTextColor(20, 184, 166);
    doc.text('DISTRIBUIÇÃO DAS REFEIÇÕES', 20, y);
    y += 8;

    // Tabela de refeições
    const refeicoesData = planoAlimentar.refeicoes.map(ref => [
      ref.nome,
      ref.horario,
      ref.alimentos || '-'
    ]);

    // Desenhar tabela manualmente
    doc.setFontSize(9);
    refeicoesData.forEach((ref, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFillColor(index % 2 === 0 ? 240 : 255, 240, 240);
      doc.rect(20, y - 4, 170, 8, 'F');
      doc.text(ref[0], 22, y);
      doc.text(ref[1], 90, y);
      doc.text(ref[2].substring(0, 50), 120, y);
      y += 8;
    });

    // Observações
    if (planoAlimentar.observacoes) {
      y += 10;
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(12);
      doc.setTextColor(20, 184, 166);
      doc.text('ORIENTAÇÕES GERAIS', 20, y);

      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      const splitText = doc.splitTextToSize(planoAlimentar.observacoes, 170);
      doc.text(splitText, 20, y + 6);
    }

    // Rodapé
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Este plano alimentar é individual e não deve ser compartilhado.', 105, 285, { align: 'center' });
      doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
    }

      // Salvar PDF
      doc.save(`Plano_Alimentar_${paciente.nome || 'Paciente'}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Por favor, verifique se todos os campos estão preenchidos.');
    }
  };

  const imc = calcularIMC();
  const rcq = calcularRCQ();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Sistema Profissional de Nutrição</h1>
            <p className="text-teal-100">Nutricionista Paula Amaral - Acompanhamento Mensal Completo</p>
          </div>

          {/* Tabs */}
          <div className="flex justify-between items-center border-b bg-gray-50">
            <div className="flex overflow-x-auto">
              {[
                { id: 'cadastro', label: 'Cadastro', icon: User },
                { id: 'avaliacao', label: 'Avaliação Inicial', icon: Activity },
                { id: 'bioimpedancia', label: 'Bioimpedância', icon: Activity },
                { id: 'anamnese', label: 'Anamnese', icon: FileText },
                { id: 'acompanhamento', label: 'Acompanhamento', icon: Calendar },
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
            <button
              onClick={exportarParaExcel}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 m-2 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg font-semibold whitespace-nowrap"
            >
              <Download size={20} />
              Exportar Tudo (Excel)
            </button>
          </div>

          <div className="p-8">
            {/* Cadastro do Paciente */}
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

            {/* Avaliação Inicial */}
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
                    <div className="w-full px-4 py-3 bg-teal-50 border border-teal-200 rounded-lg font-semibold text-teal-700">
                      {imc}
                      {imc !== '-' && <span className="text-xs ml-2">({classificarIMC(parseFloat(imc))})</span>}
                    </div>
                  </div>
                </div>

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
                      <div className="w-full px-4 py-2 bg-teal-50 border border-teal-200 rounded-lg font-semibold text-teal-700">
                        {rcq}
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
              </div>
            )}

            {/* Bioimpedância */}
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Altura (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={bioimpedancia.altura}
                      onChange={(e) => setBioimpedancia({...bioimpedancia, altura: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">IMC</label>
                    <input
                      type="number"
                      step="0.1"
                      value={bioimpedancia.imc}
                      onChange={(e) => setBioimpedancia({...bioimpedancia, imc: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Massa de Gordura (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={bioimpedancia.massaGordura}
                        onChange={(e) => setBioimpedancia({...bioimpedancia, massaGordura: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Massa Magra (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={bioimpedancia.massaMagra}
                        onChange={(e) => setBioimpedancia({...bioimpedancia, massaMagra: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Massa Muscular (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={bioimpedancia.massaMuscular}
                        onChange={(e) => setBioimpedancia({...bioimpedancia, massaMuscular: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Proteínas (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={bioimpedancia.proteinas}
                        onChange={(e) => setBioimpedancia({...bioimpedancia, proteinas: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minerais (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={bioimpedancia.minerais}
                        onChange={(e) => setBioimpedancia({...bioimpedancia, minerais: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Água Intracelular (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={bioimpedancia.aguaIntracelular}
                        onChange={(e) => setBioimpedancia({...bioimpedancia, aguaIntracelular: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Água Extracelular (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={bioimpedancia.aguaExtracelular}
                        onChange={(e) => setBioimpedancia({...bioimpedancia, aguaExtracelular: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ângulo de Fase (°)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={bioimpedancia.anguloFase}
                        onChange={(e) => setBioimpedancia({...bioimpedancia, anguloFase: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Impedância (Ohms)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={bioimpedancia.impedancia}
                        onChange={(e) => setBioimpedancia({...bioimpedancia, impedancia: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observações Clínicas</label>
                  <textarea
                    value={bioimpedancia.observacoes}
                    onChange={(e) => setBioimpedancia({...bioimpedancia, observacoes: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows="4"
                    placeholder="Registre aqui observações sobre os resultados da bioimpedância..."
                  />
                </div>
              </div>
            )}

            {/* Anamnese Alimentar */}
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Alimentos / Bebidas</label>
                        <input
                          type="text"
                          value={anamnese.cafeManhaAlimentos}
                          onChange={(e) => setAnamnese({...anamnese, cafeManhaAlimentos: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Alimentos / Bebidas</label>
                        <input
                          type="text"
                          value={anamnese.almocoAlimentos}
                          onChange={(e) => setAnamnese({...anamnese, almocoAlimentos: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Alimentos / Bebidas</label>
                        <input
                          type="text"
                          value={anamnese.jantarAlimentos}
                          onChange={(e) => setAnamnese({...anamnese, jantarAlimentos: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Ex: 2 litros"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Atividade Física</label>
                      <input
                        type="text"
                        value={anamnese.atividadeFisica}
                        onChange={(e) => setAnamnese({...anamnese, atividadeFisica: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Ex: Caminhada, musculação..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Frequência da Atividade</label>
                      <input
                        type="text"
                        value={anamnese.frequenciaAtividade}
                        onChange={(e) => setAnamnese({...anamnese, frequenciaAtividade: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Ex: 3x por semana"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Qualidade do Sono</label>
                      <input
                        type="text"
                        value={anamnese.sono}
                        onChange={(e) => setAnamnese({...anamnese, sono: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Ex: 7 horas por noite, acorda durante a noite..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Funcionamento Intestinal</label>
                      <input
                        type="text"
                        value={anamnese.intestino}
                        onChange={(e) => setAnamnese({...anamnese, intestino: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Ex: Regular, diário, constipação..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nível de Estresse</label>
                      <select
                        value={anamnese.nivelEstresse}
                        onChange={(e) => setAnamnese({...anamnese, nivelEstresse: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        rows="2"
                        placeholder="Liste os medicamentos e dosagens..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Patologias / Doenças Diagnosticadas</label>
                      <textarea
                        value={anamnese.patologias}
                        onChange={(e) => setAnamnese({...anamnese, patologias: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        rows="2"
                        placeholder="Ex: Diabetes, hipertensão, hipotireoidismo..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Histórico de Peso</label>
                      <textarea
                        value={anamnese.historicoPeso}
                        onChange={(e) => setAnamnese({...anamnese, historicoPeso: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        rows="2"
                        placeholder="Peso máximo, mínimo, variações ao longo da vida..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Histórico Familiar</label>
                      <textarea
                        value={anamnese.historicoFamiliar}
                        onChange={(e) => setAnamnese({...anamnese, historicoFamiliar: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        rows="2"
                        placeholder="Doenças na família (diabetes, obesidade, câncer, etc)..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Acompanhamento Mensal */}
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
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Peso (kg)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={consulta.peso}
                              onChange={(e) => atualizarConsulta(index, 'peso', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Circunf. Quadril (cm)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={consulta.circQuadril}
                              onChange={(e) => atualizarConsulta(index, 'circQuadril', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">% Gordura</label>
                            <input
                              type="number"
                              step="0.1"
                              value={consulta.percentualGordura}
                              onChange={(e) => atualizarConsulta(index, 'percentualGordura', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                          <textarea
                            value={consulta.observacoes}
                            onChange={(e) => atualizarConsulta(index, 'observacoes', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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

            {/* Plano Alimentar */}
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                        value={planoAlimentar.vet}
                        onChange={(e) => setPlanoAlimentar({...planoAlimentar, vet: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="1800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CHO (g)</label>
                      <input
                        type="number"
                        value={planoAlimentar.cho}
                        onChange={(e) => setPlanoAlimentar({...planoAlimentar, cho: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="225"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PTN (g)</label>
                      <input
                        type="number"
                        value={planoAlimentar.ptn}
                        onChange={(e) => setPlanoAlimentar({...planoAlimentar, ptn: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="90"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">LIP (g)</label>
                      <input
                        type="number"
                        value={planoAlimentar.lip}
                        onChange={(e) => setPlanoAlimentar({...planoAlimentar, lip: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="60"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 text-lg">Distribuição das Refeições</h3>
                  {planoAlimentar.refeicoes.map((refeicao, index) => (
                    <div key={index} className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Refeição</label>
                          <input
                            type="text"
                            value={refeicao.nome}
                            onChange={(e) => {
                              const novasRefeicoes = [...planoAlimentar.refeicoes];
                              novasRefeicoes[index].nome = e.target.value;
                              setPlanoAlimentar({...planoAlimentar, refeicoes: novasRefeicoes});
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Horário</label>
                          <input
                            type="text"
                            value={refeicao.horario}
                            onChange={(e) => {
                              const novasRefeicoes = [...planoAlimentar.refeicoes];
                              novasRefeicoes[index].horario = e.target.value;
                              setPlanoAlimentar({...planoAlimentar, refeicoes: novasRefeicoes});
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Alimentos e Quantidades</label>
                          <textarea
                            value={refeicao.alimentos}
                            onChange={(e) => {
                              const novasRefeicoes = [...planoAlimentar.refeicoes];
                              novasRefeicoes[index].alimentos = e.target.value;
                              setPlanoAlimentar({...planoAlimentar, refeicoes: novasRefeicoes});
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            rows="2"
                            placeholder="Ex: 1 fatia de pão integral, 1 ovo, 1 fruta..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observações / Orientações Gerais</label>
                  <textarea
                    value={planoAlimentar.observacoes}
                    onChange={(e) => setPlanoAlimentar({...planoAlimentar, observacoes: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
  );
};

export default App;
