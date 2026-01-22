# 🏥 CLÍNICA COM MÚLTIPLOS USUÁRIOS

## 🎯 CENÁRIO: DRA. THAIS + SECRETÁRIA

### Situação:
```
Clínica de Pediatria da Dra. Thais
├─ Dra. Thais (Médica)
└─ Maria (Secretária)

Ambas precisam acessar os mesmos pacientes!
```

---

## 📊 DUAS ABORDAGENS POSSÍVEIS

### 🔹 OPÇÃO 1: USUÁRIOS INDEPENDENTES (Como está agora)

**Como funciona:**
```
Sistema Pediatria Dra. Thais
├─ Usuário 1: thais@pediatra.com
│  └─ Vê: Pacientes vinculados a ela (RLS)
│
└─ Usuário 2: maria@pediatra.com
   └─ Vê: Pacientes vinculados a ela (RLS)
```

**Problema:**
- Cada usuário vê apenas SEUS pacientes
- Maria não vê pacientes da Dra. Thais
- Não serve para clínicas!

**Solução:** Precisa ajustar o RLS (explicado abaixo)

---

### 🔹 OPÇÃO 2: CONTA COMPARTILHADA (Mais simples)

**Como funciona:**
```
Sistema Pediatria Dra. Thais
└─ Usuário único: thais@pediatra.com
   Senha: thais123

   Ambas usam o MESMO login!
```

**Vantagens:**
- ✅ Simples de implementar
- ✅ Não precisa ajustar código
- ✅ Conta como 1 usuário só

**Desvantagens:**
- ❌ Não sabe quem fez cada ação
- ❌ Senha compartilhada (menos seguro)
- ❌ Não tem auditoria individual

---

## 🏆 OPÇÃO RECOMENDADA: MULTI-USUÁRIO COM ORGANIZAÇÃO

### Estrutura ideal para clínicas:

```
Sistema Pediatria
│
├─ ORGANIZAÇÃO/CLÍNICA
│  └─ ID: clinica-thais-123
│      Nome: Clínica Pediátrica Dra. Thais
│      Endereço: Rua XYZ, 123
│
├─ USUÁRIOS da Clínica
│  ├─ Dra. Thais (Médica)
│  │  Email: thais@pediatra.com
│  │  Função: Médica
│  │  Permissões: Tudo
│  │  clinica_id: clinica-thais-123
│  │
│  └─ Maria (Secretária)
│     Email: maria@pediatra.com
│     Função: Secretária
│     Permissões: Agendar, ver prontuários (sem editar)
│     clinica_id: clinica-thais-123
│
└─ PACIENTES da Clínica
   └─ clinica_id: clinica-thais-123
      ├─ Criança 1
      ├─ Criança 2
      └─ ...
```

**Como funciona:**
- Todos usuários da mesma clínica veem os mesmos pacientes
- RLS filtra por `clinica_id` em vez de `user_id`
- 2 usuários = 2 logins diferentes
- Auditoria: sabe quem fez cada ação

---

## 🔧 AJUSTE NO RLS (Para Multi-Usuário na Clínica)

### Banco de Dados atual (Nutrição):
```sql
-- Cada nutricionista vê só seus pacientes
CREATE POLICY "Nutricionistas veem apenas seus pacientes"
  ON pacientes
  FOR SELECT
  USING (nutricionista_id = auth.uid());
```

### Banco de Dados adaptado (Pediatria com Clínica):
```sql
-- Adicionar coluna clinica_id
ALTER TABLE pacientes
ADD COLUMN clinica_id UUID REFERENCES clinicas(id);

-- Adicionar coluna clinica_id nos usuários
ALTER TABLE nutricionistas
RENAME TO profissionais;

ALTER TABLE profissionais
ADD COLUMN clinica_id UUID REFERENCES clinicas(id);

-- Novo RLS: Ver pacientes da mesma clínica
CREATE POLICY "Profissionais veem pacientes da clínica"
  ON pacientes
  FOR SELECT
  USING (
    clinica_id IN (
      SELECT clinica_id
      FROM profissionais
      WHERE id = auth.uid()
    )
  );
```

**Resultado:**
- Dra. Thais login → vê todos pacientes da clínica
- Maria login → vê todos pacientes da clínica (mesmos!)
- 2 usuários diferentes, mesmos dados

---

## 📊 CONTAGEM DE USUÁRIOS

