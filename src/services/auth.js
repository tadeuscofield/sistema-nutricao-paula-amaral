/**
 * Serviço de Autenticação com Supabase
 * Sistema de Nutrição Paula Amaral
 */

import { supabase } from '../lib/supabase';

/**
 * Fazer login
 * @param {string} email
 * @param {string} senha
 * @returns {Promise<{user, nutricionista}>}
 */
export const login = async (email, senha) => {
  try {
    // Autenticar com Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) throw error;

    // Buscar dados do nutricionista
    const { data: nutri, error: nutriError } = await supabase
      .from('nutricionistas')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (nutriError) throw nutriError;

    // Verificar se está ativo
    if (!nutri.ativo) {
      throw new Error('Conta desativada. Entre em contato com o suporte.');
    }

    // Verificar se está dentro da validade
    const hoje = new Date();
    const dataExpiracao = new Date(nutri.data_expiracao);

    if (dataExpiracao < hoje) {
      throw new Error('Assinatura expirada. Renove seu plano para continuar.');
    }

    return {
      user: data.user,
      nutricionista: nutri,
    };
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
};

/**
 * Fazer logout
 */
export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Criar nova conta (signup)
 * @param {Object} dados
 * @returns {Promise<{user, nutricionista}>}
 */
export const signup = async ({ email, senha, nome, crn, telefone }) => {
  try {
    // Criar usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          nome,
        },
      },
    });

    if (error) throw error;

    // Aguardar trigger criar nutricionista (pode demorar ~1s)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Atualizar dados adicionais do nutricionista
    const { data: nutri, error: updateError } = await supabase
      .from('nutricionistas')
      .update({
        nome,
        crn,
        telefone,
      })
      .eq('id', data.user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao atualizar nutricionista:', updateError);
    }

    return {
      user: data.user,
      nutricionista: nutri,
    };
  } catch (error) {
    console.error('Erro no signup:', error);
    throw error;
  }
};

/**
 * Recuperar senha
 * @param {string} email
 */
export const recuperarSenha = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
};

/**
 * Atualizar senha
 * @param {string} novaSenha
 */
export const atualizarSenha = async (novaSenha) => {
  const { error } = await supabase.auth.updateUser({
    password: novaSenha,
  });

  if (error) throw error;
};

/**
 * Obter sessão atual
 */
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

/**
 * Escutar mudanças de autenticação
 * @param {Function} callback
 */
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};
