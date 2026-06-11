import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import cliente from '../../api/cliente'
import { toast } from 'sonner'
import Loader from '../../components/ui/Loader'
import SubmitButton from '../../components/ui/SubmitButton'
import CancelButton from '../../components/ui/CancelButton'

export default function RequisitosPage () {
  const { id } = useParams()
  const [requisitos, setRequisitos] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [verificado, setVerificado] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const data = await cliente.get(`/postulantes/${id}/requisitos`)
        const list = Array.isArray(data) ? data : data.data || data.requisitos || []
        setRequisitos(list)
      } catch (err) {
        toast.error(err.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const cumplidos = useMemo(() => requisitos.filter((r) => r.cumplido).length, [requisitos])
  const total = requisitos.length
  const todosCumplidos = total > 0 && cumplidos === total

  const toggleRequisito = (index) => {
    setRequisitos((prev) =>
      prev.map((r, i) => (i === index ? { ...r, cumplido: !r.cumplido } : r))
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await cliente.put(`/postulantes/${id}/requisitos`, { requisitos })
      setVerificado(todosCumplidos)
      toast.success(res?.message || 'Requisitos actualizados correctamente')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className='row justify-content-center'>
      <div className='col-lg-8'>
        <div className='d-flex justify-content-end mb-4'>
          <CancelButton to='/postulantes' />
        </div>

        <div className='card shadow-sm'>
          <div className='card-header d-flex justify-content-between align-items-center'>
            <strong>Requisitos del Postulante</strong>
            {total > 0 && (
              <span className={`badge ${todosCumplidos ? 'bg-success' : 'bg-warning text-dark'}`}>
                {cumplidos}/{total} cumplidos
              </span>
            )}
          </div>
          <div className='card-body'>
            {requisitos.length === 0
              ? (
                <p className='text-muted mb-0'>No hay requisitos configurados</p>
                )
              : (
                <>
                  <div className='list-group list-group-flush'>
                    {requisitos.map((req, idx) => (
                      <div
                        key={req.requisito_id || idx}
                        className='list-group-item d-flex align-items-center gap-3'
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleRequisito(idx)}
                      >
                        <input
                          type='checkbox'
                          className='form-check-input'
                          checked={!!req.cumplido}
                          onChange={() => toggleRequisito(idx)}
                          id={`req-${idx}`}
                        />
                        <label className='form-check-label flex-grow-1' htmlFor={`req-${idx}`}>
                          {req.nombre || req.requisito_nombre || `Requisito ${idx + 1}`}
                        </label>
                        <i className={`bi ${req.cumplido ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted'}`} />
                      </div>
                    ))}
                  </div>
                  {(todosCumplidos || verificado) && (
                    <div className='alert alert-success mt-3 mb-0 d-flex align-items-center gap-2'>
                      <i className='bi bi-check-circle-fill' />
                      <span>Todos los requisitos cumplidos. El postulante ya puede postular.</span>
                    </div>
                  )}
                </>
                )}
          </div>
          {requisitos.length > 0 && (
            <div className='card-footer d-flex justify-content-end gap-2'>
              <SubmitButton loading={saving} label='Guardar Cambios' onClick={handleSave} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
