import { useState, useCallback } from 'react';
import cliente from '../api/cliente';

export default function useReportes() {
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

  const getReporteAdmision = useCallback(() => {
    return exec(() => cliente.get('/reportes/admision'));
  }, [exec]);

  const getReporteDocenteMisGrupos = useCallback(() => {
    return exec(() => cliente.get('/reportes/docente/mis-grupos'));
  }, [exec]);

  const getReportePostulanteMisNotas = useCallback(() => {
    return exec(() => cliente.get('/reportes/postulante/mis-notas'));
  }, [exec]);

  return {
    data, loading, error,
    getReporteAdmision, getReporteDocenteMisGrupos, getReportePostulanteMisNotas,
  };
}
