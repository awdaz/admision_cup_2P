import { NavLink } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const adminLinks = [
  { to: '/postulantes', label: 'Postulantes', icon: 'bi-people' },
  { to: '/docentes', label: 'Docentes', icon: 'bi-mortarboard' },
  { to: '/grupos', label: 'Grupos', icon: 'bi-layers' },
  { to: '/examenes', label: 'Exámenes', icon: 'bi-file-text' },
  { to: '/horarios', label: 'Horarios', icon: 'bi-calendar-week' },
  { to: '/estudiantes', label: 'Estudiantes', icon: 'bi-clipboard-data' },
  { to: '/pagos', label: 'Pagos', icon: 'bi-credit-card' },
  { to: '/admisiones', label: 'Admisiones', icon: 'bi-check2-circle' },
  { to: '/usuarios', label: 'Usuarios', icon: 'bi-shield-lock' }
]

const postulanteLinks = [
  { to: '/postulantes', label: 'Mis Datos', icon: 'bi-person' },
  { to: '/mis-notas', label: 'Mis Notas', icon: 'bi-clipboard-data' },
  { to: '/pagos', label: 'Mis Pagos', icon: 'bi-credit-card' }
]

const docenteLinks = [
  { to: '/docentes', label: 'Mis Grupos', icon: 'bi-mortarboard' },
  { to: '/examenes', label: 'Exámenes', icon: 'bi-file-text' },
  { to: '/horarios', label: 'Horarios', icon: 'bi-calendar-week' },
  { to: '/estudiantes', label: 'Estudiantes', icon: 'bi-clipboard-data' },
  { to: '/postulantes', label: 'Postulantes', icon: 'bi-people' }
]

const roleLinks = { admin: adminLinks, postulante: postulanteLinks, docente: docenteLinks }

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
  const links = tipo ? roleLinks[tipo] || adminLinks : []

  const sorted = [...links].sort((a, b) => a.label.localeCompare(b.label))

  const renderLink = (link) => (
    <li className='nav-item' key={link.to}>
      <NavLink
        to={link.to}
        className={({ isActive }) =>
          `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`}
        onClick={closeOffcanvas}
      >
        <i className={`bi ${link.icon}`} />
        <span>{link.label}</span>
      </NavLink>
    </li>
  )

  const content = (
    <ul className='nav nav-pills flex-column'>
      {renderLink({ to: '/dashboard', label: 'Inicio', icon: 'bi-speedometer2' })}
      <li className='border-top my-1' />
      {sorted.map(renderLink)}
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
