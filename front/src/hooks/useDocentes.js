import { useState, useCallback } from 'react';
import cliente from '../api/cliente';

export default function useDocentes() {
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

  const getDocentes = useCallback((page = 1, search = '') => {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (search) params.append('search', search);
    const qs = params.toString();
    return exec(() => cliente.get(`/docentes${qs ? '?' + qs : ''}`));
  }, [exec]);

  const getDocente = useCallback((id) => {
    return exec(() => cliente.get(`/docentes/${id}`));
  }, [exec]);

  const createDocente = useCallback((data) => {
    return exec(() => cliente.post('/docentes', data));
  }, [exec]);

  const updateDocente = useCallback((id, data) => {
    return exec(() => cliente.put(`/docentes/${id}`, data));
  }, [exec]);

  const deleteDocente = useCallback((id) => {
    return exec(() => cliente.del(`/docentes/${id}`));
  }, [exec]);

  const contratarDocente = useCallback((id) => {
    return exec(() => cliente.put(`/docentes/${id}/contratar`));
  }, [exec]);

  return {
    data, loading, error,
    getDocentes, getDocente,
    createDocente, updateDocente, deleteDocente,
    contratarDocente,
  };
}
