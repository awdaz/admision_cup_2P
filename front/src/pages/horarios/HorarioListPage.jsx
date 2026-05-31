import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import useHorarios from '../../hooks/useHorarios';
import useGrupos from '../../hooks/useGrupos';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function HorarioListPage() {
  const navigate = useNavigate();
  const { getHorarios, deleteHorario, loading } = useHorarios();
  const { getGrupos } = useGrupos();
  const [horarios, setHorarios] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [filtroDia, setFiltroDia] = useState('');

  useEffect(() => {
    (async () => {
      const d = await getGrupos(1);
      if (d) setGrupos(d.data || d.grupos || []);
    })();
  }, [getGrupos]);

  const load = useCallback(async () => {
    try {
      const params = {};
      if (filtroGrupo) params.grupo_id = filtroGrupo;
      if (filtroDia) params.dia = filtroDia;
      const data = await getHorarios(params);
      if (data) {
        setHorarios(Array.isArray(data) ? data : data.data || data.horarios || []);
      }
    } catch (err) {
      toast.error(err.message);
    }
  }, [getHorarios, filtroGrupo, filtroDia]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (row) => {
    if (!window.confirm(`¿Eliminar horario de ${row.dia} ${row.hora_inicio}-${row.hora_fin}?`)) return;
    try {
      await deleteHorario(row.id);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Horarios</h4>
        <button className="btn btn-primary" onClick={() => navigate('/horarios/nuevo')}>
          <i className="bi bi-plus-lg me-1"></i>Nuevo Horario
        </button>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-auto">
          <select className="form-select" value={filtroGrupo} onChange={(e) => setFiltroGrupo(e.target.value)}>
            <option value="">Todos los grupos</option>
            {grupos.map((g) => (
              <option key={g.id} value={g.id}>{g.codigo} - {g.materia?.nombre}</option>
            ))}
          </select>
        </div>
        <div className="col-auto">
          <select className="form-select" value={filtroDia} onChange={(e) => setFiltroDia(e.target.value)}>
            <option value="">Todos los días</option>
            {DIAS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="col-auto">
          <button className="btn btn-outline-secondary" onClick={load}><i className="bi bi-funnel"></i> Filtrar</button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : horarios.length === 0 ? (
        <div className="alert alert-info">No hay horarios registrados.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Día</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Grupo</th>
                <th>Materia</th>
                <th>Aula</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {horarios.map((h) => (
                <tr key={h.id}>
                  <td>{h.dia}</td>
                  <td>{h.hora_inicio}</td>
                  <td>{h.hora_fin}</td>
                  <td>{h.grupo?.codigo || '-'}</td>
                  <td>{h.grupo?.materia?.nombre || '-'}</td>
                  <td>{h.aula?.nombre || '-'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => navigate(`/horarios/${h.id}/editar`)}>
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(h)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
