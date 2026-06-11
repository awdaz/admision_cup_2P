import { useState, useCallback } from 'react'
import cliente from '../api/cliente'

export default function usePagos () {
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

  const getPagos = useCallback((page = 1, estado = '', search = '') => {
    const params = new URLSearchParams({ page })
    if (estado) params.set('estado', estado)
    if (search) params.set('search', search)
    return exec(() => cliente.get(`/pagos?${params.toString()}`))
  }, [exec])

  const getPago = useCallback((id) => {
    return exec(() => cliente.get(`/pagos/${id}`))
  }, [exec])

  const createPago = useCallback((data) => {
    return exec(() => cliente.post('/pagos', data))
  }, [exec])

  const confirmarPago = useCallback((id) => {
    return exec(() => cliente.put(`/pagos/${id}/confirmar`))
  }, [exec])

  const libelulaCheckout = useCallback((postulacionId) => {
    return exec(() => cliente.post('/pagos/libelula/checkout', { postulacion_id: postulacionId }))
  }, [exec])

  const comprobarPago = useCallback((pagoId) => {
    return exec(() => cliente.get(`/pagos/${pagoId}`))
  }, [exec])

  return {
    loading,
    error,
    getPagos,
    getPago,
    createPago,
    confirmarPago,
    libelulaCheckout,
    comprobarPago
  }
}
