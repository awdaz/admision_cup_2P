// Sidebar de navegación con enlaces según el rol del usuario
import { NavLink } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

// Enlaces del menú para administradores
const adminLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { to: '/postulantes', label: 'Postulantes', icon: 'bi-people' },
  { to: '/docentes', label: 'Docentes', icon: 'bi-mortarboard' },
  { to: '/grupos', label: 'Grupos', icon: 'bi-layers' },
  { to: '/examenes', label: 'Exámenes', icon: 'bi-file-text' },
  { to: '/horarios', label: 'Horarios', icon: 'bi-calendar-week' },
  { to: '/notas', label: 'Notas', icon: 'bi-clipboard-data' },
  { to: '/postulaciones/nueva', label: 'Nueva Postulación', icon: 'bi-file-earmark-plus' },
  { to: '/pagos', label: 'Pagos', icon: 'bi-credit-card' },
  { to: '/reportes', label: 'Reportes', icon: 'bi-bar-chart' },
  { to: '/usuarios', label: 'Usuarios', icon: 'bi-shield-lock' },
];

// Enlaces del menú para postulantes
const postulanteLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { to: '/postulantes', label: 'Mis Datos', icon: 'bi-person' },
  { to: '/postulaciones/nueva', label: 'Nueva Postulación', icon: 'bi-file-earmark-plus' },
  { to: '/notas', label: 'Mis Notas', icon: 'bi-clipboard-data' },
  { to: '/pagos', label: 'Mis Pagos', icon: 'bi-credit-card' },
  { to: '/reportes', label: 'Mis Reportes', icon: 'bi-bar-chart' },
];

// Enlaces del menú para docentes
const docenteLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { to: '/docentes', label: 'Mis Grupos', icon: 'bi-mortarboard' },
  { to: '/examenes', label: 'Exámenes', icon: 'bi-file-text' },
  { to: '/horarios', label: 'Horarios', icon: 'bi-calendar-week' },
  { to: '/notas', label: 'Registrar Notas', icon: 'bi-clipboard-data' },
  { to: '/postulantes', label: 'Postulantes', icon: 'bi-people' },
  { to: '/postulaciones/nueva', label: 'Nueva Postulación', icon: 'bi-file-earmark-plus' },
  { to: '/reportes', label: 'Reportes', icon: 'bi-bar-chart' },
];

// Mapa de roles a sus respectivos conjuntos de enlaces
const roleLinks = {
  admin: adminLinks,
  postulante: postulanteLinks,
  docente: docenteLinks,
};

export default function Sidebar({ offcanvasId, onLinkClick }) {
  const user = useAuthStore((s) => s.user);
  const tipo = user?.tipo;  // Rol del usuario autenticado
  const links = tipo ? roleLinks[tipo] || adminLinks : []; // Enlaces según el rol

  const content = (
    <ul className="nav nav-pills flex-column">
      {links.map((link) => (
        <li className="nav-item" key={link.to}>
          <NavLink
            to={link.to}
            className={({ isActive }) =>
              `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`
            }
            onClick={onLinkClick}
          >
            <i className={`bi ${link.icon}`}></i>
            <span>{link.label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );

  if (offcanvasId) {
    return (
      <>
        <div className="d-lg-none">
          <div className="offcanvas offcanvas-start" tabIndex="-1" id={offcanvasId}>
            <div className="offcanvas-header">
              <h5 className="offcanvas-title">Menú</h5>
              <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
            </div>
            <div className="offcanvas-body">
              {content}
            </div>
          </div>
        </div>
        <div className="d-none d-lg-block sidebar-sticky">
          {content}
        </div>
      </>
    );
  }

  return <div className="sidebar-sticky">{content}</div>;
}
