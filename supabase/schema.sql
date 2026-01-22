-- =====================================================
-- SISTEMA DE NUTRIÇÃO PAULA AMARAL
-- Schema Multi-Tenant com Row Level Security (RLS)
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA: nutricionistas
-- Armazena os profissionais (SEUS CLIENTES)
-- =====================================================
CREATE TABLE nutricionistas (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  crn TEXT,
  telefone TEXT,
  foto_url TEXT,

  -- Planos e controle comercial
  plano TEXT DEFAULT 'basico' CHECK (plano IN ('basico', 'profissional', 'clinica')),
  limite_pacientes INTEGER DEFAULT 100,
  ativo BOOLEAN DEFAULT TRUE,
  data_expiracao DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),

  -- Personalização (para white label futuro)
  cor_primaria TEXT DEFAULT '#14b8a6',
  cor_secundaria TEXT DEFAULT '#10b981',
  logo_url TEXT,

  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_nutricionistas_email ON nutricionistas(email);
CREATE INDEX idx_nutricionistas_ativo ON nutricionistas(ativo);

-- =====================================================
-- TABELA: pacientes
-- Armazena os pacientes de cada nutricionista
-- =====================================================
CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nutricionista_id UUID NOT NULL REFERENCES nutricionistas(id) ON DELETE CASCADE,

  -- Dados pessoais
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  cpf TEXT,
  data_nascimento DATE,
  sexo TEXT CHECK (sexo IN ('Masculino', 'Feminino', 'Outro')),
  foto_url TEXT,

  -- Endereço
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,

  -- Dados profissionais/ocupação
  profissao TEXT,

  -- Status
  arquivado BOOLEAN DEFAULT FALSE,

  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_pacientes_nutricionista ON pacientes(nutricionista_id);
CREATE INDEX idx_pacientes_nome ON pacientes(nome);
CREATE INDEX idx_pacientes_arquivado ON pacientes(arquivado);

-- =====================================================
-- TABELA: avaliacoes_antropometricas
-- Avaliações físicas dos pacientes
-- =====================================================
CREATE TABLE avaliacoes_antropometricas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  nutricionista_id UUID NOT NULL REFERENCES nutricionistas(id) ON DELETE CASCADE,

  data DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Medidas básicas
  peso DECIMAL(5,2),
  altura DECIMAL(5,2),
  imc DECIMAL(4,2),

  -- Circunferências
  circunferencia_cintura DECIMAL(5,2),
  circunferencia_quadril DECIMAL(5,2),
  circunferencia_braco DECIMAL(5,2),
  circunferencia_coxa DECIMAL(5,2),
  circunferencia_panturrilha DECIMAL(5,2),
  rcq DECIMAL(4,2),

  -- Composição corporal
  percentual_gordura DECIMAL(4,2),
  massa_gorda DECIMAL(5,2),
  massa_magra DECIMAL(5,2),
  percentual_musculo DECIMAL(4,2),

  -- Bioimpedância
  agua_corporal DECIMAL(4,2),
  gordura_visceral DECIMAL(4,2),
  taxa_metabolica DECIMAL(6,2),

  -- Adipometria (dobras cutâneas)
  dobra_triceps DECIMAL(4,1),
  dobra_biceps DECIMAL(4,1),
  dobra_subescapular DECIMAL(4,1),
  dobra_suprailiaca DECIMAL(4,1),
  dobra_abdominal DECIMAL(4,1),
  dobra_coxa DECIMAL(4,1),
  dobra_panturrilha DECIMAL(4,1),

  -- Pressão arterial
  pressao_sistolica INTEGER,
  pressao_diastolica INTEGER,

  -- Observações
  observacoes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_avaliacoes_paciente ON avaliacoes_antropometricas(paciente_id);
CREATE INDEX idx_avaliacoes_nutricionista ON avaliacoes_antropometricas(nutricionista_id);
CREATE INDEX idx_avaliacoes_data ON avaliacoes_antropometricas(data DESC);

