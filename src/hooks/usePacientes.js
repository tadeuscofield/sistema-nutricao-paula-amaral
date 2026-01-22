/**
 * Hook customizado para gerenciar pacientes com Supabase
 * Sistema de Nutrição Paula Amaral
 */

import { useState, useEffect } from 'react';
import {
  listarPacientes,
  buscarPaciente,
  criarPaciente,
  atualizarPaciente,
  arquivarPaciente,
  deletarPaciente
} from '../services/pacientes';

export const usePacientes = (isAuthenticated) => {
  const [pacientes, setPacientes] = useState([]);
  const [pacientesArquivados, setPacientesArquivados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carregar pacientes quando autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      setPacientes([]);
      setPacientesArquivados([]);
      return;
    }

    carregarPacientes();
  }, [isAuthenticated]);

  const carregarPacientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const ativos = await listarPacientes(false);
      const arquivados = await listarPacientes(true);

      setPacientes(ativos.filter(p => !p.arquivado));
      setPacientesArquivados(arquivados.filter(p => p.arquivado));
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const salvarPaciente = async (dadosPaciente) => {
    try {
      if (dadosPaciente.id) {
        // Atualizar existente
        const atualizado = await atualizarPaciente(dadosPaciente.id, dadosPaciente);
        setPacientes(prev => prev.map(p => p.id === atualizado.id ? atualizado : p));
        return atualizado;
      } else {
        // Criar novo
        const novo = await criarPaciente(dadosPaciente);
        setPacientes(prev => [...prev, novo]);
        return novo;
      }
    } catch (err) {
      console.error('Erro ao salvar paciente:', err);
      throw err;
    }
  };

  const arquivar = async (id, arquivado = true) => {
    try {
      const atualizado = await arquivarPaciente(id, arquivado);

      if (arquivado) {
        // Move para arquivados
        setPacientes(prev => prev.filter(p => p.id !== id));
        setPacientesArquivados(prev => [...prev, atualizado]);
      } else {
        // Restaura de arquivados
        setPacientesArquivados(prev => prev.filter(p => p.id !== id));
        setPacientes(prev => [...prev, atualizado]);
      }

      return atualizado;
    } catch (err) {
      console.error('Erro ao arquivar paciente:', err);
      throw err;
    }
  };

  const deletar = async (id) => {
    try {
      await deletarPaciente(id);
      setPacientes(prev => prev.filter(p => p.id !== id));
      setPacientesArquivados(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Erro ao deletar paciente:', err);
      throw err;
    }
  };

  return {
    pacientes,
    pacientesArquivados,
    loading,
    error,
    carregarPacientes,
    salvarPaciente,
    arquivar,
    deletar
  };
};
