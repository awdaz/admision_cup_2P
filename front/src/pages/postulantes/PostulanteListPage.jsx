import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import usePostulantes from '../../hooks/usePostulantes';
import DataTable from '../../components/ui/DataTable';
import HeaderBar from '../../components/ui/HeaderBar';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';

// Página de listado de postulantes con búsqueda y paginación
// Ruta: "/postulantes" — Acceso: Usuarios autenticados
// Muestra una tabla con todos los postulantes, permite buscar, editar, eliminar y navegar a detalle
export default function PostulanteListPage() {
  const navigate = useNavigate();
  const { getPostulantes, deletePostulante, loading } = usePostulantes();
  // Lista de postulantes obtenida del backend
  const [postulantes, setPostulantes] = useState([]);
  // Objeto con datos de paginación (total, per_page, etc.)
  const [pagination, setPagination] = useState(null);
  // Página actual de la paginación
  const [page, setPage] = useState(1);
  // Término de búsqueda confirmado (se usa al hacer submit)
  const [searchQuery, setSearchQuery] = useState('');
  // Valor actual del input de búsqueda (antes de submit)
  const [searchInput, setSearchInput] = useState('');

  // Carga la lista de postulantes según página y búsqueda
  const load = useCallback(async (p, s) => {
    try {
      const data = await getPostulantes(p, s);
      if (data) {
        setPostulantes(data.data || data.postulantes || data);
        setPagination(data.pagination || data.meta || data);
      }
    } catch (err) {
      toast.error(err.message);
    }
  }, [getPostulantes]);

  // Recarga cada vez que cambia la página o el término de búsqueda
  useEffect(() => {
    load(page, searchQuery);
  }, [page, searchQuery, load]);

  // Calcula el total de páginas basado en total de registros y registros por página
  const totalPages = useMemo(() =>
    Math.ceil((pagination?.total || 1) / (pagination?.per_page || 15)),
    [pagination]
  );

  // Confirma y elimina un postulante, luego recarga la lista
  const handleDelete = async (row) => {
    const ci = row.persona?.ci || row.ci || '';
    if (!window.confirm(`¿Eliminar postulante ${ci}?`)) return;
    try {
      await deletePostulante(row.id);
      load(page, searchQuery);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Al hacer submit de búsqueda, reinicia a página 1 y aplica el filtro
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput);
  };

  // Configuración de columnas de la tabla con render personalizado
  const columns = [
    { key: 'ci', label: 'CI', render: (row) => row.persona?.ci || row.ci || '-' },
    {
      key: 'nombre_completo', label: 'Nombre Completo',
      render: (row) => {
        const p = row.persona || row;
        return `${p.nombre || ''} ${p.apellido || ''}`.trim() || '-';
      },
    },
    { key: 'email', label: 'Email', render: (row) => row.persona?.email || row.email || '-' },
    { key: 'telefono', label: 'Teléfono', render: (row) => row.persona?.telefono || row.telefono || '-' },
    {
      key: 'carrera', label: 'Carrera',
      render: (row) => {
        const carrera = row.postulacion?.carrera_rel?.nombre || row.postulacion?.carrera_nombre || row.carrera_nombre || row.carrera;
        return carrera || '-';
      },
    },
    {
      key: 'estado', label: 'Estado',
      render: (row) => {
        const estado = row.postulacion?.estado || row.estado;
        if (!estado) return <span className="badge bg-secondary">-</span>;
        const map = {
          pendiente: 'warning',
          inscrito: 'info',
          admitido: 'success',
          rechazado: 'danger',
          cancelado: 'secondary',
        };
        return <span className={`badge bg-${map[estado] || 'secondary'}`}>{estado}</span>;
      },
    },
    {
      key: 'aprobado', label: 'Aprobado',
      render: (row) => {
        const aprobado = row.postulacion?.aprobado;
        if (aprobado === null || aprobado === undefined) return <span className="badge bg-secondary">-</span>;
        return aprobado
          ? <span className="badge bg-success">Sí</span>
          : <span className="badge bg-danger">No</span>;
      },
    },
  ];

  return (
    <div>
      <HeaderBar title="Postulantes" createLabel="Nuevo Postulante" onCreate={() => navigate('/postulantes/nuevo')} />

      <SearchBar
        placeholder="Buscar por CI o nombre..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onSearch={handleSearch}
        className="mb-3"
      />

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <DataTable
            columns={columns}
            data={postulantes}
            loading={loading}
            onEdit={(row) => navigate(`/postulantes/${row.id}/editar`)}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}
