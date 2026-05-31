import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import useExamenes from '../../hooks/useExamenes';
import useGrupos from '../../hooks/useGrupos';
import DataTable from '../../components/ui/DataTable';

export default function ExamenListPage() {
  const navigate = useNavigate();
  const { getExamenes, deleteExamen, loading } = useExamenes();
  const { getGrupos } = useGrupos();
  const [examenes, setExamenes] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [filtroGrupo, setFiltroGrupo] = useState('');

  useEffect(() => {
    (async () => {
      const d = await getGrupos(1);
      if (d) setGrupos(d.data || d.grupos || []);
    })();
  }, [getGrupos]);

  const load = useCallback(async (p, gId) => {
    try {
      const data = await getExamenes(p, gId);
      if (data) {
        setExamenes(data.data || data.examenes || data);
        setPagination(data.pagination || data.meta || data);
      }
    } catch (err) {
      toast.error(err.message);
    }
  }, [getExamenes]);

  useEffect(() => {
    load(page, filtroGrupo);
  }, [page, filtroGrupo, load]);

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
    if (!window.confirm(`¿Eliminar examen ${row.nro}?`)) return;
    try {
      await deleteExamen(row.id);
      load(page, filtroGrupo);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'nro', label: 'Nro' },
    { key: 'descripcion', label: 'Descripción', render: (row) => row.descripcion || '-' },
    { key: 'fecha', label: 'Fecha', render: (row) => row.fecha ? new Date(row.fecha).toLocaleDateString() : '-' },
    { key: 'materia', label: 'Materia', render: (row) => row.grupo?.materia?.nombre || '-' },
    { key: 'grupo', label: 'Grupo', render: (row) => row.grupo?.codigo || '-' },
    { key: 'porcentaje', label: '%', render: (row) => row.porcentaje ? `${row.porcentaje}%` : '-' },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Exámenes</h4>
        <button className="btn btn-primary" onClick={() => navigate('/examenes/nuevo')}>
          <i className="bi bi-plus-lg me-1"></i>Nuevo Examen
        </button>
      </div>

      <div className="mb-3">
        <select className="form-select w-auto" value={filtroGrupo} onChange={(e) => { setPage(1); setFiltroGrupo(e.target.value); }}>
          <option value="">Todos los grupos</option>
          {grupos.map((g) => (
            <option key={g.id} value={g.id}>{g.codigo} - {g.materia?.nombre}</option>
          ))}
        </select>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <DataTable
            columns={columns}
            data={examenes}
            loading={loading}
            onEdit={(row) => navigate(`/examenes/${row.id}/editar`)}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {pagination && totalPages > 1 && (
        <nav className="mt-3" aria-label="Navegación de páginas">
          <ul className="pagination justify-content-center flex-wrap mb-0">
            <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(1)}><i className="bi bi-chevron-double-left"></i></button>
            </li>
            <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</button>
            </li>
            {visiblePages.start > 1 && (
              <><li className="page-item"><button className="page-link" onClick={() => setPage(1)}>1</button></li>
                {visiblePages.start > 2 && <li className="page-item disabled"><span className="page-link">...</span></li>}</>
            )}
            {visiblePages.pages.map((i) => (
              <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setPage(i)}>{i}</button>
              </li>
            ))}
            {visiblePages.end < totalPages && (
              <>{visiblePages.end < totalPages - 1 && <li className="page-item disabled"><span className="page-link">...</span></li>}
                <li className="page-item"><button className="page-link" onClick={() => setPage(totalPages)}>{totalPages}</button></li></>
            )}
            <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage((p) => p + 1)}>Siguiente</button>
            </li>
            <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(totalPages)}><i className="bi bi-chevron-double-right"></i></button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
