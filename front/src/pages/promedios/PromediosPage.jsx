import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import useAuthStore from '../../store/authStore';
import usePromedios from '../../hooks/usePromedios';
import usePostulaciones from '../../hooks/usePostulaciones';
import Loader from '../../components/ui/Loader';

export default function PromediosPage() {
  const user = useAuthStore((s) => s.user);
  const tipo = user?.tipo;

  if (tipo === 'postulante') return <PostulantePromedios />;
  if (tipo === 'docente') return <DocentePromedios />;
  return <AdminPromedios />;
}

function PostulantePromedios() {
  const user = useAuthStore((s) => s.user);
  const { getPromedios } = usePromedios();
  const { getPostulaciones } = usePostulaciones();
  const [postulaciones, setPostulaciones] = useState([]);
  const [promediosData, setPromediosData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPostulaciones();
        const list = Array.isArray(data) ? data : (data?.data || []);
        setPostulaciones(list);
        for (const p of list) {
          try {
            const prom = await getPromedios(p.id);
            if (prom) setPromediosData(prev => ({ ...prev, [p.id]: prom }));
          } catch {}
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [getPromedios, getPostulaciones]);

  if (loading) return <Loader />;

  return (
    <div>
      <h4 className="mb-4">Mis Promedios</h4>
      {postulaciones.length === 0 ? (
        <div className="alert alert-info">No tienes postulaciones registradas.</div>
      ) : (
        postulaciones.map((post) => {
          const prom = promediosData[post.id]?.promedios;
          return (
            <div key={post.id} className="card shadow-sm mb-3">
              <div className="card-header">
                <strong>{post.primeraOpcion?.nombre || 'Postulacion #' + post.id}</strong>
                <span className={"ms-2 badge bg-" + (post.estado === 'admitido' ? 'success' : post.estado === 'inscrito' ? 'info' : post.estado === 'pendiente' ? 'warning' : 'secondary')}>
                  {post.estado}
                </span>
              </div>
              <div className="card-body">
                {prom ? (
                  <>
                    <div className="row g-2 mb-3">
                      {[
                        { label: 'Matematicas (30%)', key: 'promedio_matematicas' },
                        { label: 'Fisica (30%)', key: 'promedio_fisica' },
                        { label: 'Computacion (30%)', key: 'promedio_computacion' },
                        { label: 'Ingles (10%)', key: 'promedio_ingles' },
                      ].map((m) => {
                        const val = Number(prom[m.key]);
                        return (
                          <div className="col-md-3" key={m.key}>
                            <div className={"card " + (val >= 60 ? 'border-success' : 'border-danger')}>
                              <div className="card-body text-center py-2">
                                <small className="text-muted d-block">{m.label}</small>
                                <strong className={"fs-5 " + (val >= 60 ? 'text-success' : 'text-danger')}>{prom[m.key] ?? '-'}</strong>
                                {val >= 60 ? <span className="badge bg-success ms-1">A</span> : <span className="badge bg-danger ms-1">R</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="d-flex align-items-center gap-3 p-3 bg-light rounded">
                      <strong className="fs-4">Promedio General: {prom.promedio_general ?? '-'}</strong>
                      {prom.todas_aprobadas
                        ? <span className="badge bg-success fs-6">APROBADO</span>
                        : <span className="badge bg-danger fs-6">REPROBADO</span>}
                    </div>
                  </>
                ) : (
                  <div className="alert alert-warning mb-0">No hay promedios calculados aun.</div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function DocentePromedios() {
  return (
    <div>
      <h4 className="mb-4">Promedios de Estudiantes</h4>
      <p className="text-muted">Seleccione un grupo y examen para ver los promedios en la seccion <a href="/notas">Notas</a>.</p>
    </div>
  );
}

function AdminPromedios() {
  return (
    <div>
      <h4 className="mb-4">Promedios</h4>
      <p className="text-muted">Consulte los promedios desde la seccion <a href="/admisiones">Control de Admision</a> o desde <a href="/reportes">Reportes</a>.</p>
    </div>
  );
}
