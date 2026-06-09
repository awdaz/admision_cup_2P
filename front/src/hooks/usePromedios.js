import { useState, useCallback } from 'react';
import cliente from '../api/cliente';

export default function usePromedios() {
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

  const getPromedios = useCallback((postulacionId) => {
    return exec(() => cliente.get(`/postulaciones/${postulacionId}/promedios`));
  }, [exec]);

  const recalcularPromedios = useCallback((postulacionId) => {
    return exec(() => cliente.post(`/postulaciones/${postulacionId}/recalcular-promedios`));
  }, [exec]);

  return {
    data, loading, error,
    getPromedios, recalcularPromedios,
  };
}
