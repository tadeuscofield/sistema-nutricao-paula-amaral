# Guia de Configuração do Supabase - Paula Amaral

## Passo 1: Criar Conta e Projeto (5 minutos)

### 1.1 Criar Conta
1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Faça login com GitHub ou email

### 1.2 Criar Novo Projeto
1. Clique em "New Project"
2. Preencha:
   - **Name**: `nutricao-paula-amaral`
   - **Database Password**: (anote em local seguro!)
   - **Region**: `South America (São Paulo)` (mais próximo do Brasil)
   - **Pricing Plan**: `Free`
3. Clique em "Create new project"
4. Aguarde 2-3 minutos (criação do banco)

---

## Passo 2: Executar o Schema SQL (5 minutos)

### 2.1 Abrir SQL Editor
1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**

### 2.2 Copiar e Executar o Schema
1. Abra o arquivo: `supabase/schema.sql`
2. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
3. **Cole no SQL Editor** do Supabase
4. Clique em **"Run"** (ou F5)
5. Aguarde a execução (deve aparecer "Success")

### 2.3 Verificar Tabelas
1. No menu lateral, clique em **"Table Editor"**
2. Você deve ver as tabelas:
   - ✅ nutricionistas
   - ✅ pacientes
   - ✅ avaliacoes_antropometricas
   - ✅ anamneses
   - ✅ planos_alimentares
   - ✅ acompanhamentos
   - ✅ arquivos

---

## Passo 3: Configurar Storage (Opcional - 3 minutos)

### 3.1 Criar Buckets
1. No menu lateral, clique em **"Storage"**
2. Clique em **"Create a new bucket"**

**Bucket 1: Avatares**
- **Name**: `avatares`
- **Public**: ✅ Sim (para exibir fotos)
- Clique em "Create bucket"

**Bucket 2: Documentos**
- **Name**: `documentos`
- **Public**: ❌ Não (privado)
- Clique em "Create bucket"

### 3.2 Configurar Políticas de Storage

**Para o bucket `avatares`:**
```sql
-- Permitir upload de fotos
CREATE POLICY "Nutricionistas podem fazer upload de avatares"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatares');

-- Permitir leitura pública
CREATE POLICY "Avatares são públicos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatares');
```

**Para o bucket `documentos`:**
```sql
-- Permitir upload de documentos
CREATE POLICY "Nutricionistas podem fazer upload de documentos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documentos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir leitura apenas do próprio nutricionista
CREATE POLICY "Nutricionistas veem apenas seus documentos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documentos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## Passo 4: Copiar Credenciais (2 minutos)

### 4.1 Pegar URL e API Key
1. No menu lateral, clique em **"Settings"** (engrenagem)
2. Clique em **"API"**
3. Copie as seguintes informações:

**Project URL:**
```
https://xxxxxxxxxxxxxxxx.supabase.co
```

**anon/public key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```

### 4.2 Criar arquivo .env
1. Na raiz do projeto, crie: `.env`
2. Cole:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```

3. Substitua pelos valores copiados acima
4. **IMPORTANTE**: Adicione `.env` no `.gitignore`

---

## Passo 5: Configurar Autenticação (3 minutos)

### 5.1 Configurar Email Auth
1. Vá em **"Authentication"** > **"Providers"**
2. Clique em **"Email"**
3. Configure:
   - ✅ Enable Email provider
   - ✅ Confirm email: **DESABILITADO** (para facilitar testes)
   - ✅ Secure password change: Habilitado
4. Salve

### 5.2 Configurar URL de Redirecionamento
1. Vá em **"Authentication"** > **"URL Configuration"**
2. Adicione as URLs:
   - `http://localhost:5173` (desenvolvimento)
   - `http://localhost:3001` (desenvolvimento alternativo)
   - `https://seu-dominio.vercel.app` (produção - depois)
3. Salve

---

## Passo 6: Criar Primeiro Usuário (Teste)

### 6.1 Via Supabase Dashboard
1. Vá em **"Authentication"** > **"Users"**
2. Clique em **"Add user"** > **"Create new user"**
3. Preencha:
   - **Email**: `paula@teste.com`
   - **Password**: `Paula@123`
   - **Auto Confirm User**: ✅ Sim
4. Clique em "Create user"

### 6.2 Completar Dados do Nutricionista (SQL)
1. Vá em **"SQL Editor"**
2. Execute:

```sql
-- Pegar o ID do usuário criado
SELECT id, email FROM auth.users WHERE email = 'paula@teste.com';

-- Atualizar dados do nutricionista
UPDATE nutricionistas
SET
  nome = 'Paula do Amaral Santos',
  crn = '08100732',
  telefone = '(21) 99999-9999',
  plano = 'profissional',
  limite_pacientes = 500
WHERE email = 'paula@teste.com';
```

---

## Passo 7: Verificar Row Level Security (RLS)

### 7.1 Testar Isolamento
Execute no SQL Editor:

```sql
-- Verificar políticas RLS
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Deve retornar ~28 políticas (4 por tabela × 7 tabelas)
```

### 7.2 Criar Paciente de Teste
```sql
-- Inserir paciente de exemplo
-- Substitua 'USER_ID_AQUI' pelo ID do usuário Paula
INSERT INTO pacientes (nutricionista_id, nome, email, data_nascimento, sexo)
VALUES (
  'USER_ID_AQUI', -- Cole o UUID da Paula aqui
  'João Silva',
  'joao@teste.com',
  '1990-05-15',
  'Masculino'
);
```

---

## Passo 8: Instalar Dependências no Projeto

```bash
cd "C:\Users\tadec\OneDrive\Área de Trabalho\sistema-nutricao-paula-amaral"
npm install @supabase/supabase-js
```

---

## Passo 9: Verificar Configuração

### Checklist Final:
- [ ] Projeto Supabase criado
- [ ] Schema SQL executado (7 tabelas criadas)
- [ ] RLS habilitado (28 políticas criadas)
- [ ] Storage configurado (2 buckets)
- [ ] Autenticação configurada
- [ ] Primeiro usuário criado (Paula)
- [ ] Dados do nutricionista completados
- [ ] Arquivo `.env` criado com credenciais
- [ ] Pacote `@supabase/supabase-js` instalado

---

## Troubleshooting

### Erro: "relation already exists"
- **Causa**: Tabelas já foram criadas
- **Solução**: Drope as tabelas ou crie novo projeto

### Erro: "permission denied"
- **Causa**: RLS bloqueando acesso
- **Solução**: Verifique se está logado e se o `nutricionista_id` está correto

### Erro: "insert violates foreign key"
- **Causa**: Tentando inserir com `nutricionista_id` inexistente
- **Solução**: Use o UUID correto do usuário autenticado

### Dados não aparecem
- **Causa**: RLS filtrando dados de outro nutricionista
- **Solução**: Verifique se está logado com o usuário correto

---

## Próximos Passos

Após completar este setup:

1. ✅ Configurar cliente Supabase no React
2. ✅ Implementar autenticação
3. ✅ Migrar operações CRUD
4. ✅ Testar isolamento de dados
5. ✅ Deploy

Veja: `GUIA_MIGRACAO_SUPABASE.md`

---

## Recursos Úteis

- **Documentação**: https://supabase.com/docs
- **Dashboard**: https://app.supabase.com
- **SQL Reference**: https://supabase.com/docs/guides/database
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **Storage Guide**: https://supabase.com/docs/guides/storage

---

**Setup concluído! Tempo total: ~20 minutos** ⏱️
