import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function MainLayout() {
  return (
    <div className="d-flex flex-column vh-100">
      <Navbar />

      <div className="d-flex flex-grow-1 overflow-hidden">
        <aside className="bg-light border-end d-flex flex-column p-3" style={{ width: '250px', minWidth: '250px' }}>
          <Sidebar offcanvasId="sidebarOffcanvas" onLinkClick={() => {
            const offcanvas = document.getElementById('sidebarOffcanvas');
            if (offcanvas) {
              const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvas);
              if (bsOffcanvas) bsOffcanvas.hide();
            }
          }} />
        </aside>

        <main className="flex-grow-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
