const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bojuetqfkijkemtkswey.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvanVldHFma2lqa2VtdGtzd2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MjUwNTEsImV4cCI6MjA3NzAwMTA1MX0.x6qSkhUOePL1k1opYo_3hgLBQw9INLy44N8TJQDv9Y4';
const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('🔧 CONFIRMANDO EMAIL DA PAULA...\n');

  // Tentar via service_role (não vai funcionar com anon key, mas vamos tentar)
  // Vou fazer diferente: verificar se já está confirmado

  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

  if (usersError) {
    console.log('⚠️ Não consigo confirmar via código (precisa service_role key)');
    console.log('\n📋 PASSO A PASSO PARA VOCÊ:\n');
    console.log('1️⃣ Na tela do Supabase que está aberta');
    console.log('2️⃣ Olhe no MENU LATERAL ESQUERDO');
    console.log('3️⃣ Procure o ícone que parece </> ou [=] ');
    console.log('4️⃣ Nome: "SQL Editor"');
    console.log('5️⃣ Clique nele\n');
    console.log('6️⃣ Vai abrir uma tela com "New Query"');
    console.log('7️⃣ Clique em "New Query"\n');
    console.log('8️⃣ Cole este código:\n');
    console.log('─────────────────────────────────────────');
    console.log(`UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email = 'paula@nutricionista.com';

UPDATE nutricionistas
SET nome = 'Paula do Amaral Santos',
    crn = '08100732',
    plano = 'profissional',
    limite_pacientes = 200,
    ativo = true,
    data_expiracao = (NOW() + INTERVAL '1 year')
WHERE id = (SELECT id FROM auth.users WHERE email = 'paula@nutricionista.com');

SELECT u.email, n.nome, n.crn
FROM auth.users u
LEFT JOIN nutricionistas n ON n.id = u.id
WHERE u.email = 'paula@nutricionista.com';`);
    console.log('─────────────────────────────────────────\n');
    console.log('9️⃣ Clique no botão "RUN" (ou F5)\n');
    console.log('🔟 Deve aparecer: email: paula@nutricionista.com, nome: Paula...\n');
    console.log('✅ Se aparecer isso, me confirme aqui que funcionou!\n');
    return;
  }

  console.log('✅ Consegui acessar! Executando...');
})();
