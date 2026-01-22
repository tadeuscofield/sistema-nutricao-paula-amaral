/**
 * Configuração do Cliente Supabase
 * Sistema de Nutrição Paula Amaral
 */

import { createClient } from '@supabase/supabase-js';

// Buscar credenciais das variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar credenciais
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltam credenciais do Supabase! Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env'
  );
}

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Helper: Obter usuário atual
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Helper: Obter nutricionista logado
export const getNutricionistaAtual = async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('nutricionistas')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
};

// Helper: Verificar se está ativo e dentro da validade
export const verificarAssinatura = async () => {
  const nutri = await getNutricionistaAtual();
  if (!nutri) return { ativo: false, expirado: true };

  const hoje = new Date();
  const dataExpiracao = new Date(nutri.data_expiracao);

  return {
    ativo: nutri.ativo,
    expirado: dataExpiracao < hoje,
    diasRestantes: Math.ceil((dataExpiracao - hoje) / (1000 * 60 * 60 * 24)),
    plano: nutri.plano,
    limitePacientes: nutri.limite_pacientes,
  };
};

export default supabase;
