// Barra de navegación superior con logo, nombre de usuario y botón de salir
import useAuthStore from '../../store/authStore';

export default function Navbar() {
  const user = useAuthStore((s) => s.user);    // Usuario logueado
  const logout = useAuthStore((s) => s.logout); // Función para cerrar sesión

  // Maneja el cierre de sesión al hacer clic en "Salir"
  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div className="container-fluid">
        {/* Botón para mostrar el sidebar en dispositivos móviles */}
        <button
          className="navbar-toggler d-lg-none me-2"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#sidebarOffcanvas"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        {/* Logo/marca de la aplicación */}
        <span className="navbar-brand mb-0 h1">CUP - FICCT</span>

        <div className="d-flex align-items-center gap-2 ms-auto">
          {/* Muestra el nombre del usuario autenticado */}
          {user && (
            <span className="text-light small d-none d-md-inline">
              <i className="bi bi-person-circle me-1"></i>
              {user.name || user.username || user.email}
            </span>
          )}
          {/* Botón para cerrar sesión */}
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-1"></i>
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}
