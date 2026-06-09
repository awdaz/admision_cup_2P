import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import useAuthStore from '../store/authStore';
import cliente from '../api/cliente';
import Loader from '../components/ui/Loader';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const tipo = user?.tipo;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await cliente.get('/dashboard/stats');
        setStats(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h4 className="mb-4">Dashboard</h4>

      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-start border-4 border-primary shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="me-3 fs-1 text-primary"><i className="bi bi-people"></i></div>
              <div>
                <p className="card-text text-muted mb-0">Total Postulantes</p>
                <h3 className="card-title mb-0">{stats?.total_postulantes || 0}</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-start border-4 border-success shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="me-3 fs-1 text-success"><i className="bi bi-check-circle"></i></div>
              <div>
                <p className="card-text text-muted mb-0">Postulantes Verificados</p>
                <h3 className="card-title mb-0">{stats?.postulantes_verificados || 0}</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-start border-4 border-warning shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="me-3 fs-1 text-warning"><i className="bi bi-clock"></i></div>
              <div>
                <p className="card-text text-muted mb-0">Pagos Pendientes</p>
                <h3 className="card-title mb-0">{stats?.pagos_pendientes || 0}</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-start border-4 border-info shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="me-3 fs-1 text-info"><i className="bi bi-credit-card"></i></div>
              <div>
                <p className="card-text text-muted mb-0">Pagos Confirmados</p>
                <h3 className="card-title mb-0">{stats?.pagos_confirmados || 0}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {tipo !== 'postulante' && (
        <div className="row g-4 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-start border-4 border-secondary shadow-sm h-100">
              <div className="card-body d-flex align-items-center">
                <div className="me-3 fs-1 text-secondary"><i className="bi bi-file-earmark-text"></i></div>
                <div>
                  <p className="card-text text-muted mb-0">Postulaciones Inscritas</p>
                  <h3 className="card-title mb-0">{stats?.postulaciones_inscritas || 0}</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-start border-4 border-success shadow-sm h-100">
              <div className="card-body d-flex align-items-center">
                <div className="me-3 fs-1 text-success"><i className="bi bi-check2-all"></i></div>
                <div>
                  <p className="card-text text-muted mb-0">Verificacion</p>
                  <h3 className="card-title mb-0">
                    {stats?.total_postulantes > 0
                      ? Math.round((stats?.postulantes_verificados / stats?.total_postulantes) * 100)
                      : 0}%
                  </h3>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-start border-4 border-primary shadow-sm h-100">
              <div className="card-body d-flex align-items-center">
                <div className="me-3 fs-1 text-primary"><i className="bi bi-bar-chart"></i></div>
                <div>
                  <p className="card-text text-muted mb-0">Postulantes Verificados</p>
                  <div className="progress" style={{ height: 8 }}>
                    <div
                      className="progress-bar bg-success"
                      style={{ width: stats?.total_postulantes > 0 ? ((stats?.postulantes_verificados / stats?.total_postulantes) * 100) + '%' : '0%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-start border-4 border-warning shadow-sm h-100">
              <div className="card-body d-flex align-items-center">
                <div className="me-3 fs-1 text-warning"><i className="bi bi-currency-dollar"></i></div>
                <div>
                  <p className="card-text text-muted mb-0">Cobranza</p>
                  <div className="progress" style={{ height: 8 }}>
                    <div
                      className="progress-bar bg-warning"
                      style={{ width: (stats?.pagos_pendientes + stats?.pagos_confirmados) > 0
                        ? ((stats?.pagos_confirmados / (stats?.pagos_pendientes + stats?.pagos_confirmados)) * 100) + '%' : '0%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-header"><strong>Acceso Rapido</strong></div>
        <div className="card-body">
          <div className="row g-2">
            {tipo === 'admin' && (
              <>
                <a href="/postulantes" className="btn btn-outline-primary col-auto"><i className="bi bi-people me-1"></i>Postulantes</a>
                <a href="/docentes" className="btn btn-outline-primary col-auto"><i className="bi bi-mortarboard me-1"></i>Docentes</a>
                <a href="/admisiones" className="btn btn-outline-success col-auto"><i className="bi bi-check2-circle me-1"></i>Admision</a>
                <a href="/notas" className="btn btn-outline-info col-auto"><i className="bi bi-clipboard-data me-1"></i>Notas</a>
                <a href="/reportes" className="btn btn-outline-secondary col-auto"><i className="bi bi-bar-chart me-1"></i>Reportes</a>
              </>
            )}
            {tipo === 'docente' && (
              <>
                <a href="/notas" className="btn btn-outline-primary col-auto"><i className="bi bi-clipboard-data me-1"></i>Registrar Notas</a>
                <a href="/grupos" className="btn btn-outline-success col-auto"><i className="bi bi-layers me-1"></i>Mis Grupos</a>
                <a href="/reportes" className="btn btn-outline-info col-auto"><i className="bi bi-bar-chart me-1"></i>Reportes</a>
              </>
            )}
            {tipo === 'postulante' && (
              <>
                <a href="/notas" className="btn btn-outline-primary col-auto"><i className="bi bi-clipboard-data me-1"></i>Mis Notas</a>
                <a href="/promedios" className="btn btn-outline-success col-auto"><i className="bi bi-calculator me-1"></i>Mis Promedios</a>
                <a href="/postulaciones/nueva" className="btn btn-outline-info col-auto"><i className="bi bi-file-earmark-plus me-1"></i>Postular</a>
                <a href="/reportes" className="btn btn-outline-secondary col-auto"><i className="bi bi-bar-chart me-1"></i>Reportes</a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
