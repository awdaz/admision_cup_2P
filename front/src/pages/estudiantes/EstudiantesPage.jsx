import useAuthStore from '../../store/authStore'
import AdminEstudiantes from './AdminEstudiantes'
import DocenteEstudiantes from './DocenteEstudiantes'
import { ROLES, str } from '../../constants'

// Casos de Uso: CU08 (Registrar notas), CU09 (Editar notas)

export default function EstudiantesPage () {
  const { user } = useAuthStore()
  const tipo = user?.tipo
  if (tipo === str(ROLES.DOCENTE)) return <DocenteEstudiantes />
  return <AdminEstudiantes />
}
