import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import useGrupos from '../../hooks/useGrupos';
import useCatalogos from '../../hooks/useCatalogos';
import DataTable from '../../components/ui/DataTable';

// Página de listado de grupos con filtros por materia y turno
// Ruta: /grupos
// Acceso: Administradores y docentes
export default function GrupoListPage() {
  const navigate = useNavigate();
  const { getGrupos, deleteGrupo, loading } = useGrupos();
  const { getMaterias, getTurnos, materias, turnos } = useCatalogos();
  const [grupos, setGrupos] = useState([]);            // Lista de grupos desde la API
  const [pagination, setPagination] = useState(null);   // Datos de paginación
  const [page, setPage] = useState(1);                  // Página actual
  const [filtroMateria, setFiltroMateria] = useState(''); // Filtro por materia
  const [filtroTurno, setFiltroTurno] = useState('');   // Filtro por turno

  // Carga catálogos de materias y turnos al montar el componente
  useEffect(() => {
    getMaterias();
    getTurnos();
  }, [getMaterias, getTurnos]);

  // Carga los grupos con filtros opcionales de materia y turno
  const load = useCallback(async (p, matId, turnId) => {
    try {
      const params = {};
      if (matId) params.materia_id = matId;
      if (turnId) params.turno_id = turnId;
      const data = await getGrupos(p, params);
      if (data) {
        setGrupos(data.data || data.grupos || data);
        setPagination(data.pagination || data.meta || data);
      }
    } catch (err) {
      toast.error(err.message);
    }
  }, [getGrupos]);

  // Recarga al cambiar página o filtros
  useEffect(() => {
    load(page, filtroMateria, filtroTurno);
  }, [page, filtroMateria, filtroTurno, load]);

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

  // Elimina un grupo previa confirmación y recarga la lista
  const handleDelete = async (row) => {
    if (!window.confirm(`¿Eliminar grupo ${row.codigo}?`)) return;
    try {
      await deleteGrupo(row.id);
      load(page, filtroMateria, filtroTurno);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Al aplicar filtros, reinicia a la primera página
  const handleFiltrar = (e) => {
    e.preventDefault();
    setPage(1);
  };

  // Configuración de columnas de la tabla de grupos
  const columns = [
    { key: 'codigo', label: 'Código' },
    {
      key: 'nombre', label: 'Nombre',
      // El nombre del grupo es clickeable y redirige a la vista detalle
      render: (row) => (
        <span
          className="text-primary text-decoration-none"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate(`/grupos/${row.id}`)}
        >
          {row.nombre || '-'}
        </span>
      ),
    },
    { key: 'materia', label: 'Materia', render: (row) => row.materia?.nombre || '-' },
    { key: 'docente', label: 'Docente', render: (row) => {
      const p = row.docente?.persona;
      return p ? `${p.nombre} ${p.apellido}` : '-';
    }},
    { key: 'cupo', label: 'Cupo' },
    { key: 'turno', label: 'Turno', render: (row) => row.turno?.nombre || '-' },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Grupos</h4>
        <button className="btn btn-primary" onClick={() => navigate('/grupos/nuevo')}>
          <i className="bi bi-plus-lg me-1"></i>Nuevo Grupo
        </button>
      </div>

      {/* Filtros: selección de materia y turno para acotar la búsqueda */}
      <form onSubmit={handleFiltrar} className="mb-3">
        <div className="row g-2">
          <div className="col-md-4">
            <select className="form-select" value={filtroMateria} onChange={(e) => setFiltroMateria(e.target.value)}>
              <option value="">Todas las materias</option>
              {materias.map((m) => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={filtroTurno} onChange={(e) => setFiltroTurno(e.target.value)}>
              <option value="">Todos los turnos</option>
              {turnos.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-secondary w-100" type="submit">
              <i className="bi bi-funnel me-1"></i>Filtrar
            </button>
          </div>
        </div>
      </form>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <DataTable
            columns={columns}
            data={grupos}
            loading={loading}
            onEdit={(row) => navigate(`/grupos/${row.id}/editar`)}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Paginación: navegación completa con primera, anterior, páginas visibles, siguiente y última */}
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

            {/* Páginas iniciales con ellipsis si es necesario */}
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

            {/* Rango de páginas visibles alrededor de la página actual */}
            {visiblePages.pages.map((i) => (
              <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setPage(i)}>{i}</button>
              </li>
            ))}

            {/* Páginas finales con ellipsis si es necesario */}
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
