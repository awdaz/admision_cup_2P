import useAuthStore from '../store/authStore'
import AdminDashboard from './dashboard/AdminDashboard'
import DocenteDashboard from './dashboard/DocenteDashboard'
import PostulanteDashboard from './dashboard/PostulanteDashboard'

export default function DashboardPage () {
  const { user } = useAuthStore()
  const tipo = user?.tipo
  if (tipo === 'postulante') return <PostulanteDashboard />
  if (tipo === 'docente') return <DocenteDashboard />
  return <AdminDashboard />
}
