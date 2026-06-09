import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import useAdmisiones from '../../hooks/useAdmisiones';

export default function AdmisionListPage() {
  const { getAdmisiones, getCupos } = useAdmisiones();
  const [admisiones, setAdmisiones] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedGestion, setSelectedGestion] = useState('');
  const [cupos, setCupos] = useState(null);

  const loadAdmisiones = useCallback(async () => {
    try {
      const data = await getAdmisiones();
      const list = Array.isArray(data) ? data : (data?.data || []);
      setAdmisiones(list);
      const currentYear = String(new Date().getFullYear());
      if (list.some(a => String(a.gestion) === currentYear)) {
        setSelectedGestion(currentYear);
      } else if (list.length > 0) {
        setSelectedGestion(String(list[0].gestion));
      }
    } catch (err) {
      toast.error(err.message);
    }
  }, [getAdmisiones]);

  useEffect(() => { loadAdmisiones(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [loadAdmisiones]);

  const gestiones = useMemo(() => {
    const set = new Set(admisiones.map(a => a.gestion));
    return [...set].sort((a, b) => b - a);
  }, [admisiones]);

  const admisionesFiltradas = useMemo(() => {
    if (!selectedGestion) return admisiones;
    return admisiones.filter(a => String(a.gestion) === selectedGestion);
  }, [admisiones, selectedGestion]);

  const loadCupos = useCallback(async (id) => {
    try {
      const data = await getCupos(id);
      if (data) setCupos(data);
    } catch (err) {
      toast.error(err.message);
    }
  }, [getCupos]);

  useEffect(() => {
    if (admisionesFiltradas.length > 0) {
      const currentId = Number(selectedId);
      const stillExists = admisionesFiltradas.some(a => a.id === currentId);
      if (!stillExists) setSelectedId(admisionesFiltradas[0].id); // eslint-disable-line react-hooks/set-state-in-effect
    } else {
      setSelectedId(null);
    }
  }, [admisionesFiltradas, selectedId]);

  useEffect(() => {
    if (selectedId) {
      loadCupos(selectedId); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [selectedId, loadCupos]);

  const selectedAdmision = admisiones.find(a => a.id === Number(selectedId));

  const r = cupos?.resumen || {};

  return (
    <div>
      <h4 className="mb-4">Control de Admisión y Cupos</h4>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <select className="form-select" value={selectedGestion} onChange={(e) => setSelectedGestion(e.target.value)}>
            <option value="">Seleccionar gestión...</option>
            {gestiones.map((g) => (
              <option key={g} value={g}>Gestión {g}</option>
            ))}
          </select>
        </div>
        <div className="col-md d-flex align-items-center">
          {selectedAdmision && (
            <span className={`badge fs-6 bg-${selectedAdmision.estado === 'activo' ? 'success' : selectedAdmision.estado === 'finalizada' ? 'secondary' : 'warning'}`}>
              {selectedAdmision.estado}
            </span>
          )}
        </div>
      </div>

      {cupos && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card text-bg-success">
                <div className="card-body text-center">
                  <h5>{r.total_admitidos || 0}</h5>
                  <p className="mb-0">Admitidos</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-bg-danger">
                <div className="card-body text-center">
                  <h5>{r.total_rechazados || 0}</h5>
                  <p className="mb-0">Rechazados</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-bg-primary">
                <div className="card-body text-center">
                  <h5>{r.total_inscritos || 0}</h5>
                  <p className="mb-0">Inscritos</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-bg-warning">
                <div className="card-body text-center">
                  <h5>{r.total_pendientes || 0}</h5>
                  <p className="mb-0">Pendientes</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <strong>Cupos por Carrera</strong>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => loadCupos(selectedId)}>
                <i className="bi bi-arrow-clockwise"></i>
              </button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover table-striped align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Carrera</th>
                    <th>Cupo Total</th>
                    <th>Admitidos</th>
                    <th>Vacantes</th>
                    <th>Ocupación</th>
                  </tr>
                </thead>
                <tbody>
                  {(cupos?.carreras || []).map((c) => {
                    const pct = c.cupo > 0 ? Math.round((c.admitidos / c.cupo) * 100) : 0;
                    return (
                      <tr key={c.id}>
                        <td>{c.nombre}</td>
                        <td>{c.cupo}</td>
                        <td>{c.admitidos}</td>
                        <td>{c.vacantes}</td>
                        <td>
                          <div className="progress" style={{ height: 20 }}>
                            <div className={`progress-bar ${pct >= 100 ? 'bg-danger' : pct >= 75 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${pct}%` }}>
                              {pct}%
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {(!cupos?.carreras || cupos.carreras.length === 0) && (
                    <tr><td colSpan="5" className="text-center text-muted">No hay datos</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
