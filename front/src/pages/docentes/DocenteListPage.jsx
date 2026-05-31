import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import useDocentes from '../../hooks/useDocentes';
import DataTable from '../../components/ui/DataTable';

export default function DocenteListPage() {
  const navigate = useNavigate();
  const { getDocentes, deleteDocente, loading } = useDocentes();
  const [docentes, setDocentes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback(async (p, s) => {
    try {
      const data = await getDocentes(p, s);
      if (data) {
        setDocentes(data.data || data.docentes || data);
        setPagination(data.pagination || data.meta || data);
      }
    } catch (err) {
      toast.error(err.message);
    }
  }, [getDocentes]);

  useEffect(() => {
    load(page, searchQuery);
  }, [page, searchQuery, load]);

  const totalPages = useMemo(() =>
    Math.ceil((pagination?.total || 1) / (pagination?.per_page || 15)),
    [pagination]
  );

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

  const handleDelete = async (row) => {
    const ci = row.persona?.ci || '';
    if (!window.confirm(`¿Eliminar docente ${ci}?`)) return;
    try {
      await deleteDocente(row.id);
      load(page, searchQuery);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput);
  };

  const columns = [
    { key: 'cod_docente', label: 'Código', render: (row) => row.cod_docente || '-' },
    { key: 'ci', label: 'CI', render: (row) => row.persona?.ci || '-' },
    {
      key: 'nombre_completo', label: 'Nombre Completo',
      render: (row) => {
        const p = row.persona || row;
        return `${p.nombre || ''} ${p.apellido || ''}`.trim() || '-';
      },
    },
    { key: 'email', label: 'Email', render: (row) => row.persona?.email || '-' },
    { key: 'telefono', label: 'Teléfono', render: (row) => row.persona?.telefono || '-' },
    {
      key: 'profesional_area', label: 'Prof. Área',
      render: (row) => row.es_profesional_area
        ? <span className="badge bg-success">Sí</span>
        : <span className="badge bg-secondary">No</span>,
    },
    {
      key: 'contratado', label: 'Contratado',
      render: (row) => row.contratado
        ? <span className="badge bg-primary">Sí</span>
        : <span className="badge bg-warning text-dark">No</span>,
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Docentes</h4>
        <button className="btn btn-primary" onClick={() => navigate('/docentes/nuevo')}>
          <i className="bi bi-plus-lg me-1"></i>Nuevo Docente
        </button>
      </div>

      <form onSubmit={handleSearch} className="mb-3">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por CI, nombre o código..."
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
            data={docentes}
            loading={loading}
            onEdit={(row) => navigate(`/docentes/${row.id}/editar`)}
            onDelete={handleDelete}
          />
        </div>
      </div>

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
