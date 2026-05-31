import { useState, useCallback } from 'react';
import cliente from '../api/cliente';

export default function useGrupos() {
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

  const getGrupos = useCallback((page = 1, params = {}) => {
    const qs = new URLSearchParams();
    qs.append('page', page);
    if (params.materia_id) qs.append('materia_id', params.materia_id);
    if (params.turno_id) qs.append('turno_id', params.turno_id);
    const query = qs.toString();
    return exec(() => cliente.get(`/grupos${query ? '?' + query : ''}`));
  }, [exec]);

  const getGrupo = useCallback((id) => {
    return exec(() => cliente.get(`/grupos/${id}`));
  }, [exec]);

  const createGrupo = useCallback((data) => {
    return exec(() => cliente.post('/grupos', data));
  }, [exec]);

  const updateGrupo = useCallback((id, data) => {
    return exec(() => cliente.put(`/grupos/${id}`, data));
  }, [exec]);

  const deleteGrupo = useCallback((id) => {
    return exec(() => cliente.del(`/grupos/${id}`));
  }, [exec]);

  return {
    data, loading, error,
    getGrupos, getGrupo,
    createGrupo, updateGrupo, deleteGrupo,
  };
}
