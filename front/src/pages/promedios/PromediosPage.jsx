import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import useAuthStore from '../../store/authStore';
import usePromedios from '../../hooks/usePromedios';
import usePostulaciones from '../../hooks/usePostulaciones';
import Loader from '../../components/ui/Loader';
import StatCard from '../../components/ui/StatCard';
import BadgeStatus from '../../components/ui/BadgeStatus';

export default function PromediosPage() {
  const { user } = useAuthStore();
  const tipo = user?.tipo;

  if (tipo === 'postulante') return <PostulantePromedios />;
  if (tipo === 'docente') return <DocentePromedios />;
  return <AdminPromedios />;
}

function PostulantePromedios() {
  const { user } = useAuthStore();
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
                <BadgeStatus value={post.estado} />
              </div>
              <div className="card-body">
                {prom ? (
                  <>
                    <div className="row g-2 mb-3">
                      {[
                        { label: 'Matematicas (30%)', key: 'promedio_matematicas', color: 'primary' },
                        { label: 'Fisica (30%)', key: 'promedio_fisica', color: 'success' },
                        { label: 'Computacion (30%)', key: 'promedio_computacion', color: 'warning' },
                        { label: 'Ingles (10%)', key: 'promedio_ingles', color: 'info' },
                      ].map((m) => {
                        const val = Number(prom[m.key]);
                        return (
                          <div className="col-md-3" key={m.key}>
                            <StatCard title={m.label} value={prom[m.key] ?? '-'} color={m.color} variant="border" />
                            <BadgeStatus value={val >= 60 ? 'aprobado' : 'reprobado'} />
                          </div>
                        );
                      })}
                    </div>
                    <div className="d-flex align-items-center gap-3 p-3 bg-light rounded">
                      <strong className="fs-4">Promedio General: {prom.promedio_general ?? '-'}</strong>
                      {prom.todas_aprobadas
                        ? <BadgeStatus value="aprobado" />
                        : <BadgeStatus value="reprobado" />}
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
      <p className="text-muted">Seleccione un grupo y examen para ver los promedios en la seccion <Link to="/notas">Notas</Link>.</p>
    </div>
  );
}

function AdminPromedios() {
  return (
    <div>
      <h4 className="mb-4">Promedios</h4>
      <p className="text-muted">Consulte los promedios desde la seccion <Link to="/admisiones">Control de Admision</Link> o desde <Link to="/reportes">Reportes</Link>.</p>
    </div>
  );
}
