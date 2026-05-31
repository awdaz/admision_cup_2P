import { useState, useCallback } from 'react';
import cliente from '../api/cliente';

export default function useRindes() {
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

  const getRindes = useCallback((page = 1, examenId = '') => {
    const qs = new URLSearchParams();
    qs.append('page', page);
    if (examenId) qs.append('examen_id', examenId);
    return exec(() => cliente.get(`/rindes?${qs}`));
  }, [exec]);

  const storeRinde = useCallback((data) => {
    return exec(() => cliente.post('/rindes', data));
  }, [exec]);

  const deleteRinde = useCallback((id) => {
    return exec(() => cliente.del(`/rindes/${id}`));
  }, [exec]);

  const getRindesByPostulacion = useCallback((postulacionId) => {
    return exec(() => cliente.get(`/rindes/postulacion/${postulacionId}`));
  }, [exec]);

  return {
    data, loading, error,
    getRindes, storeRinde, deleteRinde, getRindesByPostulacion,
  };
}
