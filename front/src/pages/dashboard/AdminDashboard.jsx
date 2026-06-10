import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import useReportes from '../../hooks/useReportes'
import useAdmisiones from '../../hooks/useAdmisiones'
import cliente from '../../api/cliente'
import Loader from '../../components/ui/Loader'
import StatCard from '../../components/ui/StatCard'
import ProgressBar from '../../components/ui/ProgressBar'
import FormCard from '../../components/ui/FormCard'

export default function AdminDashboard () {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { getReporteAdmision, loading: loadingReporte } = useReportes()
  const { getCupos } = useAdmisiones()
  const [data, setData] = useState(null)
  const [cupos, setCupos] = useState(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const d = await cliente.get('/dashboard/stats')
        setStats(d)
      } catch (err) {
        toast.error(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const d = await getReporteAdmision()
        if (d) setData(d)
      } catch (err) { toast.error(err.message) }
    })()
  }, [getReporteAdmision])

  useEffect(() => {
    (async () => {
      try {
        const d = await getCupos(1)
        if (d) setCupos(d)
      } catch { /* error al cargar cupos */ }
    })()
  }, [getCupos])

  if (loading) return <Loader />

  const resumen = data?.resumen || {}

  return (
    <div>
      <div className='row g-4 mb-4'>
        <StatCard title='Total Postulantes' value={stats?.total_postulantes} color='primary' icon='bi bi-people' colClass='col-12 col-sm-6 col-xl-3' />
        <StatCard title='Postulantes Verificados' value={stats?.postulantes_verificados} color='success' icon='bi bi-check-circle' colClass='col-12 col-sm-6 col-xl-3' />
        <StatCard title='Pagos Pendientes' value={stats?.pagos_pendientes} color='warning' icon='bi bi-clock' colClass='col-12 col-sm-6 col-xl-3' />
        <StatCard title='Pagos Confirmados' value={stats?.pagos_confirmados} color='info' icon='bi bi-credit-card' colClass='col-12 col-sm-6 col-xl-3' />
      </div>

      {loadingReporte && !data
        ? <div className='text-center py-5'><div className='spinner-border text-primary' /></div>
        : (
          <>
            <div className='row g-3 mb-4'>
              <StatCard title='Postulantes' value={resumen.total_postulantes} color='primary' variant='bg' />
              <StatCard title='Postulaciones' value={resumen.total_postulaciones} color='info' variant='bg' />
              <StatCard title='Inscritos' value={resumen.inscritos} color='success' variant='bg' />
              <StatCard title='Admitidos' value={resumen.admitidos} color='warning' variant='bg' />
            </div>

            <div className='row g-3 mb-4'>
              <div className='col-md-6'>
                <FormCard title='Distribucion por Estado' className='h-100'>
                  {(function () {
                    const total = (resumen.inscritos || 0) + (resumen.admitidos || 0) + (resumen.pendientes || 0)
                    const items = [
                      { label: 'Inscritos', value: resumen.inscritos || 0, color: 'info' },
                      { label: 'Admitidos', value: resumen.admitidos || 0, color: 'success' },
                      { label: 'Pendientes', value: resumen.pendientes || 0, color: 'warning' }
                    ]
                    return items.map((item) => (
                      <div key={item.label} className='mb-2'>
                        <div className='d-flex justify-content-between'>
                          <span>{item.label}</span>
                          <span>{total > 0 ? Math.round((item.value / total) * 100) : 0}% ({item.value})</span>
                        </div>
                        <div className='progress' style={{ height: 12 }}>
                          <div className={'progress-bar bg-' + item.color} style={{ width: total > 0 ? ((item.value / total) * 100) + '%' : '0%' }} />
                        </div>
                      </div>
                    ))
                  })()}
                </FormCard>
              </div>
              <div className='col-md-6'>
                <FormCard title='Pagos' className='h-100'>
                  <div className='mb-2'>
                    <div className='d-flex justify-content-between'>
                      <span>Confirmados</span>
                      <span>${resumen.pagos_confirmados || 0}</span>
                    </div>
                  </div>
                  <div className='mb-2'>
                    <div className='d-flex justify-content-between'>
                      <span>Pendientes</span>
                      <span>{resumen.pagos_pendientes || 0} pagos</span>
                    </div>
                  </div>
                  <hr />
                  <div className='d-flex justify-content-between'>
                    <strong>Total pagos confirmados</strong>
                    <strong>${resumen.pagos_confirmados || 0}</strong>
                  </div>
                </FormCard>
              </div>
            </div>

            <div className='table-responsive mb-4'>
              <table className='table table-hover table-striped align-middle'>
                <thead className='table-light'>
                  <tr>
                    <th>Carrera</th>
                    <th>Inscritos</th>
                    <th>Admitidos</th>
                    <th>Total Postulaciones</th>
                    <th>Ocupacion</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.por_carrera || []).map((c) => {
                    const cupo = cupos?.carreras?.find((cx) => cx.id === c.id)
                    const ocupacion = cupo?.cupo > 0 ? Math.round((cupo.admitidos / cupo.cupo) * 100) : 0
                    return (
                      <tr key={c.id}>
                        <td>{c.nombre}</td>
                        <td>{c.inscritos || 0}</td>
                        <td>{c.admitidos || 0}</td>
                        <td>{c.total_postulaciones || 0}</td>
                        <td style={{ width: 200 }}>
                          <ProgressBar value={ocupacion} height={20}>
                            {cupo ? (cupo.admitidos + '/' + cupo.cupo) : '-'}
                          </ProgressBar>
                        </td>
                      </tr>
                    )
                  })}
                  {(data?.por_carrera || []).length === 0 && (
                    <tr><td colSpan='5' className='text-center text-muted'>No hay datos</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className='text-end'>
              <button className='btn btn-outline-secondary' onClick={() => window.print()}>
                <i className='bi bi-printer me-1' />Imprimir Reporte
              </button>
            </div>
          </>
          )}
    </div>
  )
}
