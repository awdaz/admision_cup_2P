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
│   ├── postulantes/
│   │   └── NuevaPostulacionModal.jsx  → Modal de creación de postulación
│   ├── ui/
│   ├── ui/
│   │   ├── Alert.jsx           → Alertas informativas
│   │   ├── BadgeStatus.jsx     → Badge coloreado por estado (value + colors map)
│   │   ├── CancelButton.jsx    → Botón cancelar con navegación
│   │   ├── DataTable.jsx       → Tabla genérica con acciones
│   │   ├── EmptyState.jsx      → Mensaje de estado vacío
│   │   ├── FilterSelect.jsx    → Select de filtro genérico
│   │   ├── FormCard.jsx        → Card reutilizable con header + body + disabled
│   │   ├── FormPageLayout.jsx  → Layout centrado para formularios
│   │   ├── HeaderBar.jsx       → Botón crear (sin título)
│   │   ├── Loader.jsx          → Spinner de carga
│   │   ├── Pagination.jsx      → Paginación (simple y avanzada)
│   │   ├── ProgressBar.jsx     → Barra de progreso con colores
│   │   ├── SearchBar.jsx       → Barra de búsqueda
│   │   ├── StatCard.jsx        → Tarjeta de estadística
│   │   └── SubmitButton.jsx    → Botón guardar con spinner
│   └── ProtectedRoute.jsx      → Guard de autenticación
├── hooks/                      → 14 hooks personalizados
│   ├── useAuth                 → login, register, logout, user
│   ├── useAdmisiones           → getAdmisiones, procesarAdmision, generarGrupos, getCupos
│   ├── useCatalogos            → getMaterias, getCarreras, getTurnos, getSemestres
│   ├── useDocentes             → CRUD docentes + disponibilidad
│   ├── useExamenes             → CRUD examenes + getExamenRindes(id)
│   ├── useGrupos               → CRUD grupos
│   ├── useHorarios             → CRUD horarios
│   ├── useList                 → Hook genérico de listas paginadas (items, pagination, page, loading)
│   ├── usePagos                → CRUD pagos + confirmar
│   ├── usePostulaciones        → CRUD postulaciones + cancelar
│   ├── usePostulantes          → CRUD postulantes + buscar
│   ├── usePromedios            → getPromedios, recalcularPromedios
│   ├── useReportes             → reportes admision/docente/postulante
│   └── useRindes               → CRUD rindes + getByPostulacion
├── pages/                      → 26 páginas agrupadas por módulo
│   ├── auth/                   → LoginPage, RegistroPage, RecuperarPasswordPage, RestablecerPasswordPage
│   ├── DashboardPage.jsx       → Router por rol (AdminDashboard, DocenteDashboard, PostulanteDashboard)
│   ├── dashboard/              → AdminDashboard, DocenteDashboard, PostulanteDashboard
│   ├── postulantes/            → PostulanteListPage, PostulanteFormPage, PostulanteDetailPage
│   ├── grupos/                 → GrupoListPage, GrupoFormPage
│   ├── examenes/               → ExamenListPage, ExamenFormPage
│   ├── notas/                  → NotasPage (AdminNotas, DocenteNotas, EstudianteNotas)
│   ├── horarios/               → HorarioListPage, HorarioFormPage
│   ├── docentes/               → DocenteListPage, DocenteFormPage
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

## Componentes UI reutilizables

| Componente | Props principales | Uso en páginas |
|---|---|---|
| **BadgeStatus** | `value`, `colors`, `className` | NotasPage, PromediosPage, PostulanteDetailPage, UserListPage, DocenteListPage, PostulanteListPage, PagoListPage, ReportesPage |
| **CancelButton** | `to` (ruta o -1) | Todas las form pages |
| **EmptyState** | `message`, `icon` | PostulanteDetailPage, PromediosPage |
| **FilterSelect** | `value`, `onChange`, `options`, `placeholder`, `mapOption` | GrupoListPage, ExamenListPage, HorarioListPage, UserListPage, AdmisionListPage |
| **FormCard** | `title`, `children`, `actions`, `disabled`, `className` | PagoFormPage, PostulanteDetailPage, ReportesPage, DashboardPage |
| **FormPageLayout** | `maxWidth` | Todas las form pages |
| **HeaderBar** | `createLabel`, `onCreate` (sin `title`) | PostulanteListPage, DocenteListPage, GrupoListPage, ExamenListPage, HorarioListPage, PagoListPage, UserListPage |
| **Pagination** | `page`, `totalPages`, `setPage`, `simple` | PostulanteListPage, DocenteListPage, GrupoListPage, ExamenListPage, PagoListPage, UserListPage |
| **ProgressBar** | `value`, `height`, `showLabel`, `children` | DashboardPage, ReportesPage, DocenteListPage, AdmisionListPage |
| **SearchBar** | `placeholder`, `value`, `onChange`, `onSearch` | PostulanteListPage |
| **StatCard** | `title`, `value`, `color`, `icon`, `variant`, `colClass` | DashboardPage, ReportesPage, AdmisionListPage, PromediosPage |
| **SubmitButton** | `loading`, `label`, `loadingLabel`, `disabled` | Todas las form pages |

