import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import useAuthStore from '../../store/authStore';
import useReportes from '../../hooks/useReportes';
import usePromedios from '../../hooks/usePromedios';
import useAdmisiones from '../../hooks/useAdmisiones';
import ProgressBar from '../../components/ui/ProgressBar';
import StatCard from '../../components/ui/StatCard';

export default function ReportesPage() {
  const { user } = useAuthStore();
  const tipo = user?.tipo;

  if (tipo === 'admin') return <ReporteAdmision />;
  if (tipo === 'docente') return <ReporteDocente />;
  return <ReportePostulante />;
}

function ReporteAdmision() {
  const { getReporteAdmision, loading } = useReportes();
  const { getCupos } = useAdmisiones();
  const [data, setData] = useState(null);
  const [cupos, setCupos] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const d = await getReporteAdmision();
        if (d) setData(d);
      } catch (err) { toast.error(err.message); }
    })();
  }, [getReporteAdmision]);

  useEffect(() => {
    (async () => {
      try {
        const d = await getCupos(1);
        if (d) setCupos(d);
      } catch {}
    })();
  }, [getCupos]);

  if (loading && !data) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  const resumen = data?.resumen || {};

  return (
    <div>
      <h4 className="mb-4">Reporte de Admision</h4>

      <div className="row g-3 mb-4">
        <StatCard title="Postulantes" value={resumen.total_postulantes} color="primary" variant="bg" />
        <StatCard title="Postulaciones" value={resumen.total_postulaciones} color="info" variant="bg" />
        <StatCard title="Inscritos" value={resumen.inscritos} color="success" variant="bg" />
        <StatCard title="Admitidos" value={resumen.admitidos} color="warning" variant="bg" />
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header"><strong>Distribucion por Estado</strong></div>
            <div className="card-body">
              {(function() {
                const total = (resumen.inscritos || 0) + (resumen.admitidos || 0) + (resumen.pendientes || 0);
                const items = [
                  { label: 'Inscritos', value: resumen.inscritos || 0, color: 'info' },
                  { label: 'Admitidos', value: resumen.admitidos || 0, color: 'success' },
                  { label: 'Pendientes', value: resumen.pendientes || 0, color: 'warning' },
                ];
                return items.map((item) => (
                  <div key={item.label} className="mb-2">
                    <div className="d-flex justify-content-between">
                      <span>{item.label}</span>
                      <span>{total > 0 ? Math.round((item.value / total) * 100) : 0}% ({item.value})</span>
                    </div>
                    <div className="progress" style={{ height: 12 }}>
                      <div className={"progress-bar bg-" + item.color} style={{ width: total > 0 ? ((item.value / total) * 100) + '%' : '0%' }}></div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header"><strong>Pagos</strong></div>
            <div className="card-body">
              <div className="mb-2">
                <div className="d-flex justify-content-between">
                  <span>Confirmados</span>
                  <span>${resumen.pagos_confirmados || 0}</span>
                </div>
              </div>
              <div className="mb-2">
                <div className="d-flex justify-content-between">
                  <span>Pendientes</span>
                  <span>{resumen.pagos_pendientes || 0} pagos</span>
                </div>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total pagos confirmados</strong>
                <strong>${resumen.pagos_confirmados || 0}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="table-responsive mb-4">
          <table className="table table-hover table-striped align-middle">
              <thead className="table-light">
                <tr>
                  <th>Carrera</th>
                <th>Inscritos</th>
                <th>Admitidos</th>
                <th>Total Postulaciones</th>
                <th>Ocupacion</th>
              </tr>
            </thead>
            <tbody>
              {(data?.por_carrera || []).map((c) => {
                const cupo = cupos?.carreras?.find((cx) => cx.id === c.id);
                const ocupacion = cupo?.cupo > 0 ? Math.round((cupo.admitidos / cupo.cupo) * 100) : 0;
                return (
                  <tr key={c.id}>
                    <td>{c.nombre}</td>
                    <td>{c.inscritos || 0}</td>
                    <td>{c.admitidos || 0}</td>
                    <td>{c.total_postulaciones || 0}</td>
                    <td style={{ width: 200 }}>
                      <ProgressBar value={ocupacion} height={20}>
                        {cupo ? (cupo.admitidos + '/' + cupo.cupo) : '-'}
                      </ProgressBar>
                    </td>
                  </tr>
                );
              })}
              {(data?.por_carrera || []).length === 0 && (
                <tr><td colSpan="5" className="text-center text-muted">No hay datos</td></tr>
              )}
            </tbody>
          </table>
        </div>

      <div className="text-end">
        <button className="btn btn-outline-secondary" onClick={() => window.print()}>
          <i className="bi bi-printer me-1"></i>Imprimir Reporte
        </button>
      </div>
    </div>
  );
}

function ReporteDocente() {
  const { getReporteDocenteMisGrupos, loading } = useReportes();
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const d = await getReporteDocenteMisGrupos();
        if (d) setData(d);
      } catch (err) { toast.error(err.message); }
    })();
  }, [getReporteDocenteMisGrupos]);

  if (loading && !data) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  const stats = data?.stats || {};
  const grupos = data?.grupos || [];

  return (
    <div>
      <h4 className="mb-4">Mis Grupos</h4>

      <div className="row g-3 mb-4">
        <StatCard title="Grupos" value={stats.total_grupos} color="primary" variant="bg" />
        <StatCard title="Estudiantes" value={stats.total_estudiantes} color="success" variant="bg" />
        <StatCard title="Examenes" value={stats.total_examenes} color="info" variant="bg" />
      </div>

      <div className="d-flex justify-content-between align-items-center mb-2">
          <strong>Grupos Asignados</strong>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => window.print()}>
            <i className="bi bi-printer"></i>
          </button>
        </div>
        <div className="table-responsive">
          <table className="table table-hover table-striped align-middle">
            <thead className="table-light">
              <tr>
                <th>Codigo</th>
                <th>Nombre</th>
                <th>Materia</th>
                <th>Cupo</th>
                <th>Estudiantes</th>
                <th>Examenes</th>
                <th>Ocupacion</th>
              </tr>
            </thead>
            <tbody>
              {grupos.map((g) => {
                const pct = g.cupo > 0 ? Math.round(((g.postulacion_grupos?.length || 0) / g.cupo) * 100) : 0;
                return (
                  <tr key={g.id}>
                    <td>{g.codigo}</td>
                    <td>{g.nombre}</td>
                    <td>{g.materia?.nombre || '-'}</td>
                    <td>{g.cupo}</td>
                    <td>{g.postulacion_grupos?.length || 0}</td>
                    <td>{g.examenes?.length || 0}</td>
                    <td style={{ width: 150 }}>
                      <ProgressBar value={pct} height={16} />
                    </td>
                  </tr>
                );
              })}
              {grupos.length === 0 && (
                <tr><td colSpan="7" className="text-center text-muted">No tienes grupos asignados</td></tr>
              )}
            </tbody>
          </table>
        </div>
    </div>
  );
}

