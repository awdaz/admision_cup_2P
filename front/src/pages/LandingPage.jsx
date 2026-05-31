import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <nav className="navbar navbar-light bg-white shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-bold">
            <i className="bi bi-shield-check me-2 text-primary"></i>CUP - FICCT
          </span>
          <Link to="/login" className="btn btn-primary">
            <i className="bi bi-box-arrow-in-right me-1"></i>Ingresar
          </Link>
        </div>
      </nav>

      <header className="flex-grow-1 d-flex align-items-center" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div className="container text-center text-white py-5">
          <i className="bi bi-shield-check" style={{ fontSize: '5rem' }}></i>
          <h1 className="display-4 fw-bold mt-3">CUP - FICCT</h1>
          <p className="lead fs-4 mb-1">Sistema de Admisión Universitaria</p>
          <p className="fs-5 mb-4" style={{ opacity: 0.9 }}>
            Centro de Universitario de Postulación<br />
            Facultad Integral de Ciencia y Tecnología
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/login" className="btn btn-light btn-lg px-5 fw-semibold">
              <i className="bi bi-box-arrow-in-right me-2"></i>Ingresar al Sistema
            </Link>
            <Link to="/registro" className="btn btn-outline-light btn-lg px-5 fw-semibold">
              <i className="bi bi-person-plus me-2"></i>Registrarse
            </Link>
          </div>
          <div className="mt-3">
            <Link to="/recuperar-password" className="text-white-50 text-decoration-none small">
              <i className="bi bi-question-circle me-1"></i>¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>
      </header>

      <footer className="bg-white py-3 text-center text-muted small">
        &copy; {new Date().getFullYear()} CUP - FICCT. Todos los derechos reservados.
      </footer>
    </div>
  );
}