## Hooks (API calls)

| Hook | Funciones principales | Usado en |
|---|---|---|
| useAuth | login, register, logout, user | Auth pages, Layout |
| usePostulantes | getPostulantes, getPostulante, store, update, delete | Postulante pages |
| usePostulaciones | getPostulaciones(page, filters), store, cancel | NuevaPostulacionModal |
| useGrupos | getGrupos(page, params), getGrupo(id) | Grupo pages, NotasPage |
| useExamenes | getExamenes(page, grupoId), getExamenRindes(id) | Examen pages, NotasPage |
| useRindes | getRindesByPostulacion, storeRinde, updateRinde, deleteRinde | NotasPage |
| usePromedios | getPromedios(postulacionId), recalcular | PromediosPage |
| useCatalogos | getMaterias, getCarreras, getTurnos, getSemestres, getRequisitos, getAdmisiones | Varias |
| useReportes | getReporteAdmision, getMisGrupos, getMisNotas | AdminDashboard, DocenteDashboard, PostulanteDashboard |
| useDocentes | CRUD docentes + disponibilidad | Docente pages |
| useHorarios | CRUD horarios | Horario pages |
| usePagos | CRUD pagos + confirmar | Pago pages |
| useAdmisiones | getAdmisiones, procesarAdmision, generarGrupos, getCupos | AdmisionListPage |
| useList | Hook genérico (items, pagination, page, loading) | PostulanteListPage, DocenteListPage, GrupoListPage, ExamenListPage, PagoListPage, UserListPage |

## Convenciones

- **Navegación SPA**: usar `<Link>`/`<NavLink>`, nunca `<a href>` para rutas internas.
- **Sidebar responsive**: offcanvas en móvil (< lg), aside fijo en desktop (>= lg).
- **Tablas**: todas con `table table-hover table-striped align-middle` + `<thead className="table-light">`.
- **Edición**: mediante modal (nunca inline inputs en tablas).
- **Zustand store**: consumir con destructuring: `const { user, logout } = useAuthStore()`.
- **Peticiones bajo demanda**: no cargar datos al montar si no son necesarios (ej: NuevaPostulacionModal carga catálogos solo al seleccionar postulante).
- **Los hooks retornan los datos directamente** (no response completo) cuando es posible; ya no retornan `data`.
- **Notificaciones** con `sonner` (`toast.success`, `toast.error`).
- **Relaciones de Laravel** llegan como `snake_case` en JSON.
- **Componentes de página** se nombran con sufijo `Page` (ej: `NotasPage.jsx`).
- **Estado global** solo para autenticación (`authStore.js`); el resto es estado local.
- **Componentes reutilizables** van en `components/ui/` y aceptan props con defaults.
- **Títulos de página** se eliminaron; la navegación (sidebar + navbar) ya indica ubicación.
- **FormCard** con `disabled={true}` aplica `opacity: 0.6` + `pointer-events: none`.
- **useList** refactoriza páginas de listado eliminando ~15-20 líneas de boilerplate; acepta `fetchFn(page, ...params)` y `watchParams`.
- **Optional chaining (`?.`)** obligatorio al acceder propiedades de objetos, llamar funciones opcionales, o acceder elementos de array por índice. Nunca asumir que una propiedad anidada existe. Ej: `obj?.prop?.subprop`, `arr?.[i]`, `fn?.()`. Esto incluye accesos a relaciones de Laravel (`r.examen?.grupo?.materia?.nombre`), props opcionales, y cualquier valor que pueda ser null/undefined.

## Comandos

```bash
npm run dev        # Desarrollo
npm run build      # Producción
npm run lint       # Standard
npm run lint:fix   # Standard --fix
```
