import { useState, useCallback } from 'react';
import cliente from '../api/cliente';

export default function useExamenes() {
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

  const getExamenes = useCallback((page = 1, grupoId = '') => {
    const qs = new URLSearchParams();
    qs.append('page', page);
    if (grupoId) qs.append('grupo_id', grupoId);
    return exec(() => cliente.get(`/examenes?${qs}`));
  }, [exec]);

  const getExamen = useCallback((id) => {
    return exec(() => cliente.get(`/examenes/${id}`));
  }, [exec]);

  const createExamen = useCallback((data) => {
    return exec(() => cliente.post('/examenes', data));
  }, [exec]);

  const updateExamen = useCallback((id, data) => {
    return exec(() => cliente.put(`/examenes/${id}`, data));
  }, [exec]);

  const deleteExamen = useCallback((id) => {
    return exec(() => cliente.del(`/examenes/${id}`));
  }, [exec]);

  const getExamenRindes = useCallback((id) => {
    return exec(() => cliente.get(`/examenes/${id}/rindes`));
  }, [exec]);

  return {
    data, loading, error,
    getExamenes, getExamen, createExamen, updateExamen, deleteExamen,
    getExamenRindes,
  };
}
