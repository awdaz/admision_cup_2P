import { NavLink } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { ROLES, str } from '../../constants'

const sections = {
  [str(ROLES.ADMIN)]: [
    {
      name: 'SEGURIDAD',
      links: [
        { to: '/usuarios', label: 'Gestionar Usuario', icon: 'bi-shield-lock' }
      ]
    },
    {
      name: 'GESTIÓN DE POSTULANTES Y POSTULACIÓN',
      links: [
        { to: '/postulantes', label: 'Gestionar postulantes', icon: 'bi-people' },
        { to: '/pagos', label: 'Ver pagos', icon: 'bi-credit-card' }
      ]
    },
    {
      name: 'GESTIÓN ACADÉMICA',
      links: [
        { to: '/docentes', label: 'Gestionar docentes', icon: 'bi-mortarboard' },
        { to: '/grupos', label: 'Asignar grupos', icon: 'bi-layers' },
        { to: '/examenes', label: 'Exámenes', icon: 'bi-file-text' },
        { to: '/horarios', label: 'Horarios', icon: 'bi-calendar-week' },
        { to: '/estudiantes', label: 'Registrar/Editar notas', icon: 'bi-clipboard-data' },
        { to: '/admisiones', label: 'Controlar cupos', icon: 'bi-check2-circle' }
      ]
    },
    {
      name: 'REPORTES Y CONSULTAS',
      links: [
        { to: '/dashboard', label: 'Generar reportes', icon: 'bi-file-earmark-bar-graph' }
      ]
    }
  ],
  [str(ROLES.POSTULANTE)]: [
    {
      name: 'GESTIÓN DE POSTULANTES Y POSTULACIÓN',
      links: [
        { to: '/postulantes', label: 'Mis Datos', icon: 'bi-person' },
        { to: '/pagos', label: 'Mis pagos', icon: 'bi-credit-card' }
      ]
    },
    {
      name: 'GESTIÓN ACADÉMICA',
      links: [
        { to: '/mis-notas', label: 'Mis Notas / Promedios', icon: 'bi-calculator' }
      ]
    },
    {
      name: 'REPORTES Y CONSULTAS',
      links: [
        { to: '/dashboard', label: 'Generar reportes', icon: 'bi-file-earmark-bar-graph' }
      ]
    }
  ],
  [str(ROLES.DOCENTE)]: [
    {
      name: 'GESTIÓN ACADÉMICA',
      links: [
        { to: '/docentes', label: 'Mis Grupos', icon: 'bi-mortarboard' },
        { to: '/estudiantes', label: 'Registrar/Editar notas', icon: 'bi-clipboard-data' },
        { to: '/examenes', label: 'Exámenes', icon: 'bi-file-text' },
        { to: '/horarios', label: 'Horarios', icon: 'bi-calendar-week' },
        { to: '/postulantes', label: 'Postulantes', icon: 'bi-people' }
      ]
    },
    {
      name: 'REPORTES Y CONSULTAS',
      links: [
        { to: '/dashboard', label: 'Generar reportes', icon: 'bi-file-earmark-bar-graph' }
      ]
    }
  ]
}

function closeOffcanvas () {
  const el = document.getElementById('sidebarOffcanvas')
  if (el) {
    const bs = window.bootstrap?.Offcanvas?.getInstance(el)
    if (bs) bs.hide()
  }
}

export default function Sidebar () {
  const { user } = useAuthStore()
  const tipo = user?.tipo
  const roleSections = tipo ? sections[tipo] || sections[str(ROLES.ADMIN)] : []

  const renderLink = (link) => (
    <li className='nav-item' key={link.to + (link.label || '')}>
      <NavLink
        to={link.to}
        end
        className={({ isActive }) =>
          `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`}
        onClick={closeOffcanvas}
      >
        <i className={`bi ${link.icon}`} />
        <span>{link.label}</span>
      </NavLink>
    </li>
  )

  const renderSection = (section, idx) => (
    <li key={section.name} className='mt-2'>
      <small className='text-muted text-uppercase fw-semibold d-block px-3 py-1' style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
        {section.name}
      </small>
      <ul className='nav nav-pills flex-column'>
        {section.links.map(renderLink)}
      </ul>
    </li>
  )

  const content = (
    <ul className='nav flex-column'>
      <li className='nav-item mb-1'>
        <NavLink
          to='/dashboard'
          end
          className={({ isActive }) =>
            `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`}
          onClick={closeOffcanvas}
        >
          <i className='bi bi-speedometer2' />
          <span>Inicio</span>
        </NavLink>
      </li>
      {roleSections.map(renderSection)}
    </ul>
  )

  return (
    <>
      <div className='d-lg-none'>
        <div className='offcanvas offcanvas-start' tabIndex='-1' id='sidebarOffcanvas'>
          <div className='offcanvas-header'>
            <button type='button' className='btn-close' data-bs-dismiss='offcanvas' />
          </div>
          <div className='offcanvas-body'>
            {content}
          </div>
        </div>
      </div>
      <aside className='bg-light border-end d-none d-lg-flex flex-column p-3' style={{ width: '250px', minWidth: '250px' }}>
        {content}
      </aside>
    </>
  )
}
