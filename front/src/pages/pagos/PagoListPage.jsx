import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { confirmDialog } from '../../utils/confirmDialog'
import usePagos from '../../hooks/usePagos'
import usePostulaciones from '../../hooks/usePostulaciones'
import useList from '../../hooks/useList'
import DataTable from '../../components/ui/DataTable'
import HeaderBar from '../../components/ui/HeaderBar'
import BadgeStatus from '../../components/ui/BadgeStatus'
import Pagination from '../../components/ui/Pagination'
import useAuthStore from '../../store/authStore'
import { ESTADOS, str } from '../../constants'

// Caso de Uso: CU07 — Realizar pago
const MONTO_FIJO = 700

export default function PagoListPage () {
  const user = useAuthStore((s) => s.user)
  const esAdmin = user?.tipo === 'admin'
  const esPostulante = user?.tipo === 'postulante'

  const { getPagos, confirmarPago, libelulaCheckout, comprobarPago, loading: loadingHook } = usePagos()
  const { getPostulaciones } = usePostulaciones()

  const [filtroEstado, setFiltroEstado] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const { items: pagos, pagination, page, setPage, loading, load } = useList(
    (p, estado, search) => getPagos(p, estado || '', search || ''),
    [filtroEstado, searchTerm]
  )

  const [showModal, setShowModal] = useState(false)
  const [postulaciones, setPostulaciones] = useState([])
  const [postulacionId, setPostulacionId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [comprobarPagoId, setComprobarPagoId] = useState('')
  const [comprobando, setComprobando] = useState(false)
  const [resultadoComprobacion, setResultadoComprobacion] = useState(null)

  useEffect(() => {
    if (esPostulante) {
      getPostulaciones(1, { per_page: 100 }).then((res) => {
        const list = res?.data ?? []
        setPostulaciones(list)
      }).catch(() => {})
    }
  }, [esPostulante, getPostulaciones])

  const totalPages = useMemo(() =>
    Math.ceil((pagination?.total || 1) / (pagination?.per_page || 10)),
  [pagination]
  )

  const handleConfirmar = async (row) => {
    if (!await confirmDialog(`¿Confirmar pago de Bs. ${row.monto}?`, 'Confirmar')) return
    try {
      await confirmarPago(row.id)
      toast.success('Pago confirmado correctamente')
      load(page)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleGenerarPago = async (e) => {
    e.preventDefault()
    if (!postulacionId) return
    setSubmitting(true)

    try {
      await libelulaCheckout(postulacionId)
      setShowModal(false)
      setPostulacionId('')
      load(page)
      window.open('https://libelula.bo/', '_blank')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleComprobarPago = async () => {
    if (!comprobarPagoId.trim()) return
    setComprobando(true)
    setResultadoComprobacion(null)
    try {
      const pago = await comprobarPago(comprobarPagoId.trim())
      if (pago.estado === str(ESTADOS.PAGO.PENDIENTE) && pago.gateway === 'libelula') {
        if (await confirmDialog(`¿Confirmar pago BS. ${pago.monto} como pagado?`, 'Sí, pagado')) {
          await confirmarPago(pago.id)
          toast.success('Pago confirmado correctamente')
          load(page)
          const updated = await comprobarPago(comprobarPagoId.trim())
          setResultadoComprobacion(updated)
        }
      } else {
        setResultadoComprobacion(pago)
        toast.success(`Pago #${pago.id}: ${pago.estado}`)
      }
    } catch (err) {
      setResultadoComprobacion(null)
      toast.error(err.message)
    } finally {
      setComprobando(false)
    }
  }

  const columns = [
    { key: 'numero_recibo', label: 'Recibo', render: (row) => row.numero_recibo || row.id || '-' },
    ...(esAdmin
      ? [{
          key: 'postulante',
          label: 'Postulante',
          render: (row) => {
            const nombre = row.postulante_nombre || row.postulante?.persona?.nombre || ''
            const apellido = row.postulante_apellido || row.postulante?.persona?.apellido || ''
            return `${nombre} ${apellido}`.trim() || '-'
          }
        }]
      : []),
    {
      key: 'monto',
      label: 'Monto',
      render: (row) => `Bs. ${row.monto || 0}`
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (row) => {
        const map = { [str(ESTADOS.PAGO.PENDIENTE)]: 'warning', [str(ESTADOS.PAGO.CONFIRMADO)]: 'success', [str(ESTADOS.PAGO.RECHAZADO)]: 'danger' }
        return <BadgeStatus value={row.estado || '-'} colors={map} />
      }
    },
    {
      key: 'fecha',
      label: 'Fecha',
      render: (row) => row.fecha || row.created_at || '-'
    },
    ...(esAdmin
      ? [{
          key: 'accion',
          label: '',
          render: (row) =>
            row.estado === str(ESTADOS.PAGO.PENDIENTE)
              ? (
                <button
                  className='btn btn-sm btn-outline-success'
                  onClick={async () => {
                    if (!await confirmDialog(`¿Confirmar pago BS. ${row.monto} como pagado?`, 'Sí, pagado')) return
                    try {
                      await confirmarPago(row.id)
                      toast.success('Pago confirmado correctamente')
                      load(page)
                    } catch (err) {
                      toast.error(err.message)
                    }
                  }}
                >
                  <i className='bi bi-check-lg me-1' />Comprobar
                </button>
                )
              : null
        }]
      : [])
  ]

  return (
    <div>
      <HeaderBar
        {...(esPostulante ? { createLabel: 'Realizar Pago', onCreate: () => setShowModal(true) } : {})}
      >
        <h5 className='mb-0'>{esAdmin ? 'Pagos' : 'Mis Pagos'}</h5>
      </HeaderBar>

      {esAdmin && (
        <div className='d-flex flex-wrap gap-2 align-items-center mb-3'>
          <div style={{ flex: '1 1 clamp(160px, 25%, 280px)' }}>
            <input
              type='text'
              className='form-control form-control-sm'
              placeholder='Buscar por nombre...'
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
            />
          </div>
          <span className='text-muted small me-1'>Estado:</span>
          <select
            className='form-select form-select-sm'
            style={{ width: 'auto' }}
            value={filtroEstado}
            onChange={(e) => { setFiltroEstado(e.target.value); setPage(1) }}
          >
            <option value=''>Todos</option>
            <option value={str(ESTADOS.PAGO.PENDIENTE)}>Pendientes</option>
            <option value={str(ESTADOS.PAGO.CONFIRMADO)}>Confirmados</option>
            <option value={str(ESTADOS.PAGO.RECHAZADO)}>Rechazados</option>
          </select>
        </div>
      )}

      <div className='card shadow-sm'>
        <div className='card-body p-0'>
          <DataTable
            columns={columns}
            data={pagos}
            loading={loading || loadingHook}
            onEdit={esAdmin
              ? (row) => row.estado === str(ESTADOS.PAGO.PENDIENTE) ? handleConfirmar(row) : null
              : null}
          />
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} setPage={setPage} simple />

      {esPostulante && (
        <div className='card shadow-sm mt-3'>
          <div className='card-body'>
            <h6 className='mb-3'><i className='bi bi-search me-2' />Comprobar Pago</h6>
            <div className='d-flex flex-wrap gap-2 align-items-end'>
              <div style={{ flex: '1 1 clamp(200px, 30%, 300px)' }}>
                <label className='form-label small'>N° de Recibo o ID del Pago</label>
                <input
                  type='text'
                  className='form-control form-control-sm'
                  placeholder='Ej: REC-000001 o ID'
                  value={comprobarPagoId}
                  onChange={(e) => setComprobarPagoId(e.target.value)}
                />
              </div>
              <div>
                <button
                  className='btn btn-outline-primary btn-sm'
                  disabled={comprobando || !comprobarPagoId.trim()}
                  onClick={handleComprobarPago}
                >
                  {comprobando ? 'Comprobando...' : 'Comprobar'}
                </button>
              </div>
            </div>
            {resultadoComprobacion && (
              <div className='mt-3 p-3 rounded bg-light'>
                <strong>Recibo:</strong> {resultadoComprobacion.numero_recibo || '-'} <span className='mx-2'>|</span>
                <strong>Monto:</strong> Bs. {resultadoComprobacion.monto || 0} <span className='mx-2'>|</span>
                <strong>Estado:</strong>{' '}
                <BadgeStatus
                  value={resultadoComprobacion.estado || '-'}
                  colors={{ [str(ESTADOS.PAGO.PENDIENTE)]: 'warning', [str(ESTADOS.PAGO.CONFIRMADO)]: 'success', [str(ESTADOS.PAGO.RECHAZADO)]: 'danger' }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className='modal d-block' tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <form onSubmit={handleGenerarPago}>
                <div className='modal-header'>
                  <h5 className='modal-title'>Realizar Pago</h5>
                  <button type='button' className='btn-close' onClick={() => setShowModal(false)} />
                </div>
                <div className='modal-body'>
                  <div className='mb-3'>
                    <label className='form-label'>Postulación</label>
                    <select
                      className='form-select'
                      value={postulacionId}
                      onChange={(e) => setPostulacionId(e.target.value)}
                      required
                    >
                      <option value=''>Seleccione una postulación</option>
                      {postulaciones.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.carrera_rel?.nombre || p.carrera_nombre || `Postulación #${p.id}`}
                          {p.estado ? ` — ${p.estado}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='mb-3'>
                    <label className='form-label'>Monto</label>
                    <div className='form-control bg-light'><strong>Bs. {MONTO_FIJO}.00</strong></div>
                    <small className='text-muted'>Monto fijo de inscripción.</small>
                  </div>
                </div>
                <div className='modal-footer'>
                  <button type='button' className='btn btn-secondary' onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type='submit' className='btn btn-primary' disabled={submitting || !postulacionId}>
                    {submitting ? 'Generando...' : 'Generar Pago'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
