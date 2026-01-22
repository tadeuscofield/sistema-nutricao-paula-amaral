-- TESTE SIMPLES - Criar apenas 1 tabela para verificar

CREATE TABLE IF NOT EXISTS teste_conexao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Se isso funcionar, podemos prosseguir com o schema completo
