/**
 * Hook customizado para autenticação com Supabase
 * Sistema de Nutrição Paula Amaral
 */

import { useState, useEffect } from 'react';
import { login as loginService, logout as logoutService, getSession, onAuthStateChange } from '../services/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [nutricionista, setNutricionista] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar sessão ao carregar
  useEffect(() => {
    checkSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setNutricionista(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const session = await getSession();
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        // Buscar dados do nutricionista
        // TODO: carregar nutricionista do banco
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, senha) => {
    try {
      const { user, nutricionista } = await loginService(email, senha);
      setUser(user);
      setNutricionista(nutricionista);
      setIsAuthenticated(true);
      return { user, nutricionista };
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutService();
      setUser(null);
      setNutricionista(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  };

  return {
    user,
    nutricionista,
    isAuthenticated,
    loading,
    login,
    logout
  };
};
