import { useState, useCallback } from 'react';
import cliente from '../api/cliente';

export default function usePostulantes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const exec = useCallback(async (fn) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPostulantes = useCallback((page = 1, search = '', perPage = null) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (search) params.append('search', search);
    if (perPage) params.append('per_page', perPage);
    const qs = params.toString();
    return exec(() => cliente.get(`/postulantes${qs ? '?' + qs : ''}`));
  }, [exec]);

  const getPostulante = useCallback((id) => {
    return exec(() => cliente.get(`/postulantes/${id}`));
  }, [exec]);

  const createPostulante = useCallback((data) => {
    return exec(() => cliente.post('/postulantes', data));
  }, [exec]);

  const updatePostulante = useCallback((id, data) => {
    return exec(() => cliente.put(`/postulantes/${id}`, data));
  }, [exec]);

  const deletePostulante = useCallback((id) => {
    return exec(() => cliente.del(`/postulantes/${id}`));
  }, [exec]);

  const buscarPostulante = useCallback((ci) => {
    return exec(() => cliente.get(`/postulantes/buscar/${ci}`));
  }, [exec]);

  return {
    loading, error,
    getPostulantes, getPostulante,
    createPostulante, updatePostulante, deletePostulante,
    buscarPostulante,
  };
}
