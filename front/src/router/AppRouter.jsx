import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../components/Layout/MainLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import PostulanteListPage from '../pages/postulantes/PostulanteListPage';
import PostulanteFormPage from '../pages/postulantes/PostulanteFormPage';
import PostulanteDetailPage from '../pages/postulantes/PostulanteDetailPage';
import RequisitosPage from '../pages/requisitos/RequisitosPage';
import PagoListPage from '../pages/pagos/PagoListPage';
import PagoFormPage from '../pages/pagos/PagoFormPage';

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
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/postulantes" element={<PostulanteListPage />} />
          <Route path="/postulantes/nuevo" element={<PostulanteFormPage />} />
          <Route path="/postulantes/:id" element={<PostulanteDetailPage />} />
          <Route path="/postulantes/:id/editar" element={<PostulanteFormPage />} />
          <Route path="/postulantes/:id/requisitos" element={<RequisitosPage />} />
          <Route path="/pagos" element={<PagoListPage />} />
          <Route path="/pagos/nuevo" element={<PagoFormPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
