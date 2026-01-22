# 📧 CONFIRMAR EMAIL DA PAULA

## ⚠️ PASSO NECESSÁRIO

O novo usuário `paula@nutricionista.com` foi criado, mas precisa confirmar o email.

---

## 🔧 COMO CONFIRMAR

### Opção 1: SQL no Supabase Dashboard (RECOMENDADO - 30 segundos)

1. Abra: https://supabase.com/dashboard/project/bojuetqfkijkemtkswey/editor
2. Clique em **SQL Editor** → **New Query**
3. Cole este SQL e clique **RUN:**

```sql
-- Confirmar email da Paula
UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email = 'paula@nutricionista.com';

-- Atualizar dados da nutricionista
UPDATE nutricionistas
SET nome = 'Paula do Amaral Santos',
    crn = '08100732',
    telefone = '(21) 99999-9999',
    plano = 'profissional',
    limite_pacientes = 200,
    ativo = true,
    data_expiracao = (NOW() + INTERVAL '1 year')
WHERE id = (SELECT id FROM auth.users WHERE email = 'paula@nutricionista.com');

-- Verificar
SELECT
  u.email,
  u.email_confirmed_at,
  n.nome,
  n.crn,
  n.plano,
  n.ativo
FROM auth.users u
LEFT JOIN nutricionistas n ON n.id = u.id
WHERE u.email = 'paula@nutricionista.com';
```

4. ✅ Deve aparecer os dados da Paula confirmados!

---

### Opção 2: Via Interface do Supabase (1 minuto)

1. Abra: https://supabase.com/dashboard/project/bojuetqfkijkemtkswey/auth/users
2. Encontre o usuário `paula@nutricionista.com`
3. Clique nos 3 pontinhos `...` → **Confirm User Email**
4. Depois vá em **Table Editor** → **nutricionistas**
5. Edite a linha da Paula manualmente

---

## 📋 CREDENCIAIS FINAIS

Depois de confirmar:

**Email:** paula@nutricionista.com
**Senha:** neco1910

**Case-insensitive:**
- PAULA@nutricionista.com → ✅ Funciona
- Paula@Nutricionista.com → ✅ Funciona
- NECO1910 → ✅ Funciona
- Neco1910 → ✅ Funciona

---

## 🚀 APÓS CONFIRMAR

Execute este comando para testar:

```bash
cd "C:\Users\tadec\OneDrive\Área de Trabalho\sistema-nutricao-paula-amaral"
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://bojuetqfkijkemtkswey.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvanVldHFma2lqa2VtdGtzd2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MjUwNTEsImV4cCI6MjA3NzAwMTA1MX0.x6qSkhUOePL1k1opYo_3hgLBQw9INLy44N8TJQDv9Y4');

(async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'paula@nutricionista.com',
    password: 'neco1910'
  });

  if (error) {
    console.log('❌ Erro:', error.message);
  } else {
    console.log('✅ Login OK!', data.user.email);
  }
})();
"
```

Se aparecer **✅ Login OK!** → Confirme para eu atualizar o App.jsx!
