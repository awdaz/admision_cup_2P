import useAuthStore from '../store/authStore'
import AdminDashboard from './dashboard/AdminDashboard'
import DocenteDashboard from './dashboard/DocenteDashboard'
import PostulanteDashboard from './dashboard/PostulanteDashboard'
import { ROLES, str } from '../constants'

// Caso de Uso: CU13 — Visualizar dashboard
export default function DashboardPage () {
  const { user } = useAuthStore()
  const tipo = user?.tipo
  if (tipo === str(ROLES.POSTULANTE)) return <PostulanteDashboard />
  if (tipo === str(ROLES.DOCENTE)) return <DocenteDashboard />
  return <AdminDashboard />
}
