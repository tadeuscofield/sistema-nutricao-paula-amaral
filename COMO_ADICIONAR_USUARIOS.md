# 👥 COMO ADICIONAR NOVOS USUÁRIOS

## 🎯 CONCEITO SIMPLES

**"Criar email" = Criar novo login/senha para um profissional**

---

## 📊 EXEMPLO PRÁTICO

### Situação Atual:
```
Sistema da Paula (Nutrição)
└─ Paula
   Email: paula@nutricionista.com
   Senha: neco1910
   Vê: Apenas seus pacientes
```

### Adicionar Dra. Ana:
```
Sistema da Paula (Nutrição)
├─ Paula
│  Email: paula@nutricionista.com
│  Senha: neco1910
│  Vê: Seus 50 pacientes
│
└─ Dra. Ana (NOVA) ← Criar novo email/senha
   Email: ana@nutricionista.com
   Senha: ana123
   Vê: Seus 30 pacientes (diferentes da Paula)
```

**Resultado:**
- Paula faz login → vê 50 pacientes dela
- Ana faz login → vê 30 pacientes dela
- **Dados isolados automaticamente!** (RLS)

---

## 🔧 COMO CRIAR NOVO USUÁRIO

### Opção 1: Auto-cadastro (RECOMENDO)

**Passo a passo:**
1. Dra. Ana acessa: https://sistema-nutricao-paula-amaral-d2qacqo19.vercel.app
2. Clica em "Criar Conta" (se tiver esse botão)
3. Preenche:
   - Nome: Ana Silva
   - Email: ana@nutricionista.com
   - Senha: ana123
   - CRN: 12345678
4. Clica "Cadastrar"
5. ✅ Pronto! Já pode fazer login

**Vantagem:** Cada nutricionista cria sua própria conta

---

### Opção 2: Você cria manualmente

**Usar o script que criei:**

```bash
cd "C:\Users\tadec\OneDrive\Área de Trabalho\sistema-nutricao-paula-amaral"
node criar-usuario-nutricionista.js
```

**O script vai perguntar:**
```
Email: ana@nutricionista.com
Senha: ana123
Nome: Ana Silva
CRN: 12345678
```

**Depois:**
1. Executa SQL para confirmar email (igual fez com Paula)
2. Envia credenciais para Dra. Ana
3. Ela faz login e começa a usar

---

## 🏥 EXEMPLO: DRA. THAIS (PEDIATRIA)

### Criar Sistema da Dra. Thais:

**Passo 1: Criar novo projeto Supabase**
- Nome: sistema-pediatria-thais
- ID: (novo ID será gerado)

**Passo 2: Criar usuários**

```
Sistema Pediatria
├─ Dra. Thais (Pediatra)
│  Email: thais@pediatra.com
│  Senha: thais123
│  Função: Médica
│  Vê: Todos os pacientes
│
└─ Maria (Secretária)
   Email: maria@pediatra.com
   Senha: maria123
   Função: Secretária
   Vê: Todos os pacientes (ou limitado se quiser)
```

**Resultado:**
- 2 usuários = 2 emails = 2 logins
- Ambos acessam o mesmo sistema
- Compartilham os mesmos pacientes
- Cada um tem seu login próprio

---

## 🎯 DIFERENÇA: COMPARTILHAR vs ISOLAR

### Cenário 1: NUTRICIONISTAS (Dados ISOLADOS)
```
Sistema Nutrição
├─ Paula
│  └─ Pacientes: Maria, João, Ana (só Paula vê)
│
└─ Dra. Ana
   └─ Pacientes: Pedro, Lucas, Carla (só Ana vê)
```
**RLS isola automaticamente!**

### Cenário 2: CLÍNICA PEDIATRIA (Dados COMPARTILHADOS)
```
Sistema Pediatria
├─ Dra. Thais (Médica)
│  └─ Pacientes: Todos (50 crianças)
│
└─ Maria (Secretária)
   └─ Pacientes: Todos (50 crianças - mesmos!)
```
**Mesmos dados, usuários diferentes!**

Para fazer isso, preciso ajustar o RLS para permitir múltiplos usuários na mesma "clínica".

---

## 📊 LIMITE DE USUÁRIOS

### Supabase FREE:
- ✅ **50.000 usuários ativos/mês** (MAU)
- ✅ "Ativo" = fez login pelo menos 1x no mês
- ✅ Você pode ter 1.000 nutricionistas cadastradas
- ✅ Só paga se 50.000 fizerem login no mesmo mês

**Exemplo prático:**
```
10 nutricionistas (ativas todo mês) = 10 MAU
1.000 nutricionistas cadastradas = 1.000 registros
Mas só 50 fazem login por mês = 50 MAU

Resultado: Dentro do FREE (50.000 MAU)
```

---

## 🎯 RESUMINDO

### ✅ Criar email = Criar novo usuário

**Cada profissional precisa:**
- Email único (login)
- Senha
- Cadastro no sistema

**Tipos de usuários:**

1. **Nutricionistas (dados isolados):**
   - Cada uma vê só seus pacientes
   - paula@nutricionista.com
   - ana@nutricionista.com
   - maria@nutricionista.com

2. **Clínica/Consultório (dados compartilhados):**
   - Todos veem os mesmos pacientes
   - thais@pediatra.com (médica)
   - maria@pediatra.com (secretária)
   - joao@pediatra.com (enfermeiro)

---

## 💡 RECOMENDAÇÃO

**Para nutricionistas:**
✅ Cada uma cria sua conta (auto-cadastro)
✅ Dados isolados (RLS)

**Para clínicas (tipo Dra. Thais):**
✅ Você cria manualmente 2-3 usuários
✅ Dados compartilhados (ajustar RLS)
✅ médico + secretária + auxiliar

---

**Criar usuário = Criar email/senha = Criar login** ✅
