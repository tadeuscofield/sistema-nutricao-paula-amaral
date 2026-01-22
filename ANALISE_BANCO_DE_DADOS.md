# Análise de Bancos de Dados para Sistema de Nutrição Paula Amaral

## Comparação de Opções Gratuitas

### 1. **Supabase (PostgreSQL)** ⭐ RECOMENDADO

**Por que é a melhor opção:**
- PostgreSQL completo e robusto
- API REST automática
- Autenticação integrada
- Armazenamento de arquivos
- Realtime (tempo real)
- Interface amigável

**Plano Gratuito:**
- ✅ **500 MB de banco de dados**
- ✅ **1 GB de armazenamento de arquivos**
- ✅ **2 GB de transferência/mês**
- ✅ **50.000 usuários ativos/mês**
- ✅ Autenticação social gratuita
- ✅ Backups automáticos (7 dias)

**Capacidade Estimada:**
```
Estimativa por paciente:
- Dados cadastrais: ~2 KB
- Avaliações: ~3 KB
- Planos alimentares: ~5 KB
- Acompanhamentos (10 consultas): ~2 KB
- Total por paciente: ~12 KB

CAPACIDADE: 500 MB ÷ 12 KB = ~41.600 pacientes! 🎉

Realista (com margem de segurança):
- 10.000 a 15.000 pacientes SEM PROBLEMA
```

**Quando migrar para pago:**
- **$25/mês** (Pro) - 8 GB de banco + 100 GB armazenamento
- Ideal quando passar de 10.000 pacientes ou precisar de mais backups

---

### 2. **Firebase (Firestore)** - Google

**Vantagens:**
- NoSQL (flexível)
- Muito fácil de implementar
- SDK React excelente
- Autenticação Google integrada
- Hosting gratuito

**Plano Gratuito:**
- ✅ **1 GB de armazenamento**
- ✅ **10 GB/mês de transferência**
- ✅ **50.000 leituras/dia**
- ✅ **20.000 escritas/dia**
- ✅ **20.000 exclusões/dia**

**Capacidade Estimada:**
```
Com 1 GB de armazenamento:
- ~83.000 pacientes teóricos
- Realista: 20.000 a 30.000 pacientes

LIMITAÇÃO: Operações diárias
- Com 100 pacientes/dia fazendo login + consultas
- ~50 operações por usuário/dia
- Limite: 50.000 leituras = ~1.000 acessos/dia
- SUFICIENTE para consultório médio
```

**Quando migrar para pago:**
- Pay-as-you-go (paga pelo que usar)
- ~$0.18 por 100.000 leituras
- Geralmente fica abaixo de $10/mês para pequenos consultórios

---

### 3. **PlanetScale (MySQL)** - Serverless

**Vantagens:**
- MySQL serverless
- Branching de banco (como Git!)
- Zero downtime deploys
- Escala automaticamente

**Plano Gratuito (ATUALIZADO 2024):**
- ⚠️ **Mudou recentemente** - plano gratuito mais limitado
- ✅ **1 banco de dados**
- ✅ **5 GB de armazenamento**
- ✅ **1 bilhão de leituras/mês**
- ⚠️ Requer cartão de crédito (mas não cobra)

**Capacidade Estimada:**
```
Com 5 GB:
- ~416.000 pacientes teóricos
- Realista: 50.000+ pacientes facilmente
```

**Desvantagem:**
- Mais complexo de configurar
- Requer backend Node.js/API

---

### 4. **Neon (PostgreSQL)** - Serverless

**Vantagens:**
- PostgreSQL serverless moderno
- Branching instantâneo
- Escala para zero (economia)
- Muito rápido

**Plano Gratuito:**
- ✅ **512 MB de armazenamento**
- ✅ **3 GB de dados transferidos/mês**
- ✅ Projetos ilimitados
- ✅ Branching ilimitado

**Capacidade Estimada:**
```
Com 512 MB:
- ~42.000 pacientes
- Realista: 10.000 a 15.000 pacientes
```

---

### 5. **MongoDB Atlas**

**Vantagens:**
- NoSQL popular
- Bom para dados não estruturados
- Fácil de escalar

**Plano Gratuito (M0):**
- ✅ **512 MB de armazenamento**
- ✅ **Shared cluster**
- ✅ Backups limitados

**Capacidade Estimada:**
```
Com 512 MB:
- ~42.000 pacientes
- Realista: 10.000 pacientes
```

**Desvantagem:**
- Mais lento que PostgreSQL para queries relacionais
- Menos recursos no free tier

---

## Comparação Rápida

| Banco de Dados | Armazenamento | Pacientes (Real) | Facilidade | Recursos Extras |
|----------------|---------------|------------------|------------|-----------------|
| **Supabase** ⭐ | 500 MB | 10k-15k | ⭐⭐⭐⭐⭐ | Auth, Storage, Realtime |
| Firebase | 1 GB | 20k-30k | ⭐⭐⭐⭐⭐ | Auth, Hosting, Analytics |
| PlanetScale | 5 GB | 50k+ | ⭐⭐⭐ | Branching, MySQL |
| Neon | 512 MB | 10k-15k | ⭐⭐⭐⭐ | Serverless, Branching |
| MongoDB Atlas | 512 MB | 10k | ⭐⭐⭐ | NoSQL flexível |

---

## RECOMENDAÇÃO FINAL: **Supabase** 🏆

### Por que Supabase é perfeito para Paula Amaral:

