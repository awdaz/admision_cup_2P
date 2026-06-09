import { useState, useCallback } from 'react'
import cliente from '../api/cliente'

export default function useAdmisiones () {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const exec = useCallback(async (fn) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn()
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getAdmisiones = useCallback((estado = '') => {
    const qs = estado ? `?estado=${estado}` : ''
    return exec(() => cliente.get(`/admisiones${qs}`))
  }, [exec])

  const procesarAdmision = useCallback((admisionId) => {
    return exec(() => cliente.post(`/admisiones/${admisionId}/procesar`))
  }, [exec])

  const generarGrupos = useCallback((admisionId) => {
    return exec(() => cliente.post(`/admisiones/${admisionId}/generar-grupos`))
  }, [exec])

  const getCupos = useCallback((admisionId) => {
    return exec(() => cliente.get(`/admisiones/${admisionId}/cupos`))
  }, [exec])

  const getPostulantesCupo = useCallback((admisionId) => {
    return exec(() => cliente.get(`/admisiones/${admisionId}/postulantes-cupo`))
  }, [exec])

  return {
    loading,
    error,
    getAdmisiones,
    procesarAdmision,
    generarGrupos,
    getCupos,
    getPostulantesCupo
  }
}
