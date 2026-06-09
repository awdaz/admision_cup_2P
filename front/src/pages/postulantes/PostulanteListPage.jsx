import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { confirmDialog } from '../../utils/confirmDialog'
import usePostulantes from '../../hooks/usePostulantes'
import useList from '../../hooks/useList'
import DataTable from '../../components/ui/DataTable'
import HeaderBar from '../../components/ui/HeaderBar'
import SearchBar from '../../components/ui/SearchBar'
import BadgeStatus from '../../components/ui/BadgeStatus'
import Pagination from '../../components/ui/Pagination'

export default function PostulanteListPage () {
  const navigate = useNavigate()
  const { getPostulantes, deletePostulante, loading: loadingHook } = usePostulantes()

  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { items: postulantes, pagination, page, setPage, loading, load } = useList(
    (p, q) => getPostulantes(p, q),
    [searchQuery]
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
      load(page, searchQuery)
    } catch {
      /* toast handled by hook */
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setSearchQuery(searchInput)
  }

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
    { key: 'telefono', label: 'Teléfono', render: (row) => row.persona?.telefono || row.telefono || '-' },
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
          pendiente: 'warning',
          inscrito: 'info',
          admitido: 'success',
          rechazado: 'danger',
          cancelado: 'secondary'
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
          ? <BadgeStatus value='Sí' colors={{ Sí: 'success' }} />
          : <BadgeStatus value='No' colors={{ No: 'danger' }} />
      }
    }
  ]

  return (
    <div>
      <HeaderBar createLabel='Nuevo Postulante' onCreate={() => navigate('/postulantes/nuevo')} />

      <SearchBar
        placeholder='Buscar por CI o nombre...'
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onSearch={handleSearch}
        className='mb-3'
      />

      <div className='card shadow-sm'>
        <div className='card-body p-0'>
          <DataTable
            columns={columns}
            data={postulantes}
            loading={loading || loadingHook}
            onEdit={(row) => navigate(`/postulantes/${row.id}/editar`)}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  )
}