-- =====================================================
-- TABELA: anamneses
-- Histórico e questionário nutricional
-- =====================================================
CREATE TABLE anamneses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  nutricionista_id UUID NOT NULL REFERENCES nutricionistas(id) ON DELETE CASCADE,

  data DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Queixas e objetivos
  queixa_principal TEXT,
  objetivo TEXT,
  motivo_consulta TEXT,

  -- Restrições alimentares
  restricoes TEXT,
  alergias TEXT,
  intolerancia TEXT,
  aversoes TEXT,
  preferencias TEXT,

  -- Hábitos alimentares
  rotina_alimentar TEXT,
  numero_refeicoes INTEGER,
  consome_agua TEXT,
  quantidade_agua_ml INTEGER,
  bebidas_alcoolicas TEXT,
  frequencia_alcool TEXT,

  -- Atividade física
  atividade_fisica TEXT,
  tipo_atividade TEXT,
  frequencia_atividade TEXT,

  -- Histórico médico
  medicamentos TEXT,
  suplementos TEXT,
  patologias TEXT,
  cirurgias TEXT,

  -- Histórico familiar
  historico_familiar TEXT,

  -- Histórico de peso
  historico_peso TEXT,
  peso_maximo DECIMAL(5,2),
  peso_minimo DECIMAL(5,2),

  -- Aspectos psicológicos
  sono TEXT,
  qualidade_sono TEXT,
  nivel_estresse TEXT,
  ansiedade TEXT,

  -- Aspectos digestivos
  funcionamento_intestinal TEXT,
  frequencia_intestinal TEXT,

  -- Para mulheres
  menstruacao TEXT,
  ciclo_menstrual TEXT,
  sintomas_pms TEXT,
  gestante BOOLEAN,
  lactante BOOLEAN,

  -- Observações gerais
  observacoes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_anamneses_paciente ON anamneses(paciente_id);
CREATE INDEX idx_anamneses_nutricionista ON anamneses(nutricionista_id);

-- =====================================================
-- TABELA: planos_alimentares
-- Prescrições nutricionais
-- =====================================================
CREATE TABLE planos_alimentares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  nutricionista_id UUID NOT NULL REFERENCES nutricionistas(id) ON DELETE CASCADE,

  data DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Objetivo e prescrição
  objetivo_clinico TEXT,

  -- Prescrição dietética (VET e macronutrientes)
  vet INTEGER, -- Valor Energético Total (kcal)
  cho INTEGER, -- Carboidratos (g)
  ptn INTEGER, -- Proteínas (g)
  lip INTEGER, -- Lipídeos (g)

  -- Refeições
  cafe_manha TEXT,
  lanche_manha TEXT,
  almoco TEXT,
  lanche_tarde TEXT,
  jantar TEXT,
  ceia TEXT,

  -- Orientações
  orientacoes TEXT,
  observacoes TEXT,

  -- Controle
  ativo BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_planos_paciente ON planos_alimentares(paciente_id);
CREATE INDEX idx_planos_nutricionista ON planos_alimentares(nutricionista_id);
CREATE INDEX idx_planos_ativo ON planos_alimentares(ativo);

-- =====================================================
-- TABELA: acompanhamentos
-- Registro de consultas e evolução
-- =====================================================
CREATE TABLE acompanhamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  nutricionista_id UUID NOT NULL REFERENCES nutricionistas(id) ON DELETE CASCADE,

  data DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Dados da consulta
  tipo_consulta TEXT CHECK (tipo_consulta IN ('Inicial', 'Retorno', 'Manutenção')),

  -- Evolução
  peso DECIMAL(5,2),
  imc DECIMAL(4,2),
  percentual_gordura DECIMAL(4,2),

  -- Relato do paciente
  adesao_plano TEXT,
  dificuldades TEXT,
  evolucao_sintomas TEXT,

  -- Observações do profissional
  observacoes_profissional TEXT,
  ajustes_realizados TEXT,

  -- Próxima consulta
  data_proxima_consulta DATE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_acompanhamentos_paciente ON acompanhamentos(paciente_id);
CREATE INDEX idx_acompanhamentos_nutricionista ON acompanhamentos(nutricionista_id);
CREATE INDEX idx_acompanhamentos_data ON acompanhamentos(data DESC);

