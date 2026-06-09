import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { confirmDialog } from '../../utils/confirmDialog'
import cliente from '../../api/cliente'
import useList from '../../hooks/useList'
import DataTable from '../../components/ui/DataTable'
import HeaderBar from '../../components/ui/HeaderBar'
import FilterSelect from '../../components/ui/FilterSelect'
import BadgeStatus from '../../components/ui/BadgeStatus'
import Pagination from '../../components/ui/Pagination'

const roles = [
  { id: 'admin', nombre: 'Administrador' },
  { id: 'postulante', nombre: 'Postulante' },
  { id: 'docente', nombre: 'Docente' }
]

export default function UserListPage () {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')

  const { items: users, pagination, page, setPage, loading, load } = useList(
    (p, s, t) => {
      const qs = new URLSearchParams({ page: p })
      if (s) qs.append('search', s)
      if (t) qs.append('tipo', t)
      return cliente.get(`/users?${qs}`)
    },
    [search, filtroTipo]
  )

  const handleDelete = async (row) => {
    if (!await confirmDialog(`¿Eliminar usuario "${row.username}"?`)) return
    try {
      await cliente.del(`/users/${row.id}`)
      toast.success('Usuario eliminado correctamente')
      load(page, search, filtroTipo)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const columns = [
    { key: 'username', label: 'Usuario' },
    {
      key: 'persona',
      label: 'Persona',
      render: (row) => row?.persona ? `${row.persona?.nombre ?? ''} ${row.persona?.apellido ?? ''}`.trim() || '-' : '-'
    },
    { key: 'email', label: 'Email' },
    {
      key: 'tipo',
      label: 'Rol',
      render: (row) => {
        const map = { admin: 'Administrador', postulante: 'Postulante', docente: 'Docente' }
        return <BadgeStatus value={map[row.tipo] || row.tipo} />
      }
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (row) => (
        <BadgeStatus value={row.activo ? 'Activo' : 'Inactivo'} colors={{ Activo: 'success', Inactivo: 'danger' }} />
      )
    }
  ]

  return (
    <div>
      <HeaderBar createLabel='Nuevo Usuario' onCreate={() => navigate('/usuarios/nuevo')} />

      <div className='input-group mb-3'>
        <input className='form-control' placeholder='Buscar por username o email...' value={search} onChange={(e) => setSearch(e.target.value)} />
        <FilterSelect value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} options={roles} />
      </div>

      <div className='card shadow-sm'>
        <div className='card-body p-0'>
          <DataTable
            columns={columns}
            data={users}
            loading={loading}
            onEdit={(row) => navigate(`/usuarios/${row.id}/editar`)}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <Pagination page={page} totalPages={Math.ceil((pagination?.total || 1) / (pagination?.per_page || 10))} setPage={setPage} simple />
    </div>
  )
}
