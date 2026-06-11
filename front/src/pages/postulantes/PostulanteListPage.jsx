import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { confirmDialog } from '../../utils/confirmDialog'
import usePostulantes from '../../hooks/usePostulantes'
import useList from '../../hooks/useList'
import DataTable from '../../components/ui/DataTable'
import HeaderBar from '../../components/ui/HeaderBar'
import SearchBar from '../../components/ui/SearchBar'
import BadgeStatus from '../../components/ui/BadgeStatus'
import Pagination from '../../components/ui/Pagination'
import NuevaPostulacionModal from '../../components/postulantes/NuevaPostulacionModal'
import { ESTADOS, SI_NO, str } from '../../constants'
import ExportButtons from '../../components/ui/ExportButtons'

// Caso de Uso: CU05 — Gestionar postulantes
const FILTRO_APROBADO = {
  TODOS: '',
  APROBADOS: 'true',
  REPROBADOS: 'false'
}

export default function PostulanteListPage () {
  const navigate = useNavigate()
  const { getPostulantes, deletePostulante, loading: loadingHook } = usePostulantes()

  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [filtroAprobado, setFiltroAprobado] = useState(FILTRO_APROBADO.TODOS)

  const fetchParams = useMemo(() => {
    const extra = {}
    if (filtroAprobado) extra.aprobado = filtroAprobado
    return { searchQuery, extra }
  }, [searchQuery, filtroAprobado])

  const { items: postulantes, pagination, page, setPage, loading, load } = useList(
    (p, q, extra) => getPostulantes(p, q, extra ?? {}),
    [fetchParams.searchQuery, fetchParams.extra]
  )

  const totalPages = useMemo(() =>
    Math.ceil((pagination?.total || 1) / (pagination?.per_page || 15)),
  [pagination]
  )

  const handleDelete = async (row) => {
    const ci = row.persona?.ci || row.ci || ''
    if (!await confirmDialog(`¿Eliminar postulante ${ci}?`)) return
    try {
      await deletePostulante(row.id)
      load(page, searchQuery, fetchParams.extra)
    } catch {
      /* toast handled by hook */
    }
  }

  const handleSearch = (value) => {
    setPage(1)
    setSearchQuery(value)
  }

  const handleFiltroAprobado = (value) => {
    setPage(1)
    setFiltroAprobado(value)
  }

  const fetchAllPostulantes = useCallback(async () => {
    const res = await getPostulantes(1, searchQuery, { ...fetchParams.extra, per_page: 10000 })
    return Array.isArray(res) ? res : (res?.data ?? [])
  }, [getPostulantes, searchQuery, fetchParams.extra])

  const exportColumns = useMemo(() => [
    { label: 'CI', render: (row) => row.persona?.ci || row.ci || '-' },
    { label: 'Nombre Completo', render: (row) => { const p = row.persona || row; return `${p.nombre || ''} ${p.apellido || ''}`.trim() || '-' } },
    { label: 'Email', render: (row) => row.persona?.email || row.email || '-' },
    { label: 'Prom. Gral.', key: 'promedio_general' },
    { label: 'Carrera', render: (row) => row.postulacion?.carrera_rel?.nombre || row.postulacion?.carrera_nombre || row.carrera_nombre || row.carrera || '-' },
    { label: 'Estado', render: (row) => row.postulacion?.estado || row.estado || '-' },
    { label: 'Aprobado', render: (row) => { const a = row.postulacion?.aprobado; return a === null || a === undefined ? '-' : a ? 'Sí' : 'No' } }
  ], [])

  const columns = [
    { key: 'ci', label: 'CI', render: (row) => row.persona?.ci || row.ci || '-' },
    {
      key: 'nombre_completo',
      label: 'Nombre Completo',
      render: (row) => {
        const p = row.persona || row
        return `${p.nombre || ''} ${p.apellido || ''}`.trim() || '-'
      }
    },
    { key: 'email', label: 'Email', render: (row) => row.persona?.email || row.email || '-' },
    {
      key: 'promedio_general',
      label: 'Prom. Gral.',
      render: (row) => row.promedio_general ?? '-'
    },
    {
      key: 'carrera',
      label: 'Carrera',
      render: (row) => {
        const carrera = row.postulacion?.carrera_rel?.nombre || row.postulacion?.carrera_nombre || row.carrera_nombre || row.carrera
        return carrera || '-'
      }
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (row) => {
        const estado = row.postulacion?.estado || row.estado
        if (!estado) return <BadgeStatus value='-' />
        const map = {
          [str(ESTADOS.POSTULACION.PENDIENTE)]: 'warning',
          [str(ESTADOS.POSTULACION.INSCRITO)]: 'info',
          [str(ESTADOS.POSTULACION.ADMITIDO)]: 'success',
          [str(ESTADOS.POSTULACION.RECHAZADO)]: 'danger',
          [str(ESTADOS.POSTULACION.CANCELADO)]: 'secondary'
        }
        return <BadgeStatus value={estado} colors={map} />
      }
    },
    {
      key: 'aprobado',
      label: 'Aprobado',
      render: (row) => {
        const aprobado = row.postulacion?.aprobado
        if (aprobado === null || aprobado === undefined) return <BadgeStatus value='-' />
        return aprobado
          ? <BadgeStatus value={str(SI_NO.SI)} colors={{ [str(SI_NO.SI)]: 'success' }} />
          : <BadgeStatus value={str(SI_NO.NO)} colors={{ [str(SI_NO.NO)]: 'danger' }} />
      }
    }
  ]

  return (
    <div>
      <HeaderBar createLabel='Nuevo Postulante' onCreate={() => navigate('/postulantes/nuevo')}>
        <button className='btn btn-success' onClick={() => setShowModal(true)}>
          <i className='bi bi-plus-lg me-1' />Nueva Postulación
        </button>
      </HeaderBar>

      <div className='d-flex flex-wrap gap-2 mb-3 align-items-center'>
        <div style={{ flex: '1 1 clamp(250px, 35%, 500px)' }}>
          <SearchBar
            placeholder='Buscar por CI o nombre...'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onSearch={handleSearch}
          />
        </div>
        <div className='btn-group btn-group-sm' role='group'>
          <button
            className={`btn ${filtroAprobado === FILTRO_APROBADO.TODOS ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleFiltroAprobado(FILTRO_APROBADO.TODOS)}
          >
            Todos
          </button>
          <button
            className={`btn ${filtroAprobado === FILTRO_APROBADO.APROBADOS ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => handleFiltroAprobado(FILTRO_APROBADO.APROBADOS)}
          >
            Aprobados
          </button>
          <button
            className={`btn ${filtroAprobado === FILTRO_APROBADO.REPROBADOS ? 'btn-danger' : 'btn-outline-danger'}`}
            onClick={() => handleFiltroAprobado(FILTRO_APROBADO.REPROBADOS)}
          >
            Reprobados
          </button>
        </div>
        <ExportButtons columns={exportColumns} data={postulantes} title='Postulantes' fetchAll={fetchAllPostulantes} />
      </div>

      <div className='card shadow-sm'>
        <div className='card-body p-0'>
          <DataTable
            columns={columns}
            data={postulantes}
            loading={loading || loadingHook}
            onView={(row) => navigate(`/postulantes/${row.id}`)}
            onEdit={(row) => navigate(`/postulantes/${row.id}/editar`)}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />

      <NuevaPostulacionModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => load(page, searchQuery, fetchParams.extra)}
      />
    </div>
  )
}
