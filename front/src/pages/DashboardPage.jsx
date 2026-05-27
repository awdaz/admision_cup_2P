import { useState, useEffect } from 'react';
import cliente from '../api/cliente';
import Loader from '../components/ui/Loader';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await cliente.get('/dashboard/stats');
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="alert alert-danger">{error}</div>
    );
  }

  const cards = [
    { label: 'Total Postulantes', value: stats?.total_postulantes || 0, icon: 'bi-people', color: 'primary' },
    { label: 'Postulantes Verificados', value: stats?.postulantes_verificados || 0, icon: 'bi-check-circle', color: 'success' },
    { label: 'Pagos Pendientes', value: stats?.pagos_pendientes || 0, icon: 'bi-clock', color: 'warning' },
    { label: 'Pagos Confirmados', value: stats?.pagos_confirmados || 0, icon: 'bi-credit-card', color: 'info' },
  ];

  return (
    <div>
      <h4 className="mb-4">Dashboard</h4>
      <div className="row g-4">
        {cards.map((card, idx) => (
          <div className="col-12 col-sm-6 col-xl-3" key={idx}>
            <div className={`card border-start border-4 border-${card.color} shadow-sm h-100`}>
              <div className="card-body d-flex align-items-center">
                <div className={`me-3 fs-1 text-${card.color}`}>
                  <i className={`bi ${card.icon}`}></i>
                </div>
                <div>
                  <p className="card-text text-muted mb-0">{card.label}</p>
                  <h3 className="card-title mb-0">{card.value}</h3>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
