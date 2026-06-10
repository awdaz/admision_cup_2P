import useAuthStore from '../../store/authStore'
import AdminEstudiantes from './AdminEstudiantes'
import DocenteEstudiantes from './DocenteEstudiantes'

export default function EstudiantesPage () {
  const { user } = useAuthStore()
  const tipo = user?.tipo
  if (tipo === 'docente') return <DocenteEstudiantes />
  return <AdminEstudiantes />
}
