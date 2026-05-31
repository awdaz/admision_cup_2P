import { useState, useCallback } from 'react';
import cliente from '../api/cliente';

export default function usePostulaciones() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const exec = useCallback(async (fn) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPostulaciones = useCallback((page = 1, filters = {}) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.admision_id) params.append('admision_id', filters.admision_id);
    if (filters.postulante_id) params.append('postulante_id', filters.postulante_id);
    const qs = params.toString();
    return exec(() => cliente.get(`/postulaciones${qs ? '?' + qs : ''}`));
  }, [exec]);

  const getPostulacion = useCallback((id) => {
    return exec(() => cliente.get(`/postulaciones/${id}`));
  }, [exec]);

  const createPostulacion = useCallback((data) => {
    return exec(() => cliente.post('/postulaciones', data));
  }, [exec]);

  const cancelarPostulacion = useCallback((id) => {
    return exec(() => cliente.put(`/postulaciones/${id}/cancelar`));
  }, [exec]);

  return {
    data, loading, error,
    getPostulaciones, getPostulacion, createPostulacion, cancelarPostulacion,
  };
}
