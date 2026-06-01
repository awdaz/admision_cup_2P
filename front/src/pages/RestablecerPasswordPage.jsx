import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import cliente from '../api/cliente';
import Alert from '../components/ui/Alert';

// Página para restablecer la contraseña usando un token de recuperación
// Ruta: "/reset-password" — Acceso: Público (con token válido)
// Permite al usuario ingresar email, token y nueva contraseña para cambiar su clave
export default function RestablecerPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Email precargado desde query param ?email=
  const initialEmail = searchParams.get('email') || '';

  // Correo electrónico del usuario
  const [email, setEmail] = useState(initialEmail);
  // Token de recuperación recibido por correo
  const [token, setToken] = useState('');
  // Nueva contraseña ingresada
  const [password, setPassword] = useState('');
  // Confirmación de la nueva contraseña
  const [passwordConfirm, setPasswordConfirm] = useState('');
  // Indica si la solicitud de restablecimiento está en curso
  const [loading, setLoading] = useState(false);
  // Mensaje de error del servidor
  const [error, setError] = useState('');
  // Mensaje de éxito al restablecer la contraseña
  const [success, setSuccess] = useState('');

  // Envía email + token + nueva contraseña al backend; redirige al login tras 2 segundos
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== passwordConfirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await cliente.post('/reset-password', { email, token, password });
      setSuccess('Contraseña restablecida correctamente.');
      setTimeout(() => navigate('/login'), 2000);
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
            <i className="bi bi-key" style={{ fontSize: '3rem', color: 'var(--primary)' }}></i>
            <h3 className="mt-2">Restablecer Contraseña</h3>
            <p className="text-muted">Ingrese su nueva contraseña</p>
          </div>

          <Alert type="danger" message={error} />
          <Alert type="success" message={success} />

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Correo Electrónico</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Token de Recuperación</label>
              <input type="text" className="form-control" value={token} onChange={(e) => setToken(e.target.value)} required placeholder="Ingrese el token recibido" />
            </div>

            <div className="mb-3">
              <label className="form-label">Nueva Contraseña</label>
              <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>

            <div className="mb-4">
              <label className="form-label">Confirmar Contraseña</label>
              <input type="password" className="form-control" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required minLength={6} />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Restableciendo...
                </>
              ) : 'Restablecer Contraseña'}
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
