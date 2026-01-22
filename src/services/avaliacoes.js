/**
 * Serviço de Avaliações Antropométricas com Supabase
 * Sistema de Nutrição Paula Amaral
 */

import { supabase, getCurrentUser } from '../lib/supabase';

/**
 * Listar avaliações de um paciente
 * @param {string} pacienteId
 * @returns {Promise<Array>}
 */
export const listarAvaliacoes = async (pacienteId) => {
  try {
    const { data, error } = await supabase
      .from('avaliacoes_antropometricas')
      .select('*')
      .eq('paciente_id', pacienteId)
      .order('data_avaliacao', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao listar avaliações:', error);
    throw error;
  }
};

/**
 * Buscar avaliação por ID
 * @param {string} id
 * @returns {Promise<Object>}
 */
export const buscarAvaliacao = async (id) => {
  const { data, error } = await supabase
    .from('avaliacoes_antropometricas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Criar nova avaliação
 * @param {string} pacienteId
 * @param {Object} avaliacao
 * @returns {Promise<Object>}
 */
export const criarAvaliacao = async (pacienteId, avaliacao) => {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from('avaliacoes_antropometricas')
    .insert({
      ...avaliacao,
      paciente_id: pacienteId,
      nutricionista_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Atualizar avaliação
 * @param {string} id
 * @param {Object} dados
 * @returns {Promise<Object>}
 */
export const atualizarAvaliacao = async (id, dados) => {
  const { data, error } = await supabase
    .from('avaliacoes_antropometricas')
    .update(dados)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Deletar avaliação
 * @param {string} id
 */
export const deletarAvaliacao = async (id) => {
  const { error } = await supabase
    .from('avaliacoes_antropometricas')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * Buscar última avaliação do paciente
 * @param {string} pacienteId
 * @returns {Promise<Object|null>}
 */
export const buscarUltimaAvaliacao = async (pacienteId) => {
  const { data, error } = await supabase
    .from('avaliacoes_antropometricas')
    .select('*')
    .eq('paciente_id', pacienteId)
    .order('data_avaliacao', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = nenhum resultado
  return data || null;
};
