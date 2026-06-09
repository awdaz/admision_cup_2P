import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import useGrupos from '../../hooks/useGrupos';
import useCatalogos from '../../hooks/useCatalogos';
import DataTable from '../../components/ui/DataTable';
import HeaderBar from '../../components/ui/HeaderBar';
import FilterSelect from '../../components/ui/FilterSelect';
import Pagination from '../../components/ui/Pagination';

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
      <HeaderBar title="Grupos" createLabel="Nuevo Grupo" onCreate={() => navigate('/grupos/nuevo')} />

      {/* Filtros: selección de materia y turno para acotar la búsqueda */}
      <form onSubmit={handleFiltrar} className="mb-3">
        <div className="row g-2">
          <div className="col-md-4">
            <FilterSelect value={filtroMateria} onChange={(e) => setFiltroMateria(e.target.value)} options={materias} allLabel="Todas las materias" />
          </div>
          <div className="col-md-3">
            <FilterSelect value={filtroTurno} onChange={(e) => setFiltroTurno(e.target.value)} options={turnos} allLabel="Todos los turnos" />
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

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}
