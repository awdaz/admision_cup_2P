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
        {/* Sidebar lateral con ancho fijo de 250px */}
        <aside className="bg-light border-end d-flex flex-column p-3" style={{ width: '250px', minWidth: '250px' }}>
          <Sidebar offcanvasId="sidebarOffcanvas" onLinkClick={() => {
            // Cierra el offcanvas en móvil al hacer clic en un enlace
            const offcanvas = document.getElementById('sidebarOffcanvas');
            if (offcanvas) {
              const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvas);
              if (bsOffcanvas) bsOffcanvas.hide();
            }
          }} />
        </aside>

        {/* Área principal donde se renderiza la página activa */}
        <main className="flex-grow-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
