import { NavLink } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

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
  { to: '/admisiones', label: 'Control Admisión', icon: 'bi-check2-circle' },
  { to: '/promedios', label: 'Promedios', icon: 'bi-calculator' },
  { to: '/reportes', label: 'Reportes', icon: 'bi-bar-chart' },
  { to: '/usuarios', label: 'Usuarios', icon: 'bi-shield-lock' },
];

const postulanteLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { to: '/postulantes', label: 'Mis Datos', icon: 'bi-person' },
  { to: '/postulaciones/nueva', label: 'Nueva Postulación', icon: 'bi-file-earmark-plus' },
  { to: '/notas', label: 'Mis Notas', icon: 'bi-clipboard-data' },
  { to: '/promedios', label: 'Mis Promedios', icon: 'bi-calculator' },
  { to: '/pagos', label: 'Mis Pagos', icon: 'bi-credit-card' },
  { to: '/reportes', label: 'Mis Reportes', icon: 'bi-bar-chart' },
];

const docenteLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { to: '/docentes', label: 'Mis Grupos', icon: 'bi-mortarboard' },
  { to: '/examenes', label: 'Exámenes', icon: 'bi-file-text' },
  { to: '/horarios', label: 'Horarios', icon: 'bi-calendar-week' },
  { to: '/notas', label: 'Registrar Notas', icon: 'bi-clipboard-data' },
  { to: '/promedios', label: 'Promedios', icon: 'bi-calculator' },
  { to: '/postulantes', label: 'Postulantes', icon: 'bi-people' },
  { to: '/postulaciones/nueva', label: 'Nueva Postulación', icon: 'bi-file-earmark-plus' },
  { to: '/reportes', label: 'Reportes', icon: 'bi-bar-chart' },
];

const roleLinks = { admin: adminLinks, postulante: postulanteLinks, docente: docenteLinks };

function closeOffcanvas() {
  const el = document.getElementById('sidebarOffcanvas');
  if (el) {
    const bs = window.bootstrap?.Offcanvas?.getInstance(el);
    if (bs) bs.hide();
  }
}

export default function Sidebar() {
  const { user } = useAuthStore();
  const tipo = user?.tipo;
  const links = tipo ? roleLinks[tipo] || adminLinks : [];

  const content = (
    <ul className="nav nav-pills flex-column">
      {links.map((link) => (
        <li className="nav-item" key={link.to}>
          <NavLink
            to={link.to}
            className={({ isActive }) =>
              `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`
            }
            onClick={closeOffcanvas}
          >
            <i className={`bi ${link.icon}`}></i>
            <span>{link.label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Offcanvas para móviles (< lg) */}
      <div className="d-lg-none">
        <div className="offcanvas offcanvas-start" tabIndex="-1" id="sidebarOffcanvas">
          <div className="offcanvas-header">
            <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
          </div>
          <div className="offcanvas-body">
            {content}
          </div>
        </div>
      </div>
      {/* Sidebar fijo para desktop (>= lg) */}
      <aside className="bg-light border-end d-none d-lg-flex flex-column p-3" style={{ width: '250px', minWidth: '250px' }}>
        {content}
      </aside>
    </>
  );
}