-- =====================================================
-- TABELA: arquivos
-- Armazenamento de documentos e imagens
-- =====================================================
CREATE TABLE arquivos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  nutricionista_id UUID NOT NULL REFERENCES nutricionistas(id) ON DELETE CASCADE,

  nome TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'exame', 'foto', 'documento', 'relatorio'
  mime_type TEXT,
  tamanho_bytes BIGINT,
  url TEXT NOT NULL,

  descricao TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_arquivos_paciente ON arquivos(paciente_id);
CREATE INDEX idx_arquivos_tipo ON arquivos(tipo);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - ISOLAMENTO DE DADOS
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE nutricionistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes_antropometricas ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamneses ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos_alimentares ENABLE ROW LEVEL SECURITY;
ALTER TABLE acompanhamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE arquivos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS: nutricionistas
-- =====================================================

-- Nutricionista pode ver apenas seus próprios dados
CREATE POLICY "Nutricionistas veem apenas seus dados"
  ON nutricionistas
  FOR SELECT
  USING (id = auth.uid());

-- Nutricionista pode atualizar apenas seus próprios dados
CREATE POLICY "Nutricionistas atualizam apenas seus dados"
  ON nutricionistas
  FOR UPDATE
  USING (id = auth.uid());

-- =====================================================
-- POLÍTICAS RLS: pacientes
-- =====================================================

-- Nutricionista vê apenas seus pacientes
CREATE POLICY "Nutricionistas veem apenas seus pacientes"
  ON pacientes
  FOR SELECT
  USING (nutricionista_id = auth.uid());

-- Nutricionista pode criar pacientes para si
CREATE POLICY "Nutricionistas criam pacientes para si"
  ON pacientes
  FOR INSERT
  WITH CHECK (nutricionista_id = auth.uid());

-- Nutricionista pode atualizar apenas seus pacientes
CREATE POLICY "Nutricionistas atualizam apenas seus pacientes"
  ON pacientes
  FOR UPDATE
  USING (nutricionista_id = auth.uid());

-- Nutricionista pode deletar apenas seus pacientes
CREATE POLICY "Nutricionistas deletam apenas seus pacientes"
  ON pacientes
  FOR DELETE
  USING (nutricionista_id = auth.uid());

-- =====================================================
-- POLÍTICAS RLS: avaliacoes_antropometricas
-- =====================================================

CREATE POLICY "Nutricionistas veem apenas avaliações de seus pacientes"
  ON avaliacoes_antropometricas
  FOR SELECT
  USING (nutricionista_id = auth.uid());

CREATE POLICY "Nutricionistas criam avaliações para seus pacientes"
  ON avaliacoes_antropometricas
  FOR INSERT
  WITH CHECK (nutricionista_id = auth.uid());

CREATE POLICY "Nutricionistas atualizam apenas suas avaliações"
  ON avaliacoes_antropometricas
  FOR UPDATE
  USING (nutricionista_id = auth.uid());

CREATE POLICY "Nutricionistas deletam apenas suas avaliações"
  ON avaliacoes_antropometricas
  FOR DELETE
  USING (nutricionista_id = auth.uid());

-- =====================================================
-- POLÍTICAS RLS: anamneses
-- =====================================================

CREATE POLICY "Nutricionistas veem apenas anamneses de seus pacientes"
  ON anamneses
  FOR SELECT
  USING (nutricionista_id = auth.uid());

CREATE POLICY "Nutricionistas criam anamneses para seus pacientes"
  ON anamneses
  FOR INSERT
  WITH CHECK (nutricionista_id = auth.uid());

CREATE POLICY "Nutricionistas atualizam apenas suas anamneses"
  ON anamneses
  FOR UPDATE
  USING (nutricionista_id = auth.uid());

CREATE POLICY "Nutricionistas deletam apenas suas anamneses"
  ON anamneses
  FOR DELETE
  USING (nutricionista_id = auth.uid());

-- =====================================================
-- POLÍTICAS RLS: planos_alimentares
-- =====================================================

CREATE POLICY "Nutricionistas veem apenas planos de seus pacientes"
  ON planos_alimentares
  FOR SELECT
  USING (nutricionista_id = auth.uid());

CREATE POLICY "Nutricionistas criam planos para seus pacientes"
  ON planos_alimentares
  FOR INSERT
  WITH CHECK (nutricionista_id = auth.uid());

