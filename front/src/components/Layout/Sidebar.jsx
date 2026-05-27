import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { to: '/postulantes', label: 'Postulantes', icon: 'bi-people' },
  { to: '/pagos', label: 'Pagos', icon: 'bi-credit-card' },
];

export default function Sidebar({ offcanvasId, onLinkClick }) {
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
