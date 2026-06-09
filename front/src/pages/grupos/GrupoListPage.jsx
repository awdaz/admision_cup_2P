import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useGrupos from '../../hooks/useGrupos';
import useCatalogos from '../../hooks/useCatalogos';
import useList from '../../hooks/useList';
import DataTable from '../../components/ui/DataTable';
import HeaderBar from '../../components/ui/HeaderBar';
import FilterSelect from '../../components/ui/FilterSelect';
import Pagination from '../../components/ui/Pagination';

export default function GrupoListPage() {
  const navigate = useNavigate();
  const { getGrupos, deleteGrupo, loading: loadingHook } = useGrupos();
  const { getMaterias, getTurnos, materias, turnos } = useCatalogos();

  const [filtroMateria, setFiltroMateria] = useState('');
  const [filtroTurno, setFiltroTurno] = useState('');

  useEffect(() => {
    getMaterias();
    getTurnos();
  }, [getMaterias, getTurnos]);

  const { items: grupos, pagination, page, setPage, loading, load } = useList(
    (p, matId, turnId) => getGrupos(p, { materia_id: matId, turno_id: turnId }),
    [filtroMateria, filtroTurno]
  );

  const totalPages = useMemo(() =>
    Math.ceil((pagination?.total || 1) / (pagination?.per_page || 15)),
    [pagination]
  );

  const handleDelete = async (row) => {
    if (!window.confirm(`¿Eliminar grupo ${row.codigo}?`)) return;
    try {
      await deleteGrupo(row.id);
      load(page, filtroMateria, filtroTurno);
    } catch (err) {
      /* toast handled by hook */
    }
  };

  const handleFiltrar = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const columns = [
    { key: 'codigo', label: 'Código' },
    {
      key: 'nombre', label: 'Nombre',
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
      <HeaderBar createLabel="Nuevo Grupo" onCreate={() => navigate('/grupos/nuevo')} />

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
            loading={loading || loadingHook}
            onEdit={(row) => navigate(`/grupos/${row.id}/editar`)}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}
