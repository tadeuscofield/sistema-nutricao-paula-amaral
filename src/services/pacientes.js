/**
 * Serviço de Pacientes com Supabase
 * Sistema de Nutrição Paula Amaral
 */

import { supabase, getCurrentUser } from '../lib/supabase';

/**
 * Listar todos os pacientes do nutricionista logado
 * @param {boolean} incluirArquivados
 * @returns {Promise<Array>}
 */
export const listarPacientes = async (incluirArquivados = false) => {
  try {
    let query = supabase
      .from('pacientes')
      .select('*')
      .order('nome');

    if (!incluirArquivados) {
      query = query.eq('arquivado', false);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao listar pacientes:', error);
    throw error;
  }
};

/**
 * Buscar paciente por ID
 * @param {string} id
 * @returns {Promise<Object>}
 */
export const buscarPaciente = async (id) => {
  const { data, error } = await supabase
    .from('pacientes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Criar novo paciente
 * @param {Object} paciente
 * @returns {Promise<Object>}
 */
export const criarPaciente = async (paciente) => {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from('pacientes')
    .insert({
      ...paciente,
      nutricionista_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Atualizar paciente
 * @param {string} id
 * @param {Object} dados
 * @returns {Promise<Object>}
 */
export const atualizarPaciente = async (id, dados) => {
  const { data, error } = await supabase
    .from('pacientes')
    .update(dados)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Arquivar/Desarquivar paciente
 * @param {string} id
 * @param {boolean} arquivado
 * @returns {Promise<Object>}
 */
export const arquivarPaciente = async (id, arquivado = true) => {
  return atualizarPaciente(id, { arquivado });
};

/**
 * Deletar paciente (permanentemente)
 * @param {string} id
 */
export const deletarPaciente = async (id) => {
  const { error } = await supabase
    .from('pacientes')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * Buscar pacientes por nome (busca)
 * @param {string} termo
 * @returns {Promise<Array>}
 */
export const buscarPacientesPorNome = async (termo) => {
  const { data, error } = await supabase
    .from('pacientes')
    .select('*')
    .ilike('nome', `%${termo}%`)
    .eq('arquivado', false)
    .order('nome')
    .limit(10);

  if (error) throw error;
  return data || [];
};

/**
 * Contar pacientes ativos
 * @returns {Promise<number>}
 */
export const contarPacientesAtivos = async () => {
  const { count, error } = await supabase
    .from('pacientes')
    .select('*', { count: 'exact', head: true })
    .eq('arquivado', false);

  if (error) throw error;
  return count || 0;
};
