# Guia Completo de Implementação - Sistema Multi-Tenant Paula Amaral

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura Criada](#estrutura-criada)
3. [Passo a Passo](#passo-a-passo)
4. [Como Usar](#como-usar)
5. [Próximas Etapas](#próximas-etapas)

---

## 🎯 Visão Geral

Criei uma **arquitetura multi-tenant completa** para o sistema de nutrição da Paula Amaral, permitindo que você venda o sistema para múltiplos nutricionistas mantendo **isolamento total de dados** através de Row Level Security (RLS).

### O que foi implementado:

✅ **Schema SQL completo** com 7 tabelas
✅ **Row Level Security (RLS)** - Isolamento automático
✅ **Autenticação Supabase** - Login, signup, recuperação
✅ **Serviços prontos** - Auth, Pacientes, CRUD
✅ **Triggers automáticos** - Criar nutricionista no signup
✅ **Views de estatísticas** - Dashboard
✅ **Storage configurado** - Fotos e documentos

---

## 📁 Estrutura Criada

```
sistema-nutricao-paula-amaral/
├── supabase/
│   ├── schema.sql                    # ✅ Schema completo do banco
│   └── SETUP_SUPABASE.md             # ✅ Guia de configuração
│
├── src/
│   ├── lib/
│   │   └── supabase.js               # ✅ Cliente Supabase configurado
│   │
│   └── services/
│       ├── auth.js                   # ✅ Serviços de autenticação
│       └── pacientes.js              # ✅ CRUD de pacientes
│
├── .env.example                      # ✅ Modelo de variáveis de ambiente
├── .gitignore                        # ✅ Atualizado (.env protegido)
│
└── DOCUMENTAÇÃO/
    ├── ANALISE_BANCO_DE_DADOS.md     # Análise de bancos
    ├── ESTRATEGIA_MULTI_CLIENTES.md  # Estratégia multi-tenant
    ├── CORRECAO_PDF_EXPLICADA.md     # Correção do PDF
    └── DEPLOY_INFO.md                # Info do deploy
```

---

## 🚀 Passo a Passo

### **ETAPA 1: Configurar Supabase** (20 minutos)

#### 1.1 Criar Conta e Projeto

1. Acesse: **https://supabase.com**
2. Faça login (GitHub ou email)
3. Crie novo projeto:
   - **Nome**: `nutricao-paula-amaral`
   - **Senha**: (anote!)
   - **Região**: South America (São Paulo)
   - **Plano**: FREE
4. Aguarde 2-3 minutos

#### 1.2 Executar Schema SQL

1. Abra **SQL Editor** no Supabase
2. Abra o arquivo: `supabase/schema.sql`
3. **Copie TODO o conteúdo** (Ctrl+A → Ctrl+C)
4. **Cole no SQL Editor**
5. Clique em **"Run"** (F5)
6. Aguarde "Success"

#### 1.3 Verificar Tabelas Criadas

No **Table Editor**, você deve ver:
- ✅ nutricionistas
- ✅ pacientes
- ✅ avaliacoes_antropometricas
- ✅ anamneses
- ✅ planos_alimentares
- ✅ acompanhamentos
- ✅ arquivos

#### 1.4 Copiar Credenciais

1. Vá em **Settings** > **API**
2. Copie:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon key**: `eyJhbGciOi...`

---

### **ETAPA 2: Configurar Projeto Local** (10 minutos)

#### 2.1 Criar arquivo .env

```bash
cd "C:\Users\tadec\OneDrive\Área de Trabalho\sistema-nutricao-paula-amaral"

# Copiar exemplo
copy .env.example .env
```

#### 2.2 Editar .env

Abra `.env` e cole suas credenciais:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2.3 Instalar Dependências

```bash
npm install @supabase/supabase-js
```

---

### **ETAPA 3: Criar Primeiro Usuário** (5 minutos)

#### 3.1 Via Supabase Dashboard

1. Vá em **Authentication** > **Users**
2. Clique em **"Add user"** > **"Create new user"**
3. Preencha:
   - **Email**: `paula@teste.com`
   - **Password**: `Paula@123`
   - **Auto Confirm**: ✅ Sim
4. Clique em "Create user"

#### 3.2 Completar Dados (SQL)

No **SQL Editor**, execute:

```sql
-- Ver ID do usuário criado
SELECT id, email FROM auth.users WHERE email = 'paula@teste.com';

-- Atualizar dados (substitua USER_ID pelo UUID acima)
UPDATE nutricionistas
SET
  nome = 'Paula do Amaral Santos',
  crn = '08100732',
  telefone = '(21) 99999-9999',
  plano = 'profissional',
  limite_pacientes = 500
WHERE id = 'USER_ID_AQUI';
```

---

### **ETAPA 4: Testar Integração** (10 minutos)

#### 4.1 Criar paciente de teste

Execute no **SQL Editor**:

```sql
-- Substitua USER_ID pelo ID da Paula
INSERT INTO pacientes (nutricionista_id, nome, email, data_nascimento, sexo)
VALUES (
  'USER_ID_AQUI',
  'João da Silva',
  'joao@teste.com',
  '1990-05-15',
  'Masculino'
);

-- Verificar se criou
SELECT * FROM pacientes;
```

#### 4.2 Testar RLS (Isolamento)

```sql
-- Esta query deve retornar APENAS pacientes da Paula logada
-- O RLS filtra automaticamente pelo nutricionista_id
SELECT
  p.nome AS paciente,
  n.nome AS nutricionista
FROM pacientes p
JOIN nutricionistas n ON n.id = p.nutricionista_id;
```

---

## 💻 Como Usar os Serviços Criados

### Exemplo 1: Login

```javascript
import { login } from './services/auth';

const fazerLogin = async () => {
  try {
    const { user, nutricionista } = await login('paula@teste.com', 'Paula@123');
    console.log('Logado:', nutricionista.nome);
  } catch (error) {
    console.error('Erro:', error.message);
  }
};
```

### Exemplo 2: Listar Pacientes

```javascript
import { listarPacientes } from './services/pacientes';

const carregarPacientes = async () => {
  try {
    const pacientes = await listarPacientes();
    console.log('Pacientes:', pacientes);
    // RLS garante que vem apenas pacientes da Paula!
  } catch (error) {
    console.error('Erro:', error);
  }
};
```

### Exemplo 3: Criar Paciente

```javascript
import { criarPaciente } from './services/pacientes';

const novoPaciente = async () => {
  try {
    const paciente = await criarPaciente({
      nome: 'Maria Santos',
      email: 'maria@email.com',
      telefone: '(21) 98888-8888',
      data_nascimento: '1985-03-10',
      sexo: 'Feminino',
    });
    // nutricionista_id é adicionado automaticamente!
    console.log('Criado:', paciente);
  } catch (error) {
    console.error('Erro:', error);
  }
};
```

---

## 📊 Estrutura do Banco de Dados

### Tabelas Principais:

#### **nutricionistas** (seus clientes)
```sql
- id (UUID) → referencia auth.users
- nome, email, crn, telefone
- plano (basico/profissional/clinica)
- limite_pacientes
- ativo, data_expiracao
- cor_primaria, cor_secundaria, logo_url
```

#### **pacientes**
```sql
- id (UUID)
- nutricionista_id (FK) → isolamento RLS
- nome, email, telefone, cpf
- data_nascimento, sexo
- arquivado
```

#### **avaliacoes_antropometricas**
```sql
- paciente_id, nutricionista_id
- peso, altura, imc
- circunferências, dobras
- percentual_gordura, massa_magra
- bioimpedância
```

#### **planos_alimentares**
```sql
- paciente_id, nutricionista_id
- objetivo_clinico
- vet, cho, ptn, lip
- cafe_manha, lanche_manha, almoco
- lanche_tarde, jantar, ceia
- orientacoes
```

### Como Funciona o RLS:

```sql
-- Exemplo de política
CREATE POLICY "Nutricionistas veem apenas seus pacientes"
  ON pacientes
  FOR SELECT
  USING (nutricionista_id = auth.uid());
```

**Resultado:** Quando a Paula faz:
```javascript
const pacientes = await supabase.from('pacientes').select('*');
```

O Supabase **automaticamente** adiciona:
```sql
WHERE nutricionista_id = 'paula_id'
```

**Isolamento total garantido! 🔒**

---

## 🔄 Próximas Etapas

### Fase 1: Migração do App.jsx (Recomendado)

1. **Substituir localStorage por Supabase**
2. **Migrar autenticação** para `services/auth.js`
3. **Migrar CRUD** para `services/pacientes.js`
4. **Testar isolamento** com múltiplos usuários

### Fase 2: Funcionalidades Adicionais

- [ ] Serviço de avaliações (`services/avaliacoes.js`)
- [ ] Serviço de anamneses (`services/anamneses.js`)
- [ ] Serviço de planos (`services/planos.js`)
- [ ] Upload de fotos (Storage)
- [ ] Gráficos com dados do Supabase

### Fase 3: Painel Administrativo

- [ ] Tela de gerenciamento de clientes
- [ ] Dashboard com estatísticas
- [ ] Sistema de pagamentos
- [ ] Controle de assinaturas

### Fase 4: White Label

- [ ] Subdomínios personalizados
- [ ] Logo e cores customizáveis
- [ ] Email personalizado

---

## 📖 Documentação Disponível

| Arquivo | Descrição |
|---------|-----------|
| `supabase/schema.sql` | Schema completo do banco |
| `supabase/SETUP_SUPABASE.md` | Guia passo a passo do Supabase |
| `ANALISE_BANCO_DE_DADOS.md` | Comparação de bancos |
| `ESTRATEGIA_MULTI_CLIENTES.md` | Estratégia multi-tenant |
| `CORRECAO_PDF_EXPLICADA.md` | Correção do bug do PDF |
| `DEPLOY_INFO.md` | Informações do deploy |

---

## 🎓 Recursos de Aprendizado

### Documentação Oficial:
- **Supabase Docs**: https://supabase.com/docs
- **Row Level Security**: https://supabase.com/docs/guides/auth/row-level-security
- **JavaScript Client**: https://supabase.com/docs/reference/javascript

### Tutoriais:
- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **Database Functions**: https://supabase.com/docs/guides/database/functions
- **Storage**: https://supabase.com/docs/guides/storage

---

## ❓ Troubleshooting

### Erro: "Missing credentials"
**Solução:** Verifique se o `.env` existe e tem as credenciais corretas

### Erro: "Row level security"
**Solução:** Certifique-se de estar logado antes de fazer queries

### Pacientes não aparecem
**Solução:** Verifique se o `nutricionista_id` está correto

### Erro ao criar paciente
**Solução:** O trigger deve ter criado o nutricionista. Execute o UPDATE manual.

---

## 🎯 Status Atual

✅ **Schema SQL criado** - 7 tabelas com RLS
✅ **Serviços criados** - Auth e Pacientes
✅ **Documentação completa**
✅ **Guias de configuração**
⏳ **Migração do App.jsx** - Próxima etapa
⏳ **Testes de isolamento** - Próxima etapa

---

## 📞 Suporte

Em caso de dúvidas:
1. Consulte a documentação do Supabase
2. Verifique os arquivos `.md` criados
3. Teste com dados de exemplo primeiro

---

**Estrutura completa criada! Tempo estimado de configuração: 45 minutos** ⏱️

**Pronto para começar a vender para múltiplos nutricionistas!** 🚀
