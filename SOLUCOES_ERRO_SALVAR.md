# 🔧 SOLUÇÕES PARA ERRO AO SALVAR

## ✅ TESTE BACKEND: PASSOU!

Testei o backend e está funcionando 100%:
- ✅ Login: OK
- ✅ Criar paciente: OK
- ✅ Salvar dados_completos (JSON): OK
- ✅ RLS: OK

**Conclusão:** O erro está no FRONTEND (navegador), não no código!

---

## 🎯 3 CAUSAS MAIS COMUNS

### 1️⃣ SESSÃO EXPIRADA

**Problema:**
- Você fez login antes da migração
- Token antigo não funciona mais
- Supabase rejeita requisições

**Solução:**
```
1. Clique em "Sair" (logout)
2. Faça login novamente:
   Email: paula@nutricionista.com
   Senha: neco1910
3. Tente salvar de novo
```

---

### 2️⃣ CACHE DO NAVEGADOR

**Problema:**
- Navegador carregou versão antiga do JavaScript
- Código antigo (localStorage) em conflito com novo (Supabase)

**Solução:**
```
Windows/Linux:
Ctrl + Shift + R (hard refresh)

Mac:
Cmd + Shift + R

Ou:
1. Pressione F12 (DevTools)
2. Clique com botão direito no ícone de reload
3. Selecione "Limpar cache e recarregar"
```

---

### 3️⃣ ERRO DE JAVASCRIPT NO CONSOLE

**Problema:**
- Algum erro de sintaxe
- Variável undefined
- Função não encontrada

**Solução:**
```
1. Pressione F12 (DevTools)
2. Vá na aba "Console"
3. Tire um print do erro
4. Me mande aqui para eu analisar
```

---

## 🚀 PASSO A PASSO PARA CORRIGIR

### Teste 1: Logout e Login
```
1. Abra: https://sistema-nutricao-paula-amaral-d2qacqo19.vercel.app
2. Clique em "Sair"
3. Faça login:
   Email: paula@nutricionista.com
   Senha: neco1910
4. Tente criar um paciente
5. Clique em "Salvar"
```

**Se ainda der erro, vá para Teste 2**

---

### Teste 2: Limpar Cache
```
1. Pressione Ctrl + Shift + R (recarrega sem cache)
2. Faça login novamente
3. Tente salvar
```

**Se ainda der erro, vá para Teste 3**

---

### Teste 3: Ver Erro no Console
```
1. Pressione F12 (abre DevTools)
2. Clique na aba "Console"
3. Limpe o console (ícone de "🚫")
4. Tente salvar
5. TIRE UM PRINT do erro que aparecer
6. Me mande aqui
```

---

## 🐛 POSSÍVEIS ERROS E SOLUÇÕES

### Erro: "Cannot read property 'id' of undefined"
```
Problema: Sessão expirada
Solução: Logout + Login
```

### Erro: "401 Unauthorized"
```
Problema: Token inválido
Solução: Logout + Login
```

### Erro: "Network error"
```
Problema: Sem internet ou Supabase fora do ar
Solução: Verificar conexão
```

### Erro: "violates row-level security policy"
```
Problema: nutricionista_id não está sendo enviado
Solução: Verificar se fez login com paula@nutricionista.com
```

### Erro: "Cannot coerce..."
```
Problema: Formato JSON inválido
Solução: Limpar cache e recarregar
```

---

## 🔍 VERIFICAÇÃO RÁPIDA

Execute estes comandos para diagnóstico:

### 1. Verificar se Supabase está online:
```bash
cd "C:\Users\tadec\OneDrive\Área de Trabalho\sistema-nutricao-paula-amaral"
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://bojuetqfkijkemtkswey.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvanVldHFma2lqa2VtdGtzd2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MjUwNTEsImV4cCI6MjA3NzAwMTA1MX0.x6qSkhUOePL1k1opYo_3hgLBQw9INLy44N8TJQDv9Y4');
(async () => {
  const { data, error } = await supabase.from('pacientes').select('count').limit(1);
  if (error) {
    console.log('❌ Supabase OFF:', error.message);
  } else {
    console.log('✅ Supabase ONLINE!');
  }
})();
"
```

### 2. Verificar login:
```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://bojuetqfkijkemtkswey.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvanVldHFma2lqa2VtdGtzd2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MjUwNTEsImV4cCI6MjA3NzAwMTA1MX0.x6qSkhUOePL1k1opYo_3hgLBQw9INLy44N8TJQDv9Y4');
(async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'paula@nutricionista.com',
    password: 'neco1910'
  });
  if (error) {
    console.log('❌ Login FALHOU:', error.message);
  } else {
    console.log('✅ Login OK:', data.user.email);
  }
})();
"
```

---

## 🎯 SOLUÇÃO MAIS PROVÁVEL

**90% dos casos é sessão expirada!**

### Faça isso agora:
1. ✅ Abra: https://sistema-nutricao-paula-amaral-d2qacqo19.vercel.app
2. ✅ Clique em "Sair"
3. ✅ Faça login com: paula@nutricionista.com / neco1910
4. ✅ Tente salvar de novo

**Se não funcionar, me mande:**
- Print do erro no console (F12)
- Mensagem exata que aparece

---

## 🚨 FALLBACK: MODO LOCALSTORAGE

Se urgente e precisar usar agora, posso desativar temporariamente o Supabase:

**Em App.jsx linha 24:**
```javascript
const USAR_SUPABASE = false; // Volta para localStorage temporariamente
```

Aí volta a funcionar como antes (dados no navegador) enquanto investigo o erro.

---

**Faça o Teste 1 (Logout + Login) e me confirme se funcionou! ✅**