function ReportePostulante() {
  const { getReportePostulanteMisNotas, loading } = useReportes();
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const d = await getReportePostulanteMisNotas();
        if (d) setData(d);
      } catch (err) { toast.error(err.message); }
    })();
  }, [getReportePostulanteMisNotas]);

  if (loading && !data) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  const postulaciones = data?.postulaciones || [];

  return (
    <div>
      <h4 className="mb-4">Mis Postulaciones y Notas</h4>
      {postulaciones.length === 0 ? (
        <div className="alert alert-info">No tienes postulaciones registradas.</div>
      ) : (
        postulaciones.map((post) => {
          const promValue = post.promedio_general;
          return (
            <div key={post.id} className="mb-4 p-3 border rounded">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <strong>Postulacion #{post.id}</strong>
                <span className={"badge bg-" + (post.estado === 'admitido' ? 'success' : post.estado === 'inscrito' ? 'info' : post.estado === 'pendiente' ? 'warning' : 'secondary')}>
                  {post.estado}
                </span>
              </div>
              <div className="row mb-3">
                  <div className="col-md-4"><strong>1ra Opcion:</strong> {post.primeraOpcion?.nombre || '-'}</div>
                  <div className="col-md-4"><strong>2da Opcion:</strong> {post.segundaOpcion?.nombre || '-'}</div>
                  <div className="col-md-4"><strong>Asignada:</strong> {post.carreraAsignada?.nombre || '-'}</div>
                  <div className="col-md-4"><strong>Turno:</strong> {post.turno?.nombre || '-'}</div>
                  <div className="col-md-4"><strong>Semestre:</strong> {post.semestre?.nombre || '-'}</div>
                  <div className="col-md-4"><strong>Promedio General:</strong> {promValue ?? '-'}</div>
                </div>

                {post.rindes && post.rindes.length > 0 && (
                  <>
                    <h6 className="text-muted">Notas</h6>
                    <table className="table table-hover table-striped align-middle table-sm">
                      <thead className="table-light">
                        <tr>
                          <th>Materia</th>
                          <th>Examen</th>
                          <th>Nota</th>
                          <th>Resultado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {post.rindes.map((r) => (
                          <tr key={r.id} className={r.nota >= 60 ? 'table-success' : 'table-danger'}>
                            <td>{r.examen?.grupo?.materia?.nombre || '-'}</td>
                            <td>{r.examen?.nro || '-'}</td>
                            <td><strong>{r.nota ?? '-'}</strong></td>
                            <td>{r.nota >= 60 ? <span className="badge bg-success">Aprobado</span> : <span className="badge bg-danger">Reprobado</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}

                {post.pagos && post.pagos.length > 0 && (
                  <div className="mt-2">
                    <h6 className="text-muted">Pagos</h6>
                    {post.pagos.map((p) => (
                      <span key={p.id} className={"badge me-1 " + (p.estado === 'confirmado' ? 'bg-success' : 'bg-warning')}>
                        ${p.monto} - {p.estado}
                      </span>
                    ))}
                  </div>
                )}
            </div>
          );
        })
      )}
    </div>
  );
}