### Sua pergunta: "2 acessos = 2 usuários?"

✅ **SIM! 2 acessos = 2 usuários no Supabase**

**Explicação:**
```
Projeto Pediatria
├─ Usuário 1: thais@pediatra.com (MAU)
└─ Usuário 2: maria@pediatra.com (MAU)

Total: 2 MAU (Monthly Active Users)
```

**Limite FREE:** 50.000 MAU
**Seu uso:** 2 MAU
**Sobra:** 49.998 MAU 😄

---

## 🎯 CENÁRIO COMPLETO: 10 PEDIATRAS

### Se tiver 10 clínicas, cada uma com médico + secretária:

```
Projeto Supabase: Pediatria
│
├─ Clínica 1: Dra. Thais
│  ├─ thais@pediatra.com (médica)
│  └─ maria@pediatra.com (secretária)
│
├─ Clínica 2: Dr. Pedro
│  ├─ pedro@pediatra.com (médico)
│  └─ joao@pediatra.com (secretário)
│
├─ Clínica 3: Dra. Carla
│  ├─ carla@pediatra.com (médica)
│  └─ ana@pediatra.com (secretária)
│
└─ ... 10 clínicas

Total usuários: 10 médicos + 10 secretários = 20 usuários
```

**Contagem Supabase:**
- 20 usuários ativos = 20 MAU
- Limite FREE: 50.000 MAU
- ✅ Ainda FREE!

---

## 💰 MODELO DE COBRANÇA

### Opção 1: Cobrar por médico (RECOMENDO)
```
10 pediatras × R$ 99/mês = R$ 990/mês

Secretária = GRÁTIS (incluída no plano do médico)
```

**Vantagem:**
- Mais atrativo para médicos
- "Secretária incluída!"

### Opção 2: Cobrar por usuário
```
20 usuários × R$ 49/mês = R$ 980/mês
```

**Desvantagem:**
- Médico paga 2x (ele + secretária)
- Menos atrativo

---

## 🎯 RESPOSTA DIRETA À SUA PERGUNTA

### "Dra. Thais + secretária = 2 usuários. Sobram +8?"

✅ **SIM! Vou explicar:**

**Se você planeja:**
```
Projeto Pediatria (1 projeto Supabase)
└─ 10 clínicas (10 pediatras)

Cada clínica tem:
├─ 1 médico
└─ 1 secretária (opcional)
```

**Contagem de usuários:**

### Cenário A: Só médicos
```
10 médicos × 1 usuário = 10 usuários
Limite: 50.000 MAU
Sobram: 49.990 usuários 😄
```

### Cenário B: Médicos + secretárias
```
10 médicos × 1 = 10 usuários
10 secretárias × 1 = 10 usuários
Total: 20 usuários
Limite: 50.000 MAU
Sobram: 49.980 usuários 😄
```

### Cenário C: Expandir muito
```
50 clínicas × 2 (médico + secretária) = 100 usuários
Ainda no FREE (limite 50.000 MAU)
```

---

## ✅ CONCLUSÃO

### Suas perguntas respondidas:

**1. Dra. Thais + secretária = 2 usuários?**
✅ **SIM!** 2 logins diferentes = 2 usuários no Supabase

**2. Teria +8 ainda?**
✅ **SIM!** Você pode ter:
- 10 clínicas (10 pediatras)
- Cada uma com médico + secretária
- Total: 20 usuários
- Limite FREE: 50.000 usuários
- **Sobram 49.980!** 😄

**3. Dados compartilhados?**
✅ **SIM!** Com ajuste no RLS:
- Médico vê todos pacientes da clínica
- Secretária vê todos pacientes da clínica
- Clínicas diferentes não se veem

---

## 🚀 IMPLEMENTAÇÃO

### Para fazer Multi-Usuário na Clínica:

**Opção 1: Conta compartilhada (mais simples)**
- 1 login: thais@pediatra.com
- Ambas usam a mesma senha
- Conta como 1 usuário
- **Pronto, já funciona agora!**

**Opção 2: Contas separadas + Ajuste RLS (ideal)**
- 2 logins diferentes
- Ajustar schema do banco (adicionar `clinica_id`)
- Ajustar RLS para filtrar por clínica
- Conta como 2 usuários
- **Precisa 1-2 horas de desenvolvimento**

---

**Recomendação:** Comece com conta compartilhada (simples) e depois evolui para multi-usuário se precisar! ✅
