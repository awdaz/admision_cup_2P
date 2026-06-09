import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import useAuthStore from '../store/authStore';
import cliente from '../api/cliente';
import Loader from '../components/ui/Loader';
import StatCard from '../components/ui/StatCard';
import ProgressBar from '../components/ui/ProgressBar';
import FormCard from '../components/ui/FormCard';

export default function DashboardPage() {
  const { user } = useAuthStore();
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
      <div className="row g-4 mb-4">
        <StatCard title="Total Postulantes" value={stats?.total_postulantes} color="primary" icon="bi bi-people" colClass="col-12 col-sm-6 col-xl-3" />
        <StatCard title="Postulantes Verificados" value={stats?.postulantes_verificados} color="success" icon="bi bi-check-circle" colClass="col-12 col-sm-6 col-xl-3" />
        <StatCard title="Pagos Pendientes" value={stats?.pagos_pendientes} color="warning" icon="bi bi-clock" colClass="col-12 col-sm-6 col-xl-3" />
        <StatCard title="Pagos Confirmados" value={stats?.pagos_confirmados} color="info" icon="bi bi-credit-card" colClass="col-12 col-sm-6 col-xl-3" />
      </div>

      {tipo !== 'postulante' && (
        <div className="row g-4 mb-4">
          <StatCard title="Postulaciones Inscritas" value={stats?.postulaciones_inscritas} color="secondary" icon="bi bi-file-earmark-text" colClass="col-12 col-sm-6 col-xl-3" />
          <StatCard title="Verificacion" value={stats?.total_postulantes > 0 ? Math.round((stats?.postulantes_verificados / stats?.total_postulantes) * 100) + '%' : '0%'} color="success" icon="bi bi-check2-all" colClass="col-12 col-sm-6 col-xl-3" />
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-start border-4 border-primary shadow-sm h-100">
              <div className="card-body d-flex align-items-center">
                <div className="me-3 fs-1 text-primary"><i className="bi bi-bar-chart"></i></div>
                <div>
                  <p className="card-text text-muted mb-0">Postulantes Verificados</p>
                    <ProgressBar value={stats?.total_postulantes > 0 ? Math.round((stats?.postulantes_verificados / stats?.total_postulantes) * 100) : 0} height={8} />
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
                    <ProgressBar value={(stats?.pagos_pendientes + stats?.pagos_confirmados) > 0 ? Math.round((stats?.pagos_confirmados / (stats?.pagos_pendientes + stats?.pagos_confirmados)) * 100) : 0} height={8} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <FormCard title="Acceso Rapido" className="">
          <div className="row g-2">
            {tipo === 'admin' && (
              <>
                <Link to="/postulantes" className="btn btn-outline-primary col-auto"><i className="bi bi-people me-1"></i>Postulantes</Link>
                <Link to="/docentes" className="btn btn-outline-primary col-auto"><i className="bi bi-mortarboard me-1"></i>Docentes</Link>
                <Link to="/admisiones" className="btn btn-outline-success col-auto"><i className="bi bi-check2-circle me-1"></i>Admision</Link>
                <Link to="/notas" className="btn btn-outline-info col-auto"><i className="bi bi-clipboard-data me-1"></i>Notas</Link>
                <Link to="/reportes" className="btn btn-outline-secondary col-auto"><i className="bi bi-bar-chart me-1"></i>Reportes</Link>
              </>
            )}
            {tipo === 'docente' && (
              <>
                <Link to="/notas" className="btn btn-outline-primary col-auto"><i className="bi bi-clipboard-data me-1"></i>Registrar Notas</Link>
                <Link to="/grupos" className="btn btn-outline-success col-auto"><i className="bi bi-layers me-1"></i>Mis Grupos</Link>
                <Link to="/reportes" className="btn btn-outline-info col-auto"><i className="bi bi-bar-chart me-1"></i>Reportes</Link>
              </>
            )}
            {tipo === 'postulante' && (
              <>
                <Link to="/notas" className="btn btn-outline-primary col-auto"><i className="bi bi-clipboard-data me-1"></i>Mis Notas</Link>
                <Link to="/promedios" className="btn btn-outline-success col-auto"><i className="bi bi-calculator me-1"></i>Mis Promedios</Link>
                <Link to="/postulaciones/nueva" className="btn btn-outline-info col-auto"><i className="bi bi-file-earmark-plus me-1"></i>Postular</Link>
                <Link to="/reportes" className="btn btn-outline-secondary col-auto"><i className="bi bi-bar-chart me-1"></i>Reportes</Link>
              </>
            )}
          </div>
      </FormCard>
    </div>
  );
}
