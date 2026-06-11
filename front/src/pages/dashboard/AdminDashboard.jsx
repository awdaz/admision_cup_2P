import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import useReportes from '../../hooks/useReportes'
import cliente from '../../api/cliente'
import Loader from '../../components/ui/Loader'
import StatCard from '../../components/ui/StatCard'
import ProgressBar from '../../components/ui/ProgressBar'
import FormCard from '../../components/ui/FormCard'
import ExportButtons from '../../components/ui/ExportButtons'

// Casos de Uso: CU13 (Visualizar dashboard), CU14 (Generar reportes)
export default function AdminDashboard () {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { getPromediosGlobales, getEstadisticasMaterias, getGruposRankingAprobados } = useReportes()
  const [promedios, setPromedios] = useState(null)
  const [materias, setMaterias] = useState(null)
  const [ranking, setRanking] = useState(null)
  const [tab, setTab] = useState('promedios')

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
        const d = await getPromediosGlobales()
        if (d) setPromedios(d)
      } catch { /* ignore */ }
    })()
  }, [getPromediosGlobales])

  useEffect(() => {
    (async () => {
      try {
        const d = await getEstadisticasMaterias()
        if (d) setMaterias(d)
      } catch { /* ignore */ }
    })()
  }, [getEstadisticasMaterias])

  useEffect(() => {
    (async () => {
      try {
        const d = await getGruposRankingAprobados()
        if (d) setRanking(d)
      } catch { /* ignore */ }
    })()
  }, [getGruposRankingAprobados])

  const colsPromedios = useMemo(() => [
    { key: 'rango', label: 'Rango' },
    { key: 'cantidad', label: 'Cantidad' }
  ], [])

  const colsMaterias = useMemo(() => [
    { label: 'Materia', render: (r) => `${r.nombre} (${r.codigo})` },
    { key: 'peso', label: 'Peso (%)' },
    { key: 'total_estudiantes', label: 'Estudiantes' },
    { key: 'promedio_general', label: 'Prom. General' },
    { key: 'aprobados', label: 'Aprobados' },
    { key: 'reprobados', label: 'Reprobados' },
    { label: '% Aprobación', render: (r) => r.total_estudiantes > 0 ? Math.round((r.aprobados / r.total_estudiantes) * 100) + '%' : '0%' }
  ], [])

  const colsRanking = useMemo(() => [
    { label: '#', render: (r, i) => i + 1 },
    { label: 'Grupo', render: (r) => `${r.codigo} - ${r.nombre}` },
    { key: 'materia_nombre', label: 'Materia' },
    { key: 'docente_nombre', label: 'Docente' },
    { key: 'turno_nombre', label: 'Turno' },
    { key: 'total_estudiantes', label: 'Estudiantes' },
    { key: 'aprobados', label: 'Aprobados' },
    { key: 'porcentaje_aprobacion', label: '% Aprobación' }
  ], [])

  if (loading) return <Loader />

  return (
    <div>
      <div className='row g-4 mb-4'>
        <StatCard title='Total Postulantes' value={stats?.total_postulantes} color='primary' icon='bi bi-people' colClass='col-12 col-sm-6 col-xl-3' />
        <StatCard title='Postulantes Verificados' value={stats?.postulantes_verificados} color='success' icon='bi bi-check-circle' colClass='col-12 col-sm-6 col-xl-3' />
        <StatCard title='Pagos Pendientes' value={stats?.pagos_pendientes} color='warning' icon='bi bi-clock' colClass='col-12 col-sm-6 col-xl-3' />
        <StatCard title='Pagos Confirmados' value={stats?.pagos_confirmados} color='info' icon='bi bi-credit-card' colClass='col-12 col-sm-6 col-xl-3' />
        <StatCard title='Postulaciones Inscritas' value={stats?.postulaciones_inscritas} color='primary' icon='bi bi-journal-check' colClass='col-12 col-sm-6 col-xl-3' />
        <StatCard title='Grupos Habilitados' value={stats?.total_grupos} color='success' icon='bi bi-people-fill' colClass='col-12 col-sm-6 col-xl-3' />
        <StatCard title='Docentes' value={stats?.total_docentes} color='info' icon='bi bi-person-workspace' colClass='col-12 col-sm-6 col-xl-3' />
        <StatCard title='Materias' value={stats?.total_materias} color='secondary' icon='bi bi-book' colClass='col-12 col-sm-6 col-xl-3' />
      </div>

      <ul className='nav nav-tabs mb-3'>
        <li className='nav-item'>
          <button className={`nav-link ${tab === 'promedios' ? 'active' : ''}`} onClick={() => setTab('promedios')}>
            <i className='bi bi-bar-chart me-1' />Promedios Globales
          </button>
        </li>
        <li className='nav-item'>
          <button className={`nav-link ${tab === 'materias' ? 'active' : ''}`} onClick={() => setTab('materias')}>
            <i className='bi bi-book me-1' />Estadísticas por Materia
          </button>
        </li>
        <li className='nav-item'>
          <button className={`nav-link ${tab === 'ranking' ? 'active' : ''}`} onClick={() => setTab('ranking')}>
            <i className='bi bi-trophy me-1' />Ranking de Grupos
          </button>
        </li>
      </ul>

      {tab === 'promedios' && promedios && (
        <div className='row g-3 mb-4'>
          <div className='col-md-6'>
            <FormCard title='Resumen de Promedios' className='h-100'>
              <div className='mb-2 d-flex justify-content-between'><span>Promedio General</span><strong>{promedios.stats?.promedio_general_avg ?? '-'}</strong></div>
              <div className='mb-2 d-flex justify-content-between'><span>Mínimo</span><strong>{promedios.stats?.promedio_general_min ?? '-'}</strong></div>
              <div className='mb-2 d-flex justify-content-between'><span>Máximo</span><strong>{promedios.stats?.promedio_general_max ?? '-'}</strong></div>
              <hr />
              <div className='mb-2 d-flex justify-content-between'><span>Aprobados</span><span className='text-success fw-bold'>{promedios.stats?.aprobados ?? 0}</span></div>
              <div className='mb-2 d-flex justify-content-between'><span>Reprobados</span><span className='text-danger fw-bold'>{promedios.stats?.reprobados ?? 0}</span></div>
              <div className='mb-2 d-flex justify-content-between'><span>Sin notas</span><span className='text-muted'>{promedios.stats?.sin_notas ?? 0}</span></div>
              <hr />
              <div className='d-flex justify-content-between'><span>Total Postulaciones</span><strong>{promedios.stats?.total_postulaciones ?? 0}</strong></div>
            </FormCard>
          </div>
          <div className='col-md-6'>
            <FormCard title='Distribución por Rango' className='h-100'>
              {(promedios.rangos || []).map((r) => {
                const total = promedios.stats?.total_postulaciones || 1
                const pct = Math.round((r.cantidad / total) * 100)
                return (
                  <div key={r.rango} className='mb-2'>
                    <div className='d-flex justify-content-between'>
                      <span>{r.rango}</span>
                      <span>{pct}% ({r.cantidad})</span>
                    </div>
                    <ProgressBar value={pct} height={12} />
                  </div>
                )
              })}
              {(!promedios.rangos || promedios.rangos.length === 0) && (
                <p className='text-muted mb-0'>Sin datos</p>
              )}
              <div className='mt-3'>
                <ExportButtons columns={colsPromedios} data={promedios.rangos} title='Distribucion-Promedios' />
              </div>
            </FormCard>
          </div>
        </div>
      )}

      {tab === 'materias' && (
        <div>
          <div className='d-flex justify-content-end mb-2'>
            <ExportButtons columns={colsMaterias} data={materias} title='Estadisticas-Materias' />
          </div>
          <div className='table-responsive mb-4'>
            <table className='table table-hover table-striped align-middle'>
              <thead className='table-light'>
                <tr>
                  <th>Materia</th>
                  <th>Peso</th>
                  <th>Estudiantes</th>
                  <th>Prom. General</th>
                  <th>Aprobados</th>
                  <th>Reprobados</th>
                  <th>% Aprobación</th>
                </tr>
              </thead>
              <tbody>
                {(materias || []).map((m) => {
                  const pct = m.total_estudiantes > 0 ? Math.round((m.aprobados / m.total_estudiantes) * 100) : 0
                  return (
                    <tr key={m.id}>
                      <td><strong>{m.nombre}</strong> ({m.codigo})</td>
                      <td>{m.peso}%</td>
                      <td>{m.total_estudiantes}</td>
                      <td>{m.promedio_general ?? '-'}</td>
                      <td className='text-success fw-bold'>{m.aprobados}</td>
                      <td className='text-danger'>{m.reprobados}</td>
                      <td style={{ width: 150 }}>
                        <ProgressBar value={pct} height={16} />
                      </td>
                    </tr>
                  )
                })}
                {(!materias || materias.length === 0) && (
                  <tr><td colSpan='7' className='text-center text-muted'>No hay datos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'ranking' && (
        <div>
          <div className='d-flex justify-content-end mb-2'>
            <ExportButtons columns={colsRanking} data={ranking} title='Ranking-Grupos' />
          </div>
          <div className='table-responsive mb-4'>
            <table className='table table-hover table-striped align-middle'>
              <thead className='table-light'>
                <tr>
                  <th>#</th>
                  <th>Grupo</th>
                  <th>Materia</th>
                  <th>Docente</th>
                  <th>Turno</th>
                  <th>Estudiantes</th>
                  <th>Aprobados</th>
                  <th>% Aprobación</th>
                </tr>
              </thead>
              <tbody>
                {(ranking || []).map((g, i) => (
                  <tr key={g.id}>
                    <td>{i + 1}</td>
                    <td>{g.codigo} - {g.nombre}</td>
                    <td>{g.materia_nombre}</td>
                    <td>{g.docente_nombre}</td>
                    <td>{g.turno_nombre}</td>
                    <td>{g.total_estudiantes}</td>
                    <td className='text-success fw-bold'>{g.aprobados}</td>
                    <td style={{ width: 150 }}>
                      <ProgressBar value={g.porcentaje_aprobacion} height={16} />
                    </td>
                  </tr>
                ))}
                {(!ranking || ranking.length === 0) && (
                  <tr><td colSpan='8' className='text-center text-muted'>No hay datos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className='text-end'>
        <button className='btn btn-outline-secondary' onClick={() => window.print()}>
          <i className='bi bi-printer me-1' />Imprimir Reporte
        </button>
      </div>
    </div>
  )
}
