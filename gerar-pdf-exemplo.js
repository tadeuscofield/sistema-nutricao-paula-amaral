const { jsPDF } = require('jspdf');
require('jspdf-autotable');
const fs = require('fs');
const path = require('path');

// Dados do paciente de exemplo
const paciente = {
  nome: 'Carlos Alberto Silva',
  dataNascimento: '1969-03-15',
  sexo: 'Masculino'
};

const planoAlimentar = {
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
};

const calcularIdade = (dataNascimento) => {
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
};

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

console.log('🚀 Gerando PDF do Plano Alimentar...\n');

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
doc.text(`Nome: ${paciente.nome}`, 20, yPos);
yPos += 6;
doc.text(`Data de Nascimento: ${new Date(paciente.dataNascimento).toLocaleDateString('pt-BR')}`, 20, yPos);
yPos += 6;
doc.text(`Idade: ${calcularIdade(paciente.dataNascimento)} anos`, 20, yPos);
yPos += 6;
doc.text(`Sexo: ${paciente.sexo}`, 20, yPos);

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
doc.text(`VET: ${planoAlimentar.prescricao.vet} kcal`, 20, yPos);
doc.text(`CHO: ${planoAlimentar.prescricao.cho} g`, 75, yPos);
doc.text(`PTN: ${planoAlimentar.prescricao.ptn} g`, 120, yPos);
doc.text(`LIP: ${planoAlimentar.prescricao.lip} g`, 165, yPos);

// REFEIÇÕES
const refeicoes = [
  { titulo: 'CAFÉ DA MANHÃ', conteudo: planoAlimentar.refeicoes.cafeManha },
  { titulo: 'LANCHE DA MANHÃ', conteudo: planoAlimentar.refeicoes.lancheManha },
  { titulo: 'ALMOÇO', conteudo: planoAlimentar.refeicoes.almoco },
  { titulo: 'LANCHE DA TARDE', conteudo: planoAlimentar.refeicoes.lancheTarde },
  { titulo: 'JANTAR', conteudo: planoAlimentar.refeicoes.jantar },
  { titulo: 'CEIA', conteudo: planoAlimentar.refeicoes.ceia }
];

refeicoes.forEach((refeicao) => {
  yPos += 10;

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

  const linhas = doc.splitTextToSize(refeicao.conteudo, 170);
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

// EVOLUÇÃO DO PACIENTE (Tabela)
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

// Dados da avaliação inicial (simulando primeira consulta)
const evolucaoData = [
  ['Inicial', new Date().toLocaleDateString('pt-BR'), '80.0 kg', '26.1', '22.5%']
];

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

// Salvar na Área de Trabalho
const desktopPath = path.join(require('os').homedir(), 'OneDrive', 'Área de Trabalho');
const filename = `Plano_Alimentar_Carlos_Silva_${new Date().toISOString().split('T')[0]}.pdf`;
const outputPath = path.join(desktopPath, filename);

doc.save(outputPath);

console.log('✅ PDF gerado com sucesso!');
console.log(`📄 Arquivo: ${filename}`);
console.log(`📁 Local: ${desktopPath}`);
console.log(`\n💪 Mensagem escolhida: "${mensagem}"`);
