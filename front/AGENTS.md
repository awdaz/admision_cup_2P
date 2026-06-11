# Frontend — React 19 + Vite 8

SPA para el sistema CUP-FICCT. Consume la API REST de Laravel con autenticación Sanctum (cookies).

## Stack

- React 19 + Vite 8
- react-router-dom v7
- Zustand 5 (estado global)
- Bootstrap 5 + bootstrap-icons
- sonner (notificaciones)
- standard (linter, sin configuración)
- Fetch API (cliente HTTP propio en `api/cliente.js`)

## Estructura

```
src/
├── api/
│   └── cliente.js              → Cliente fetch con manejo de tokens y errores
├── components/
│   ├── Layout/
│   │   ├── MainLayout.jsx      → Layout principal con sidebar + navbar
│   │   ├── Navbar.jsx          → Barra superior con usuario y logout
│   │   └── Sidebar.jsx         → Menú de navegación por rol (offcanvas < lg, fijo >= lg)
│   ├── estudiantes/
│   │   ├── NotasView.jsx       → Vista de notas con filtros, búsqueda, tabla
│   │   ├── TablaNotas.jsx      → Tabla de notas por grupo
│   │   ├── StudentRindesTable.jsx → Notas individuales de un estudiante
│   │   └── EditarNotaModal.jsx → Modal edición de nota
│   ├── postulantes/
│   │   └── NuevaPostulacionModal.jsx  → Modal de creación de postulación
│   ├── ui/
│   │   ├── Alert.jsx, BadgeStatus.jsx, CancelButton.jsx, DataTable.jsx
│   │   ├── EmptyState.jsx, FilterSelect.jsx, FormCard.jsx
│   │   ├── FormPageLayout.jsx, HeaderBar.jsx, Loader.jsx
│   │   ├── Pagination.jsx, ProgressBar.jsx, SearchBar.jsx
│   │   ├── StatCard.jsx, SubmitButton.jsx
│   └── ProtectedRoute.jsx      → Guard de autenticación
├── constants/
│   └── index.js                → Symbol constants + helper `str()` (estados, roles, sexo, etc.)
├── hooks/                      → 14 hooks personalizados
│   ├── useAuth, useAdmisiones, useCatalogos, useDocentes
│   ├── useExamenes, useGrupos, useHorarios, useList
│   ├── usePagos, usePostulaciones, usePostulantes
│   ├── usePromedios, useReportes, useRindes
│   └── useCargarRindes        → Hook interno para carga de rindes en NotasView
├── pages/
│   ├── LoginPage, RegistroPage, RecuperarPasswordPage, RestablecerPasswordPage
│   ├── DashboardPage.jsx       → Router por rol (Admin, Docente, Postulante)
│   ├── dashboard/              → AdminDashboard, DocenteDashboard, PostulanteDashboard
│   ├── postulantes/            → PostulanteListPage, PostulanteFormPage, PostulanteDetailPage
│   ├── estudiantes/            → EstudiantesPage, MisNotasPage (antes notas/)
│   ├── grupos/                 → GrupoListPage, GrupoFormPage
│   ├── examenes/               → ExamenListPage, ExamenFormPage
│   ├── horarios/               → HorarioListPage, HorarioFormPage
│   ├── docentes/               → DocenteListPage, DocenteFormPage
│   ├── pagos/                  → PagoListPage, PagoFormPage
│   ├── requisitos/             → RequisitosPage
│   ├── admisiones/             → AdmisionListPage
│   └── usuarios/               → UserListPage, UserFormPage
├── router/
│   └── AppRouter.jsx           → Definición de rutas
├── store/
│   └── authStore.js            → Store de autenticación (Zustand)
├── App.jsx
└── main.jsx
```

## Convenciones

- **Symbol constants**: usar `import { ESTADOS, ROLES, str } from '../constants'`. `str(sym)` retorna el string value para API/UI cuando se necesita.
- **Filtros**: `d-flex flex-wrap gap-2` + `flex: ... clamp(...)` en cada elemento. Sin `row g-2 col-*`.
- **Navegación SPA**: `<Link>`/`<NavLink>`, nunca `<a href>` para rutas internas.
- **Sidebar**: offcanvas en móvil (< lg), aside fijo en desktop (>= lg).
- **Tablas**: `table table-hover table-striped align-middle` + `<thead className="table-light">`.
- **Edición**: mediante modal (nunca inline inputs en tablas).
- **Zustand**: consumir con destructuring `const { user, logout } = useAuthStore()`.
- **Peticiones bajo demanda**: no cargar datos al montar si no son necesarios.
- **Hooks retornan datos directamente** (no response completo).
- **Notificaciones** con `sonner` (`toast.success`, `toast.error`).
- **Componentes de página** con sufijo `Page` (ej: `NotasPage.jsx`).
- **Estado global** solo para autenticación (`authStore.js`); el resto es estado local.
- **Optional chaining (`?.`)** obligatorio en todo acceso a propiedades, funciones opcionales, y elementos de array por índice.
- **FormCard** con `disabled={true}` aplica `opacity: 0.6` + `pointer-events: none`.
- **useList** acepta `fetchFn(page, ...params)` y `watchParams`.

## Comandos

```bash
npm run dev        # Desarrollo
npm run build      # Producción
npm run lint       # Standard
npm run lint:fix   # Standard --fix
```
