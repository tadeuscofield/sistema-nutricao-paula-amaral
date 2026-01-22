-- Atualizar dados da nutricionista Paula
UPDATE nutricionistas
SET
  nome = 'Paula do Amaral Santos',
  crn = '08100732',
  telefone = '(21) 99999-9999',
  plano = 'profissional',
  limite_pacientes = 500
WHERE email = 'paula@teste.com';
