import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import useReportes from '../../hooks/useReportes'
import StatCard from '../../components/ui/StatCard'
import ProgressBar from '../../components/ui/ProgressBar'
import ExportButtons from '../../components/ui/ExportButtons'

// Casos de Uso: CU13 (Visualizar dashboard), CU14 (Generar reportes)
export default function DocenteDashboard () {
  const { getReporteDocenteMisGrupos, loading } = useReportes()
  const [data, setData] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const d = await getReporteDocenteMisGrupos()
        if (d) setData(d)
      } catch (err) { toast.error(err.message) }
    })()
  }, [getReporteDocenteMisGrupos])

  if (loading && !data) return <div className='text-center py-5'><div className='spinner-border text-primary' /></div>

  const stats = data?.stats || {}
  const grupos = data?.grupos || []

  const exportColumns = useMemo(() => [
    { key: 'codigo', label: 'Código' },
    { key: 'nombre', label: 'Nombre' },
    { label: 'Materia', render: (row) => row.materia?.nombre || '-' },
    { key: 'cupo', label: 'Cupo' },
    { label: 'Estudiantes', render: (row) => row.postulacion_grupos?.length || 0 },
    { label: 'Exámenes', render: (row) => row.examenes?.length || 0 },
    { label: 'Ocupación', render: (row) => row.cupo > 0 ? Math.round(((row.postulacion_grupos?.length || 0) / row.cupo) * 100) + '%' : '0%' }
  ], [])

  return (
    <div>
      <div className='row g-3 mb-4'>
        <StatCard title='Grupos' value={stats.total_grupos} color='primary' variant='bg' />
        <StatCard title='Estudiantes' value={stats.total_estudiantes} color='success' variant='bg' />
        <StatCard title='Examenes' value={stats.total_examenes} color='info' variant='bg' />
      </div>

      <div className='d-flex justify-content-between align-items-center mb-2'>
        <strong>Grupos Asignados</strong>
        <div className='d-flex gap-2'>
          <ExportButtons columns={exportColumns} data={grupos} title='Docente-Grupos' />
          <button className='btn btn-sm btn-outline-secondary' onClick={() => window.print()}>
            <i className='bi bi-printer' />
          </button>
        </div>
      </div>
      <div className='table-responsive'>
        <table className='table table-hover table-striped align-middle'>
          <thead className='table-light'>
            <tr>
              <th>Codigo</th>
              <th>Nombre</th>
              <th>Materia</th>
              <th>Cupo</th>
              <th>Estudiantes</th>
              <th>Examenes</th>
              <th>Ocupacion</th>
            </tr>
          </thead>
          <tbody>
            {grupos.map((g) => {
              const pct = g.cupo > 0 ? Math.round(((g.postulacion_grupos?.length || 0) / g.cupo) * 100) : 0
              return (
                <tr key={g.id}>
                  <td>{g.codigo}</td>
                  <td>{g.nombre}</td>
                  <td>{g.materia?.nombre || '-'}</td>
                  <td>{g.cupo}</td>
                  <td>{g.postulacion_grupos?.length || 0}</td>
                  <td>{g.examenes?.length || 0}</td>
                  <td style={{ width: 150 }}>
                    <ProgressBar value={pct} height={16} />
                  </td>
                </tr>
              )
            })}
            {grupos.length === 0 && (
              <tr><td colSpan='7' className='text-center text-muted'>No tienes grupos asignados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
