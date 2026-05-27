import { useState, useCallback } from 'react';
import cliente from '../api/cliente';

export default function usePagos() {
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

  const getPagos = useCallback((page = 1) => {
    return exec(() => cliente.get(`/pagos?page=${page}`));
  }, [exec]);

  const getPago = useCallback((id) => {
    return exec(() => cliente.get(`/pagos/${id}`));
  }, [exec]);

  const createPago = useCallback((data) => {
    return exec(() => cliente.post('/pagos', data));
  }, [exec]);

  const confirmarPago = useCallback((id) => {
    return exec(() => cliente.put(`/pagos/${id}/confirmar`));
  }, [exec]);

  return {
    data, loading, error,
    getPagos, getPago, createPago, confirmarPago,
  };
}