CREATE POLICY "Nutricionistas atualizam apenas seus planos"
  ON planos_alimentares
  FOR UPDATE
  USING (nutricionista_id = auth.uid());

CREATE POLICY "Nutricionistas deletam apenas seus planos"
  ON planos_alimentares
  FOR DELETE
  USING (nutricionista_id = auth.uid());

-- =====================================================
-- POLÍTICAS RLS: acompanhamentos
-- =====================================================

CREATE POLICY "Nutricionistas veem apenas acompanhamentos de seus pacientes"
  ON acompanhamentos
  FOR SELECT
  USING (nutricionista_id = auth.uid());

CREATE POLICY "Nutricionistas criam acompanhamentos para seus pacientes"
  ON acompanhamentos
  FOR INSERT
  WITH CHECK (nutricionista_id = auth.uid());

CREATE POLICY "Nutricionistas atualizam apenas seus acompanhamentos"
  ON acompanhamentos
  FOR UPDATE
  USING (nutricionista_id = auth.uid());

CREATE POLICY "Nutricionistas deletam apenas seus acompanhamentos"
  ON acompanhamentos
  FOR DELETE
  USING (nutricionista_id = auth.uid());

-- =====================================================
-- POLÍTICAS RLS: arquivos
-- =====================================================

CREATE POLICY "Nutricionistas veem apenas arquivos de seus pacientes"
  ON arquivos
  FOR SELECT
  USING (nutricionista_id = auth.uid());

CREATE POLICY "Nutricionistas fazem upload de arquivos para seus pacientes"
  ON arquivos
  FOR INSERT
  WITH CHECK (nutricionista_id = auth.uid());

CREATE POLICY "Nutricionistas deletam apenas seus arquivos"
  ON arquivos
  FOR DELETE
  USING (nutricionista_id = auth.uid());

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_nutricionistas_updated_at
  BEFORE UPDATE ON nutricionistas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pacientes_updated_at
  BEFORE UPDATE ON pacientes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anamneses_updated_at
  BEFORE UPDATE ON anamneses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planos_updated_at
  BEFORE UPDATE ON planos_alimentares
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNÇÃO: Criar nutricionista após signup
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.nutricionistas (id, email, nome)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Nutricionista')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar nutricionista automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View: Estatísticas do nutricionista
CREATE OR REPLACE VIEW stats_nutricionista AS
SELECT
  n.id AS nutricionista_id,
  n.nome,
  n.plano,
  COUNT(DISTINCT p.id) AS total_pacientes,
  COUNT(DISTINCT CASE WHEN p.arquivado = FALSE THEN p.id END) AS pacientes_ativos,
  COUNT(DISTINCT a.id) AS total_avaliacoes,
  COUNT(DISTINCT pl.id) AS total_planos,
  n.limite_pacientes,
  n.data_expiracao
FROM nutricionistas n
LEFT JOIN pacientes p ON p.nutricionista_id = n.id
LEFT JOIN avaliacoes_antropometricas a ON a.nutricionista_id = n.id
LEFT JOIN planos_alimentares pl ON pl.nutricionista_id = n.id
GROUP BY n.id, n.nome, n.plano, n.limite_pacientes, n.data_expiracao;

-- =====================================================
-- DADOS INICIAIS (OPCIONAL - para testes)
-- =====================================================

-- Inserir planos exemplo (executar DEPOIS de criar o primeiro usuário)
-- COMENTADO - será executado manualmente após criar usuário

/*
-- Exemplo de como inserir dados de teste após criar um usuário
INSERT INTO pacientes (nutricionista_id, nome, email, telefone, data_nascimento, sexo)
VALUES
  (auth.uid(), 'João Silva', 'joao@email.com', '(21) 99999-9999', '1990-05-15', 'Masculino'),
  (auth.uid(), 'Maria Santos', 'maria@email.com', '(21) 98888-8888', '1985-08-20', 'Feminino');
*/

-- =====================================================
-- STORAGE BUCKETS (para fotos e arquivos)
-- =====================================================

-- Executar no Supabase Dashboard > Storage:
-- Criar bucket 'avatars' (público)
-- Criar bucket 'documentos' (privado)

-- Políticas de storage serão configuradas via interface

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
