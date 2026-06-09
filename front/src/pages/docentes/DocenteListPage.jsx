import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import useDocentes from '../../hooks/useDocentes';
import useList from '../../hooks/useList';
import DataTable from '../../components/ui/DataTable';
import ProgressBar from '../../components/ui/ProgressBar';
import BadgeStatus from '../../components/ui/BadgeStatus';
import HeaderBar from '../../components/ui/HeaderBar';
import Pagination from '../../components/ui/Pagination';

export default function DocenteListPage() {
  const navigate = useNavigate();
  const { getDocentes, deleteDocente, getDisponibilidad, loading: loadingHook } = useDocentes();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showDisponibilidad, setShowDisponibilidad] = useState(false);
  const [disponibilidad, setDisponibilidad] = useState([]);

  const { items: docentes, pagination, page, setPage, loading, load } = useList(
    (p, q) => getDocentes(p, q),
    [searchQuery]
  );

  const totalPages = useMemo(() =>
    Math.ceil((pagination?.total || 1) / (pagination?.per_page || 15)),
    [pagination]
  );

  const handleDelete = async (row) => {
    const ci = row.persona?.ci || '';
    if (!window.confirm(`¿Eliminar docente ${ci}?`)) return;
    try {
      await deleteDocente(row.id);
      load(page, searchQuery);
    } catch (err) {
      /* toast handled by hook */
    }
  };

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
        ? <BadgeStatus value="Sí" colors={{ Sí: 'success' }} />
        : <BadgeStatus value="No" />,
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
                      <td>{d.contratado ? <BadgeStatus value="Si" colors={{ Si: 'success' }} /> : <BadgeStatus value="No" />}</td>
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
            loading={loading || loadingHook}
            onEdit={(row) => navigate(`/docentes/${row.id}/editar`)}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}
