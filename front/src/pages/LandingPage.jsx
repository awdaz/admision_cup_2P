import { Link } from 'react-router-dom'

// Página de aterrizaje (Landing Page)
// Ruta: "/" — Acceso: Público (sin autenticación)
// Muestra la pantalla de bienvenida del sistema CUP - FICCT con enlaces a login y registro
export default function LandingPage () {
  return (
    <div className='min-vh-100 d-flex flex-column'>
      <nav className='navbar navbar-light bg-white shadow-sm'>
        <div className='container'>
          <span className='navbar-brand fw-bold d-flex align-items-center gap-2'>
            <img src='/ficct_logo.png' alt='FICCT' height='36' />
            CUP - FICCT
          </span>
          <Link to='/login' className='btn btn-primary'>
            <i className='bi bi-box-arrow-in-right me-1' />Ingresar
          </Link>
        </div>
      </nav>

      {/* Hero principal: encabezado con gradiente, título y botones de acción */}
      <header
        className='flex-grow-1 d-flex align-items-center' style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <div className='container text-center text-white py-5'>
          <img src='/ficct_logo.png' alt='FICCT' className='mb-3' style={{ height: '6rem' }} />
          <h1 className='display-4 fw-bold mt-3'>CUP - FICCT</h1>
          <p className='lead fs-4 mb-1'>Sistema de Admisión Universitaria</p>
          <p className='fs-5 mb-4' style={{ opacity: 0.9 }}>
            Centro de Universitario de Postulación<br />
            Facultad Integral de Ciencia y Tecnología
          </p>
          <div className='d-flex gap-3 justify-content-center flex-wrap'>
            <Link to='/login' className='btn btn-light btn-lg px-5 fw-semibold'>
              <i className='bi bi-box-arrow-in-right me-2' />Ingresar al Sistema
            </Link>
            <Link to='/registro' className='btn btn-outline-light btn-lg px-5 fw-semibold'>
              <i className='bi bi-person-plus me-2' />Registrarse
            </Link>
          </div>
          <div className='mt-3'>
            <Link to='/recuperar-password' className='text-white-50 text-decoration-none small'>
              <i className='bi bi-question-circle me-1' />¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>
      </header>

      {/* Pie de página con año dinámico */}
      <footer className='bg-white py-3 text-center text-muted small'>
        &copy; {new Date().getFullYear()} CUP - FICCT. Todos los derechos reservados.
      </footer>
    </div>
  )
}
