/**
 * Serviço de Anamneses com Supabase
 * Sistema de Nutrição Paula Amaral
 */

import { supabase, getCurrentUser } from '../lib/supabase';

/**
 * Listar anamneses de um paciente
 * @param {string} pacienteId
 * @returns {Promise<Array>}
 */
export const listarAnamneses = async (pacienteId) => {
  try {
    const { data, error } = await supabase
      .from('anamneses')
      .select('*')
      .eq('paciente_id', pacienteId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao listar anamneses:', error);
    throw error;
  }
};

/**
 * Buscar anamnese por ID
 * @param {string} id
 * @returns {Promise<Object>}
 */
export const buscarAnamnese = async (id) => {
  const { data, error } = await supabase
    .from('anamneses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Criar nova anamnese
 * @param {string} pacienteId
 * @param {Object} anamnese
 * @returns {Promise<Object>}
 */
export const criarAnamnese = async (pacienteId, anamnese) => {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from('anamneses')
    .insert({
      ...anamnese,
      paciente_id: pacienteId,
      nutricionista_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Atualizar anamnese
 * @param {string} id
 * @param {Object} dados
 * @returns {Promise<Object>}
 */
export const atualizarAnamnese = async (id, dados) => {
  const { data, error } = await supabase
    .from('anamneses')
    .update(dados)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Deletar anamnese
 * @param {string} id
 */
export const deletarAnamnese = async (id) => {
  const { error } = await supabase
    .from('anamneses')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * Buscar última anamnese do paciente
 * @param {string} pacienteId
 * @returns {Promise<Object|null>}
 */
export const buscarUltimaAnamnese = async (pacienteId) => {
  const { data, error } = await supabase
    .from('anamneses')
    .select('*')
    .eq('paciente_id', pacienteId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = nenhum resultado
  return data || null;
};
