import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import usePostulantes from '../../hooks/usePostulantes';
import DataTable from '../../components/ui/DataTable';

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

  // Calcula qué páginas mostrar en el paginador (ventana deslizante de 5 páginas)
  const visiblePages = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return { start, end, pages };
  }, [page, totalPages]);

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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Postulantes</h4>
        <button className="btn btn-primary" onClick={() => navigate('/postulantes/nuevo')}>
          <i className="bi bi-plus-lg me-1"></i>Nuevo Postulante
        </button>
      </div>

      {/* Barra de búsqueda por CI o nombre */}
      <form onSubmit={handleSearch} className="mb-3">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por CI o nombre..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button className="btn btn-outline-secondary" type="submit">
            <i className="bi bi-search"></i>
          </button>
        </div>
      </form>

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

      {/* Paginación con ventana deslizante, botones de primera/última y elipsis */}
      {pagination && totalPages > 1 && (
        <nav className="mt-3" aria-label="Navegación de páginas">
          <ul className="pagination justify-content-center flex-wrap mb-0">
            <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(1)} aria-label="Primera página">
                <i className="bi bi-chevron-double-left"></i>
              </button>
            </li>
            <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</button>
            </li>

            {visiblePages.start > 1 && (
              <>
                <li className="page-item">
                  <button className="page-link" onClick={() => setPage(1)}>1</button>
                </li>
                {visiblePages.start > 2 && (
                  <li className="page-item disabled">
                    <span className="page-link">...</span>
                  </li>
                )}
              </>
            )}

            {visiblePages.pages.map((i) => (
              <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setPage(i)}>{i}</button>
              </li>
            ))}

            {visiblePages.end < totalPages && (
              <>
                {visiblePages.end < totalPages - 1 && (
                  <li className="page-item disabled">
                    <span className="page-link">...</span>
                  </li>
                )}
                <li className="page-item">
                  <button className="page-link" onClick={() => setPage(totalPages)}>{totalPages}</button>
                </li>
              </>
            )}

            <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage((p) => p + 1)}>Siguiente</button>
            </li>
            <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(totalPages)} aria-label="Última página">
                <i className="bi bi-chevron-double-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
