// Layout principal con navbar superior, sidebar lateral y área de contenido
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function MainLayout() {
  return (
    <div className="d-flex flex-column vh-100">
      {/* Barra de navegación superior */}
      <Navbar />

      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* Sidebar responsivo: offcanvas en móvil, aside fijo en desktop */}
        <Sidebar />

        {/* Área principal donde se renderiza la página activa */}
        <main className="flex-grow-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
