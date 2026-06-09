import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import useDocentes from '../../hooks/useDocentes';
import DataTable from '../../components/ui/DataTable';
import ProgressBar from '../../components/ui/ProgressBar';
import HeaderBar from '../../components/ui/HeaderBar';
import Pagination from '../../components/ui/Pagination';

// Página de listado de docentes con búsqueda, paginación y acciones CRUD
// Ruta: /docentes
// Acceso: Administradores
export default function DocenteListPage() {
  const navigate = useNavigate();
  const { getDocentes, deleteDocente, getDisponibilidad, loading } = useDocentes();
  const [docentes, setDocentes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showDisponibilidad, setShowDisponibilidad] = useState(false);
  const [disponibilidad, setDisponibilidad] = useState([]);

  // Carga los docentes desde la API con paginación y filtro de búsqueda
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

  // Recarga al cambiar página o término de búsqueda
  useEffect(() => {
    load(page, searchQuery);
  }, [page, searchQuery, load]);

  const totalPages = useMemo(() =>
    Math.ceil((pagination?.total || 1) / (pagination?.per_page || 15)),
    [pagination]
  );

  // Elimina un docente previa confirmación, luego recarga la lista
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

  // Al enviar el formulario de búsqueda, reinicia a página 1 y aplica el filtro
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput);
  };

  const toggleDisponibilidad = async () => {
    if (!showDisponibilidad) {
      try {
        const data = await getDisponibilidad();
        const list = Array.isArray(data) ? data : (data?.data || []);
        setDisponibilidad(list);
      } catch (err) { toast.error(err.message); }
    }
    setShowDisponibilidad(!showDisponibilidad);
  };

  // Configuración de columnas para la tabla de docentes
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
      <HeaderBar createLabel="Nuevo Docente" onCreate={() => navigate('/docentes/nuevo')} />

      {/* Barra de búsqueda: filtra docentes por CI, nombre o código */}
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
          <button className={"btn " + (showDisponibilidad ? 'btn-info' : 'btn-outline-info')} type="button" onClick={toggleDisponibilidad}>
            <i className="bi bi-bar-chart me-1"></i>Disponibilidad
          </button>
        </div>
      </form>

      {/* Tabla de disponibilidad */}
      {showDisponibilidad && (
        <div className="table-responsive">
          <table className="table table-hover table-striped align-middle table-sm">
              <thead className="table-light">
                <tr>
                  <th>Docente</th>
                  <th>Codigo</th>
                  <th>Contratado</th>
                  <th>Grupos Asignados</th>
                  <th>Grupos Disponibles</th>
                  <th>Disponibilidad</th>
                </tr>
              </thead>
              <tbody>
                {disponibilidad.map((d) => {
                  const pct = 4 > 0 ? Math.round(((d.grupos_asignados || 0) / 4) * 100) : 0;
                  return (
                    <tr key={d.docente_id}>
                      <td>{d.docente}</td>
                      <td>{d.cod_docente}</td>
                      <td>{d.contratado ? <span className="badge bg-success">Si</span> : <span className="badge bg-secondary">No</span>}</td>
                      <td>{d.grupos_asignados || 0}</td>
                      <td>{d.grupos_disponibles || 0}</td>
                      <td style={{ width: 150 }}>
                        <ProgressBar value={pct} height={16}>
                          {d.grupos_asignados || 0}/4
                        </ProgressBar>
                      </td>
                    </tr>
                  );
                })}
                {disponibilidad.length === 0 && (
                  <tr><td colSpan="6" className="text-center text-muted">No hay datos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

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

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}
