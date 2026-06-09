// Página de listado de usuarios con búsqueda, filtro por rol y paginación
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import cliente from '../../api/cliente';
import DataTable from '../../components/ui/DataTable';
import HeaderBar from '../../components/ui/HeaderBar';
import FilterSelect from '../../components/ui/FilterSelect';
import Pagination from '../../components/ui/Pagination';

const roles = [
  { id: 'admin', nombre: 'Administrador' },
  { id: 'postulante', nombre: 'Postulante' },
  { id: 'docente', nombre: 'Docente' },
];

export default function UserListPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);         // Lista de usuarios cargados
  const [loading, setLoading] = useState(true);    // Estado de carga
  const [page, setPage] = useState(1);             // Página actual de la paginación
  const [pagination, setPagination] = useState(null); // Metadatos de paginación (total, per_page)
  const [search, setSearch] = useState('');         // Término de búsqueda
  const [filtroTipo, setFiltroTipo] = useState(''); // Filtro por rol (admin, docente, postulante)

  // Carga la lista de usuarios desde el servidor, con filtros y paginación
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (search) params.append('search', search);
      if (filtroTipo) params.append('tipo', filtroTipo);
      const data = await cliente.get(`/users?${params.toString()}`);
      setUsers(data.data || data.users || data);
      setPagination(data.pagination || data.meta || null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, filtroTipo]);

  // Recarga cuando cambian los parámetros
  useEffect(() => { load(); }, [load]);

  // Activa o desactiva un usuario (toggle activo/inactivo)
  const handleToggleActive = async (row) => {
    const action = row.activo ? 'desactivar' : 'activar';
    if (!window.confirm(`¿${action === 'activar' ? 'Activar' : 'Desactivar'} usuario "${row.username}"?`)) return;
    try {
      const data = await cliente.put(`/users/${row.id}/toggle-active`);
      toast.success(data.message);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Elimina un usuario previa confirmación
  const handleDelete = async (row) => {
    if (!window.confirm(`¿Eliminar usuario "${row.username}"?`)) return;
    try {
      await cliente.del(`/users/${row.id}`);
      toast.success('Usuario eliminado correctamente');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'username', label: 'Usuario' },
    {
      key: 'persona', label: 'Persona',
      render: (row) => row.persona ? `${row.persona.nombre} ${row.persona.apellido}` : '-',
    },
    { key: 'email', label: 'Email' },
    {
      key: 'tipo', label: 'Rol',
      render: (row) => {
        const map = { admin: 'Administrador', postulante: 'Postulante', docente: 'Docente' };
        return <span className="badge bg-secondary">{map[row.tipo] || row.tipo}</span>;
      },
    },
    {
      key: 'activo', label: 'Estado',
      render: (row) => (
        <span className={`badge bg-${row.activo ? 'success' : 'danger'}`}>
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <HeaderBar title="Usuarios" createLabel="Nuevo Usuario" onCreate={() => navigate('/usuarios/nuevo')} />

      <div className="input-group mb-3">
        <input className="form-control" placeholder="Buscar por username o email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <FilterSelect value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} options={roles} allLabel="Todos los roles" />
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
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
  );
}
