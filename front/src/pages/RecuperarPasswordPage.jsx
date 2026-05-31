import { useState } from 'react';
import { Link } from 'react-router-dom';
import cliente from '../api/cliente';
import Alert from '../components/ui/Alert';

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const data = await cliente.post('/forgot-password', { email });
      setMessage('Si el correo está registrado, recibirá las instrucciones.');
      if (data.token) {
        setMessage(`Token de recuperación (modo prueba): ${data.token}`);
      }
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
            <i className="bi bi-shield-lock" style={{ fontSize: '3rem', color: '#0d6efd' }}></i>
            <h3 className="mt-2">Recuperar Contraseña</h3>
            <p className="text-muted">Ingrese su correo electrónico registrado</p>
          </div>

          <Alert type="danger" message={error} />
          <Alert type="success" message={message} />

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label">Correo Electrónico</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Enviando...
                </>
              ) : 'Enviar Instrucciones'}
            </button>
          </form>

          <div className="text-center mt-3">
            <Link to="/login" className="text-decoration-none">
              <i className="bi bi-arrow-left me-1"></i>Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
