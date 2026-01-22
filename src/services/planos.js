/**
 * Serviço de Planos Alimentares com Supabase
 * Sistema de Nutrição Paula Amaral
 */

import { supabase, getCurrentUser } from '../lib/supabase';

/**
 * Listar planos de um paciente
 * @param {string} pacienteId
 * @returns {Promise<Array>}
 */
export const listarPlanos = async (pacienteId) => {
  try {
    const { data, error } = await supabase
      .from('planos_alimentares')
      .select('*')
      .eq('paciente_id', pacienteId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao listar planos:', error);
    throw error;
  }
};

/**
 * Buscar plano por ID
 * @param {string} id
 * @returns {Promise<Object>}
 */
export const buscarPlano = async (id) => {
  const { data, error } = await supabase
    .from('planos_alimentares')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Criar novo plano
 * @param {string} pacienteId
 * @param {Object} plano
 * @returns {Promise<Object>}
 */
export const criarPlano = async (pacienteId, plano) => {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from('planos_alimentares')
    .insert({
      ...plano,
      paciente_id: pacienteId,
      nutricionista_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Atualizar plano
 * @param {string} id
 * @param {Object} dados
 * @returns {Promise<Object>}
 */
export const atualizarPlano = async (id, dados) => {
  const { data, error } = await supabase
    .from('planos_alimentares')
    .update(dados)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Deletar plano
 * @param {string} id
 */
export const deletarPlano = async (id) => {
  const { error } = await supabase
    .from('planos_alimentares')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * Buscar último plano do paciente
 * @param {string} pacienteId
 * @returns {Promise<Object|null>}
 */
export const buscarUltimoPlano = async (pacienteId) => {
  const { data, error } = await supabase
    .from('planos_alimentares')
    .select('*')
    .eq('paciente_id', pacienteId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = nenhum resultado
  return data || null;
};

/**
 * Marcar plano como ativo/inativo
 * @param {string} id
 * @param {boolean} ativo
 * @returns {Promise<Object>}
 */
export const togglePlanoAtivo = async (id, ativo = true) => {
  return atualizarPlano(id, { ativo });
};
