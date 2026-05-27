import { useState, useCallback } from 'react';
import cliente from '../api/cliente';

export default function useCatalogos() {
  const [carreras, setCarreras] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [semestres, setSemestres] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [requisitos, setRequisitos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const exec = useCallback(async (fn) => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCarreras = useCallback(async () => {
    const data = await exec(() => cliente.get('/carreras'));
    setCarreras(data || []);
    return data;
  }, [exec]);

  const getTurnos = useCallback(async () => {
    const data = await exec(() => cliente.get('/turnos'));
    setTurnos(data || []);
    return data;
  }, [exec]);

  const getSemestres = useCallback(async () => {
    const data = await exec(() => cliente.get('/semestres'));
    setSemestres(data || []);
    return data;
  }, [exec]);

  const getMaterias = useCallback(async () => {
    const data = await exec(() => cliente.get('/materias'));
    setMaterias(data || []);
    return data;
  }, [exec]);

  const getRequisitos = useCallback(async () => {
    const data = await exec(() => cliente.get('/requisitos'));
    setRequisitos(data || []);
    return data;
  }, [exec]);

  return {
    carreras, turnos, semestres, materias, requisitos,
    loading, error,
    getCarreras, getTurnos, getSemestres, getMaterias, getRequisitos,
  };
}
