// Página de Reportes — renderiza el reporte adecuado según el rol del usuario
import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import { toast } from 'sonner';
import useReportes from '../../hooks/useReportes';

// Componente raíz que selecciona el reporte según user.tipo
export default function ReportesPage() {
  const user = useAuthStore((s) => s.user);
  const tipo = user?.tipo;

  if (tipo === 'admin') return <ReporteAdmision />;
  if (tipo === 'docente') return <ReporteDocente />;
  return <ReportePostulante />;
}

// Reporte global de admisión (solo administradores) con resumen y desglose por carrera
function ReporteAdmision() {
  const { getReporteAdmision, loading } = useReportes();
  const [data, setData] = useState(null); // Datos del reporte desde el servidor

  // Obtiene el reporte de admisión al montar el componente
  useEffect(() => {
    (async () => {
      try {
        const d = await getReporteAdmision();
        if (d) setData(d);
      } catch (err) {
        toast.error(err.message);
      }
    })();
  }, [getReporteAdmision]);

  if (loading && !data) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  const resumen = data?.resumen || {};
  const porCarrera = data?.por_carrera || [];

  return (
    <div>
      <h4 className="mb-4">Reporte de Admisión</h4>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card text-bg-primary">
            <div className="card-body text-center">
              <h5 className="card-title">{resumen.total_postulantes || 0}</h5>
              <p className="card-text mb-0">Postulantes</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-bg-info">
            <div className="card-body text-center">
              <h5 className="card-title">{resumen.total_postulaciones || 0}</h5>
              <p className="card-text mb-0">Postulaciones</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-bg-success">
            <div className="card-body text-center">
              <h5 className="card-title">{resumen.admitidos || 0}</h5>
              <p className="card-text mb-0">Admitidos</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-bg-warning">
            <div className="card-body text-center">
              <h5 className="card-title">${resumen.pagos_confirmados || 0}</h5>
              <p className="card-text mb-0">Recaudado</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header"><strong>Por Carrera</strong></div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Carrera</th>
                <th>Inscritos</th>
                <th>Admitidos</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {porCarrera.map((c) => (
                <tr key={c.id}>
                  <td>{c.nombre}</td>
                  <td>{c.inscritos || 0}</td>
                  <td>{c.admitidos || 0}</td>
                  <td>{c.total_postulaciones || 0}</td>
                </tr>
              ))}
              {porCarrera.length === 0 && (
                <tr><td colSpan="4" className="text-center text-muted">No hay datos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Reporte del docente: resumen de sus grupos, estudiantes y exámenes
function ReporteDocente() {
  const { getReporteDocenteMisGrupos, loading } = useReportes();
  const [data, setData] = useState(null); // Datos del reporte del docente

  // Obtiene los grupos asignados al docente y sus estadísticas
  useEffect(() => {
    (async () => {
      try {
        const d = await getReporteDocenteMisGrupos();
        if (d) setData(d);
      } catch (err) {
        toast.error(err.message);
      }
    })();
  }, [getReporteDocenteMisGrupos]);

  if (loading && !data) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  const stats = data?.stats || {};
  const grupos = data?.grupos || [];

  return (
    <div>
      <h4 className="mb-4">Mis Grupos</h4>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card text-bg-primary">
            <div className="card-body text-center">
              <h5>{stats.total_grupos || 0}</h5>
              <p className="mb-0">Grupos</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-bg-info">
            <div className="card-body text-center">
              <h5>{stats.total_estudiantes || 0}</h5>
              <p className="mb-0">Estudiantes</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-bg-success">
            <div className="card-body text-center">
              <h5>{stats.total_examenes || 0}</h5>
              <p className="mb-0">Exámenes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header"><strong>Grupos Asignados</strong></div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Materia</th>
                <th>Cupo</th>
                <th>Estudiantes</th>
                <th>Exámenes</th>
              </tr>
            </thead>
            <tbody>
              {grupos.map((g) => (
                <tr key={g.id}>
                  <td>{g.codigo}</td>
                  <td>{g.nombre}</td>
                  <td>{g.materia?.nombre || '-'}</td>
                  <td>{g.cupo}</td>
                  <td>{g.postulacionGrupos?.length || 0}</td>
                  <td>{g.examenes?.length || 0}</td>
                </tr>
              ))}
              {grupos.length === 0 && (
                <tr><td colSpan="6" className="text-center text-muted">No tienes grupos asignados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Reporte del postulante: muestra sus postulaciones, notas y pagos
function ReportePostulante() {
  const { getReportePostulanteMisNotas, loading } = useReportes();
  const [data, setData] = useState(null); // Datos del reporte del postulante

  // Obtiene las postulaciones y notas del postulante logueado
  useEffect(() => {
    (async () => {
      try {
        const d = await getReportePostulanteMisNotas();
        if (d) setData(d);
      } catch (err) {
        toast.error(err.message);
      }
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
        postulaciones.map((post) => (
          <div key={post.id} className="card shadow-sm mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <strong>Postulación #{post.id}</strong>
              <span className={`badge bg-${post.estado === 'admitido' ? 'success' : post.estado === 'inscrito' ? 'info' : post.estado === 'pendiente' ? 'warning' : 'secondary'}`}>
                {post.estado}
              </span>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-4"><strong>1ra Opción:</strong> {post.primeraOpcion?.nombre || '-'}</div>
                <div className="col-md-4"><strong>2da Opción:</strong> {post.segundaOpcion?.nombre || '-'}</div>
                <div className="col-md-4"><strong>Asignada:</strong> {post.carreraAsignada?.nombre || '-'}</div>
                <div className="col-md-4"><strong>Turno:</strong> {post.turno?.nombre || '-'}</div>
                <div className="col-md-4"><strong>Semestre:</strong> {post.semestre?.nombre || '-'}</div>
              </div>

              {post.rindes && post.rindes.length > 0 && (
                <>
                  <h6 className="text-muted">Notas</h6>
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Materia</th>
                        <th>Examen</th>
                        <th>Nota</th>
                      </tr>
                    </thead>
                    <tbody>
                      {post.rindes.map((r) => (
                        <tr key={r.id}>
                          <td>{r.examen?.grupo?.materia?.nombre || '-'}</td>
                          <td>{r.examen?.nro || '-'}</td>
                          <td><strong>{r.nota ?? '-'}</strong></td>
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
                    <span key={p.id} className="badge bg-success me-1">
                      ${p.monto} - {p.estado}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