#### ✅ Vantagens Técnicas
1. **PostgreSQL completo** - Banco robusto e confiável
2. **API REST automática** - Não precisa criar backend do zero
3. **Row Level Security (RLS)** - Segurança por paciente
4. **Autenticação pronta** - Login, senha, recuperação
5. **Storage integrado** - Para guardar fotos de evolução
6. **Realtime** - Atualização automática (se precisar no futuro)

#### ✅ Vantagens Práticas
1. **Muito fácil de implementar** - SDK React oficial
2. **Dashboard visual bonito** - Paula pode ver os dados
3. **Backups automáticos** - 7 dias de histórico
4. **SQL direto** - Fácil fazer relatórios e análises
5. **Comunidade ativa** - Muitos tutoriais

#### ✅ Vantagens Econômicas
1. **Gratuito até 10.000+ pacientes**
2. **Sem cartão de crédito** no plano free
3. **Migração suave** - Quando crescer, só $25/mês
4. **Sem surpresas** - Limites claros

---

## Exemplo de Estrutura no Supabase

### Tabelas Recomendadas:

```sql
-- Tabela de Nutricionistas
CREATE TABLE nutricionistas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  crn TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Pacientes
CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nutricionista_id UUID REFERENCES nutricionistas(id),
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  data_nascimento DATE,
  sexo TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  arquivado BOOLEAN DEFAULT FALSE
);

-- Tabela de Avaliações
CREATE TABLE avaliacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  peso DECIMAL(5,2),
  altura DECIMAL(5,2),
  imc DECIMAL(4,2),
  circunferencia_cintura DECIMAL(5,2),
  circunferencia_quadril DECIMAL(5,2),
  percentual_gordura DECIMAL(4,2),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Planos Alimentares
CREATE TABLE planos_alimentares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  objetivo_clinico TEXT,
  vet INTEGER,
  cho INTEGER,
  ptn INTEGER,
  lip INTEGER,
  cafe_manha TEXT,
  lanche_manha TEXT,
  almoco TEXT,
  lanche_tarde TEXT,
  jantar TEXT,
  ceia TEXT,
  orientacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Anamnese
CREATE TABLE anamneses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  queixa_principal TEXT,
  objetivo TEXT,
  restricoes TEXT,
  alergias TEXT,
  intolerancia TEXT,
  aversoes TEXT,
  preferencias TEXT,
  rotina_alimentar TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_pacientes_nutricionista ON pacientes(nutricionista_id);
CREATE INDEX idx_avaliacoes_paciente ON avaliacoes(paciente_id);
CREATE INDEX idx_planos_paciente ON planos_alimentares(paciente_id);
```

---

## Estimativa de Custos Futuros

### Cenário 1: Consultório Pequeno (até 100 pacientes)
- **Banco**: Supabase Free
- **Custo**: $0/mês ✅

### Cenário 2: Consultório Médio (100-500 pacientes)
- **Banco**: Supabase Free
- **Custo**: $0/mês ✅

### Cenário 3: Consultório Grande (500-2000 pacientes)
- **Banco**: Supabase Free
- **Custo**: $0/mês ✅

### Cenário 4: Clínica Médica (2000-10000 pacientes)
- **Banco**: Supabase Free
- **Custo**: $0/mês ✅

### Cenário 5: Clínica Grande (10000+ pacientes)
- **Banco**: Supabase Pro
- **Custo**: $25/mês (R$ 125/mês) 💰

---

## Alternativas por Caso de Uso

### Se priorizar: **Máxima Simplicidade**
→ **Firebase** (Google, super fácil, muitos tutoriais)

### Se priorizar: **Máximo Armazenamento Grátis**
→ **PlanetScale** (5 GB free, mas requer backend)

### Se priorizar: **SQL + Recursos Modernos**
→ **Supabase** ⭐ (melhor equilíbrio)

### Se priorizar: **NoSQL + Flexibilidade**
→ **MongoDB Atlas** (bom para dados não estruturados)

---

## Implementação Rápida com Supabase

### 1. Criar Projeto (5 minutos)
```bash
# Criar conta em: https://supabase.com
# Criar novo projeto
# Copiar URL + API Key
```

### 2. Instalar Dependências
```bash
npm install @supabase/supabase-js
```

### 3. Configurar (1 arquivo)
```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://seu-projeto.supabase.co'
const supabaseKey = 'sua-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### 4. Usar no React
```javascript
// Exemplo: Buscar pacientes
const { data, error } = await supabase
  .from('pacientes')
  .select('*')
  .eq('nutricionista_id', userId)

// Exemplo: Criar paciente
const { data, error } = await supabase
  .from('pacientes')
  .insert({ nome: 'João Silva', email: 'joao@email.com' })

// Exemplo: Atualizar
const { data, error } = await supabase
  .from('pacientes')
  .update({ peso: 75.5 })
  .eq('id', pacienteId)
```

---

## Conclusão

Para o sistema da **Paula Amaral**, recomendo fortemente o **Supabase**:

✅ **Gratuito para 10.000+ pacientes**
✅ **Fácil de implementar**
✅ **PostgreSQL robusto**
✅ **Recursos modernos (auth, storage, realtime)**
✅ **Migração suave quando crescer**
✅ **Dashboard visual**
✅ **Backups automáticos**

**Paula pode começar hoje gratuitamente e só pagar quando tiver milhares de pacientes!** 🎉

---

## Próximos Passos

1. Criar conta no Supabase
2. Criar projeto
3. Executar SQL das tabelas
4. Integrar no sistema React atual
5. Migrar dados do LocalStorage (opcional)
6. Configurar autenticação

**Tempo estimado de implementação: 4-8 horas de desenvolvimento** ⏱️
