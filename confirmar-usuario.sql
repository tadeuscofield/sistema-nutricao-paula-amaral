-- Confirmar email do usuário Paula manualmente
-- Execute este SQL no Supabase SQL Editor

UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'paula@teste.com';
