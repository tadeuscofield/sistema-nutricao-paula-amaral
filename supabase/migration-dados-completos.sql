-- Adicionar coluna dados_completos para armazenar JSON com todos os dados do paciente
-- Isso permite manter compatibilidade com a estrutura antiga do sistema

ALTER TABLE pacientes
ADD COLUMN IF NOT EXISTS dados_completos JSONB DEFAULT NULL;

COMMENT ON COLUMN pacientes.dados_completos IS 'Dados completos do paciente em formato JSON (avaliações, anamnese, plano alimentar, etc.)';
