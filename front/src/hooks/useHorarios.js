import { useState, useCallback } from 'react';
import cliente from '../api/cliente';

export default function useHorarios() {
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

  const getHorarios = useCallback((params = {}) => {
    const qs = new URLSearchParams();
    if (params.grupo_id) qs.append('grupo_id', params.grupo_id);
    if (params.dia) qs.append('dia', params.dia);
    const query = qs.toString();
    return exec(() => cliente.get(`/horarios${query ? '?' + query : ''}`));
  }, [exec]);

  const getHorario = useCallback((id) => {
    return exec(() => cliente.get(`/horarios/${id}`));
  }, [exec]);

  const createHorario = useCallback((data) => {
    return exec(() => cliente.post('/horarios', data));
  }, [exec]);

  const updateHorario = useCallback((id, data) => {
    return exec(() => cliente.put(`/horarios/${id}`, data));
  }, [exec]);

  const deleteHorario = useCallback((id) => {
    return exec(() => cliente.del(`/horarios/${id}`));
  }, [exec]);

  return {
    data, loading, error,
    getHorarios, getHorario, createHorario, updateHorario, deleteHorario,
  };
}
