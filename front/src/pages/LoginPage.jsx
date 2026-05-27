import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Alert from '../components/ui/Alert';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center login-bg">
      <div className="card shadow" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <i className="bi bi-shield-check" style={{ fontSize: '3rem', color: '#0d6efd' }}></i>
            <h3 className="mt-2">CUP - FICCT</h3>
            <p className="text-muted">Sistema de Admisión</p>
          </div>

          <Alert type="danger" message={error} />

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Usuario</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-person"></i></span>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Contraseña</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock"></i></span>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
