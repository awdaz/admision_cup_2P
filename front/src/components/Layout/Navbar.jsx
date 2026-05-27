import useAuthStore from '../../store/authStore';

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div className="container-fluid">
        <button
          className="navbar-toggler d-lg-none me-2"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#sidebarOffcanvas"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <span className="navbar-brand mb-0 h1">CUP - FICCT</span>

        <div className="d-flex align-items-center gap-2 ms-auto">
          {user && (
            <span className="text-light small d-none d-md-inline">
              <i className="bi bi-person-circle me-1"></i>
              {user.name || user.username || user.email}
            </span>
          )}
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-1"></i>
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}
