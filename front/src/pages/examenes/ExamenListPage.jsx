import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import useExamenes from '../../hooks/useExamenes';
import useGrupos from '../../hooks/useGrupos';
import DataTable from '../../components/ui/DataTable';
import HeaderBar from '../../components/ui/HeaderBar';
import FilterSelect from '../../components/ui/FilterSelect';
import Pagination from '../../components/ui/Pagination';

// Página de listado de exámenes con filtro por grupo
// Ruta: /examenes
// Acceso: Administradores y docentes
export default function ExamenListPage() {
  const navigate = useNavigate();
  const { getExamenes, deleteExamen, loading } = useExamenes();
  const { getGrupos } = useGrupos();
  const [examenes, setExamenes] = useState([]);        // Lista de exámenes desde la API
  const [grupos, setGrupos] = useState([]);            // Lista de grupos para el filtro
  const [pagination, setPagination] = useState(null);   // Datos de paginación
  const [page, setPage] = useState(1);                  // Página actual
  const [filtroGrupo, setFiltroGrupo] = useState('');   // Filtro por grupo

  // Carga la lista de grupos para el selector de filtro al montar
  useEffect(() => {
    (async () => {
      const d = await getGrupos(1);
      if (d) setGrupos(d.data || d.grupos || []);
    })();
  }, [getGrupos]);

  // Carga los exámenes con filtro opcional por grupo
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

  // Recarga al cambiar página o filtro de grupo
  useEffect(() => {
    load(page, filtroGrupo);
  }, [page, filtroGrupo, load]);

  const totalPages = useMemo(() =>
    Math.ceil((pagination?.total || 1) / (pagination?.per_page || 15)),
    [pagination]
  );

  // Elimina un examen previa confirmación y recarga la lista
  const handleDelete = async (row) => {
    if (!window.confirm(`¿Eliminar examen ${row.nro}?`)) return;
    try {
      await deleteExamen(row.id);
      load(page, filtroGrupo);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Configuración de columnas de la tabla de exámenes
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
      <HeaderBar title="Exámenes" createLabel="Nuevo Examen" onCreate={() => navigate('/examenes/nuevo')} />

      <div className="mb-3">
        <FilterSelect value={filtroGrupo} onChange={(e) => { setPage(1); setFiltroGrupo(e.target.value); }} options={grupos} allLabel="Todos los grupos" mapOption={(g) => `${g.codigo} - ${g.materia?.nombre}`} />
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

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}
