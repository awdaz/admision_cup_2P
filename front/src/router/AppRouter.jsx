import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../components/Layout/MainLayout';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegistroPage from '../pages/RegistroPage';
import RecuperarPasswordPage from '../pages/RecuperarPasswordPage';
import RestablecerPasswordPage from '../pages/RestablecerPasswordPage';
import DashboardPage from '../pages/DashboardPage';
import PostulanteListPage from '../pages/postulantes/PostulanteListPage';
import PostulanteFormPage from '../pages/postulantes/PostulanteFormPage';
import PostulanteDetailPage from '../pages/postulantes/PostulanteDetailPage';
import DocenteListPage from '../pages/docentes/DocenteListPage';
import DocenteFormPage from '../pages/docentes/DocenteFormPage';
import GrupoListPage from '../pages/grupos/GrupoListPage';
import GrupoFormPage from '../pages/grupos/GrupoFormPage';
import ExamenListPage from '../pages/examenes/ExamenListPage';
import ExamenFormPage from '../pages/examenes/ExamenFormPage';
import HorarioListPage from '../pages/horarios/HorarioListPage';
import HorarioFormPage from '../pages/horarios/HorarioFormPage';
import NotasPage from '../pages/notas/NotasPage';
import ReportesPage from '../pages/reportes/ReportesPage';
import RequisitosPage from '../pages/requisitos/RequisitosPage';
import PostulacionFormPage from '../pages/postulaciones/PostulacionFormPage';
import PagoListPage from '../pages/pagos/PagoListPage';
import PagoFormPage from '../pages/pagos/PagoFormPage';
import UserListPage from '../pages/usuarios/UserListPage';
import UserFormPage from '../pages/usuarios/UserFormPage';

function NotFoundPage() {
  return (
    <div className="text-center py-5">
      <h1 className="display-1 text-muted">404</h1>
      <p className="lead">Página no encontrada</p>
      <a href="/" className="btn btn-primary">Ir al inicio</a>
    </div>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegistroPage />} />
      <Route path="/recuperar-password" element={<RecuperarPasswordPage />} />
      <Route path="/restablecer-password" element={<RestablecerPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/postulantes" element={<PostulanteListPage />} />
          <Route path="/postulantes/nuevo" element={<PostulanteFormPage />} />
          <Route path="/postulantes/:id" element={<PostulanteDetailPage />} />
          <Route path="/postulantes/:id/editar" element={<PostulanteFormPage />} />
          <Route path="/postulantes/:id/requisitos" element={<RequisitosPage />} />

          <Route path="/postulaciones/nueva" element={<PostulacionFormPage />} />

          <Route path="/docentes" element={<DocenteListPage />} />
          <Route path="/docentes/nuevo" element={<DocenteFormPage />} />
          <Route path="/docentes/:id/editar" element={<DocenteFormPage />} />

          <Route path="/grupos" element={<GrupoListPage />} />
          <Route path="/grupos/nuevo" element={<GrupoFormPage />} />
          <Route path="/grupos/:id" element={<GrupoFormPage />} />
          <Route path="/grupos/:id/editar" element={<GrupoFormPage />} />

          <Route path="/examenes" element={<ExamenListPage />} />
          <Route path="/examenes/nuevo" element={<ExamenFormPage />} />
          <Route path="/examenes/:id/editar" element={<ExamenFormPage />} />

          <Route path="/horarios" element={<HorarioListPage />} />
          <Route path="/horarios/nuevo" element={<HorarioFormPage />} />
          <Route path="/horarios/:id/editar" element={<HorarioFormPage />} />

          <Route path="/notas" element={<NotasPage />} />

          <Route path="/reportes" element={<ReportesPage />} />

          <Route path="/pagos" element={<PagoListPage />} />
          <Route path="/pagos/nuevo" element={<PagoFormPage />} />

          <Route path="/usuarios" element={<UserListPage />} />
          <Route path="/usuarios/nuevo" element={<UserFormPage />} />
          <Route path="/usuarios/:id/editar" element={<UserFormPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
