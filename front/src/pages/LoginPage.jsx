import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'sonner';
import useAuthStore from '../store/authStore';

// Página de inicio de sesión
// Ruta: "/login" — Acceso: Público (usuarios no autenticados)
// Permite al usuario ingresar con username y contraseña, redirige al dashboard
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  // Almacena el nombre de usuario ingresado
  const [username, setUsername] = useState('');
  // Almacena la contraseña ingresada
  const [password, setPassword] = useState('');
  // Indica si la solicitud de login está en curso
  const [loading, setLoading] = useState(false);

  // Muestra un toast si se navegó aquí con un mensaje de éxito (ej. registro exitoso)
  useEffect(() => {
    if (location.state?.success) {
      toast.success(location.state.success);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Se ejecuta al enviar el formulario: llama al store de autenticación y redirige
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center login-bg">
      <div className="card shadow" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <i className="bi bi-shield-check" style={{ fontSize: '3rem', color: 'var(--primary)' }}></i>
            <h3 className="mt-2">CUP - FICCT</h3>
            <p className="text-muted">Sistema de Admisión</p>
          </div>

          {/* Formulario de login con campos de usuario y contraseña */}
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

          {/* Enlaces de ayuda: recuperar contraseña, registro, volver al inicio */}
          <div className="text-center mt-3 d-flex flex-column gap-1">
            <Link to="/recuperar-password" className="text-decoration-none small">
              <i className="bi bi-question-circle me-1"></i>¿Olvidaste tu contraseña?
            </Link>
            <Link to="/registro" className="text-decoration-none small">
              <i className="bi bi-person-plus me-1"></i>¿No tienes cuenta? Regístrate
            </Link>
            <Link to="/" className="text-decoration-none small text-muted">
              <i className="bi bi-house me-1"></i>Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
