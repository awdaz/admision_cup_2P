import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { confirmDialog } from '../../utils/confirmDialog'
import useGrupos from '../../hooks/useGrupos'
import useCatalogos from '../../hooks/useCatalogos'
import useReportes from '../../hooks/useReportes'
import useList from '../../hooks/useList'
import DataTable from '../../components/ui/DataTable'
import HeaderBar from '../../components/ui/HeaderBar'
import FilterSelect from '../../components/ui/FilterSelect'
import StatCard from '../../components/ui/StatCard'
import ProgressBar from '../../components/ui/ProgressBar'
import Pagination from '../../components/ui/Pagination'
import ExportButtons from '../../components/ui/ExportButtons'

export default function GrupoListPage () {
  const navigate = useNavigate()
  const { getGrupos, deleteGrupo, loading: loadingHook } = useGrupos()
  const { getMaterias, getTurnos, materias, turnos } = useCatalogos()
  const { getGruposRankingAprobados } = useReportes()

  const [filtroMateria, setFiltroMateria] = useState('')
  const [filtroTurno, setFiltroTurno] = useState('')
  const [ranking, setRanking] = useState(null)
  const [showRanking, setShowRanking] = useState(false)

  useEffect(() => {
    getMaterias()
    getTurnos()
  }, [getMaterias, getTurnos])

  useEffect(() => {
    (async () => {
      try {
        const d = await getGruposRankingAprobados()
        if (d) setRanking(d)
      } catch { /* ignore */ }
    })()
  }, [getGruposRankingAprobados])

  const { items: grupos, pagination, page, setPage, loading, load } = useList(
    (p, matId, turnId) => getGrupos(p, { materia_id: matId, turno_id: turnId }),
    [filtroMateria, filtroTurno]
  )

  const totalGrupos = pagination?.total || 0
  const totalPages = useMemo(() =>
    Math.ceil((pagination?.total || 1) / (pagination?.per_page || 15)),
  [pagination]
  )

  const handleDelete = async (row) => {
    if (!await confirmDialog(`¿Eliminar grupo ${row.codigo}?`)) return
    try {
      await deleteGrupo(row.id)
      load(page, filtroMateria, filtroTurno)
    } catch {
      /* toast handled by hook */
    }
  }

  const handleFiltrar = (e) => {
    e.preventDefault()
    setPage(1)
  }

  const fetchAllGrupos = useCallback(async () => {
    const extra = {}
    if (filtroMateria) extra.materia_id = filtroMateria
    if (filtroTurno) extra.turno_id = filtroTurno
    extra.per_page = 1000
    const res = await getGrupos(1, extra)
    return res?.data ?? []
  }, [getGrupos, filtroMateria, filtroTurno])

  const exportColumns = useMemo(() => [
    { key: 'codigo', label: 'Código' },
    { key: 'nombre', label: 'Nombre' },
    { label: 'Materia', render: (row) => row.materia?.nombre || '-' },
    { label: 'Docente', render: (row) => { const p = row.docente?.persona; return p ? `${p?.nombre ?? ''} ${p?.apellido ?? ''}`.trim() || '-' : '-' } },
    { key: 'cupo', label: 'Cupo' },
    { label: 'Turno', render: (row) => row.turno?.nombre || '-' }
  ], [])

  const rankingExportColumns = useMemo(() => [
    { label: '#', render: (r, i) => i + 1 },
    { label: 'Grupo', render: (r) => `${r.codigo} - ${r.nombre}` },
    { key: 'materia_nombre', label: 'Materia' },
    { key: 'docente_nombre', label: 'Docente' },
    { key: 'turno_nombre', label: 'Turno' },
    { key: 'cupo', label: 'Cupo' },
    { key: 'total_estudiantes', label: 'Estudiantes' },
    { key: 'aprobados', label: 'Aprobados' },
    { key: 'porcentaje_aprobacion', label: '% Aprobación' }
  ], [])

  const columns = [
    { key: 'codigo', label: 'Código' },
    {
      key: 'nombre',
      label: 'Nombre',
      render: (row) => (
        <span
          className='text-primary text-decoration-none'
          style={{ cursor: 'pointer' }}
          onClick={() => navigate(`/grupos/${row.id}`)}
        >
          {row.nombre || '-'}
        </span>
      )
    },
    { key: 'materia', label: 'Materia', render: (row) => row.materia?.nombre || '-' },
    {
      key: 'docente',
      label: 'Docente',
      render: (row) => {
        const p = row.docente?.persona
        return p ? `${p?.nombre ?? ''} ${p?.apellido ?? ''}`.trim() || '-' : '-'
      }
    },
    { key: 'cupo', label: 'Cupo' },
    { key: 'turno', label: 'Turno', render: (row) => row.turno?.nombre || '-' }
  ]

  return (
    <div>
      <HeaderBar createLabel='Nuevo Grupo' onCreate={() => navigate('/grupos/nuevo')} />

      <div className='row g-3 mb-4'>
        <StatCard title='Total Grupos' value={totalGrupos} color='primary' variant='bg' colClass='col-md-3' />
        <StatCard title='Cupo Total' value={ranking?.reduce((s, g) => s + (g.cupo || 0), 0) || 0} color='info' variant='bg' colClass='col-md-3' />
        <StatCard title='Total Estudiantes' value={ranking?.reduce((s, g) => s + (g.total_estudiantes || 0), 0) || 0} color='success' variant='bg' colClass='col-md-3' />
        <StatCard title='Total Aprobados' value={ranking?.reduce((s, g) => s + (g.aprobados || 0), 0) || 0} color='warning' variant='bg' colClass='col-md-3' />
      </div>

      <form onSubmit={handleFiltrar} className='d-flex flex-wrap gap-2 mb-3 align-items-center'>
        <div style={{ flex: '0 1 clamp(160px, 25%, 300px)' }}>
          <FilterSelect value={filtroMateria} onChange={(e) => setFiltroMateria(e.target.value)} options={materias} />
        </div>
        <div style={{ flex: '0 1 clamp(120px, 18%, 200px)' }}>
          <FilterSelect value={filtroTurno} onChange={(e) => setFiltroTurno(e.target.value)} options={turnos} />
        </div>
        <button className='btn btn-outline-secondary' type='submit'>
          <i className='bi bi-funnel me-1' />Filtrar
        </button>
        <button
          className={`btn ${showRanking ? 'btn-warning' : 'btn-outline-warning'}`}
          type='button'
          onClick={() => setShowRanking(!showRanking)}
        >
          <i className='bi bi-trophy me-1' />Ranking Aprobados
        </button>
        <ExportButtons columns={exportColumns} data={grupos} title='Grupos' fetchAll={fetchAllGrupos} />
      </form>

      {showRanking && ranking && ranking.length > 0 && (
        <div className='card shadow-sm mb-4'>
          <div className='card-header bg-warning bg-opacity-10 d-flex justify-content-between align-items-center'>
            <strong><i className='bi bi-trophy me-1' />Ranking de Grupos por Aprobados</strong>
            <ExportButtons columns={rankingExportColumns} data={ranking} title='Ranking-Grupos-Aprobados' />
          </div>
          <div className='card-body p-0'>
            <div className='table-responsive'>
              <table className='table table-hover table-striped align-middle mb-0'>
                <thead className='table-light'>
                  <tr>
                    <th>#</th>
                    <th>Grupo</th>
                    <th>Materia</th>
                    <th>Docente</th>
                    <th>Turno</th>
                    <th>Cupo</th>
                    <th>Estudiantes</th>
                    <th>Aprobados</th>
                    <th>% Aprobación</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((g, i) => (
                    <tr key={g.id}>
                      <td>{i + 1}</td>
                      <td>{g.codigo} - {g.nombre}</td>
                      <td>{g.materia_nombre}</td>
                      <td>{g.docente_nombre}</td>
                      <td>{g.turno_nombre}</td>
                      <td>{g.cupo}</td>
                      <td>{g.total_estudiantes}</td>
                      <td className='text-success fw-bold'>{g.aprobados}</td>
                      <td style={{ width: 150 }}>
                        <ProgressBar value={g.porcentaje_aprobacion} height={16} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className='card shadow-sm'>
        <div className='card-body p-0'>
          <DataTable
            columns={columns}
            data={grupos}
            loading={loading || loadingHook}
            onEdit={(row) => navigate(`/grupos/${row.id}/editar`)}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  )
}
