import useAuthStore from '../../store/authStore'
import AdminNotasPage from './AdminNotasPage'
import DocenteNotasPage from './DocenteNotasPage'
import EstudianteNotasPage from './EstudianteNotasPage'

export default function NotasPage () {
  const { user } = useAuthStore()
  const tipo = user?.tipo
  if (tipo === 'postulante') return <EstudianteNotasPage />
  if (tipo === 'docente') return <DocenteNotasPage />
  return <AdminNotasPage />
}
