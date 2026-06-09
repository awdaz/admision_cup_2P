# Frontend — React 19 + Vite 8

SPA para el sistema CUP-FICCT. Consume la API REST de Laravel con autenticación Sanctum (cookies).

## Stack

- React 19 + Vite 8
- react-router-dom v7
- Zustand 5 (estado global)
- Bootstrap 5 + bootstrap-icons
- sonner (notificaciones)
- axios (cliente HTTP)

## Estructura

```
src/
├── api/
│   └── cliente.js              → Cliente axios con interceptors
├── components/
│   ├── Layout/
│   │   ├── MainLayout.jsx      → Layout principal con sidebar + navbar
│   │   ├── Navbar.jsx          → Barra superior con usuario y logout
│   │   └── Sidebar.jsx         → Menú de navegación por rol
│   ├── ui/
│   │   ├── Alert.jsx           → Alertas informativas
│   │   ├── BadgeStatus.jsx     → Badge coloreado por estado
│   │   ├── CancelButton.jsx    → Botón cancelar con navegación
│   │   ├── DataTable.jsx       → Tabla genérica con acciones
│   │   ├── EmptyState.jsx      → Mensaje de estado vacío
│   │   ├── FilterSelect.jsx    → Select de filtro genérico
│   │   ├── FormPageLayout.jsx  → Layout centrado para formularios
│   │   ├── HeaderBar.jsx       → Título + botón crear
│   │   ├── Loader.jsx          → Spinner de carga
│   │   ├── Pagination.jsx      → Paginación (simple y avanzada)
│   │   ├── ProgressBar.jsx     → Barra de progreso con colores
│   │   ├── SearchBar.jsx       → Barra de búsqueda
│   │   ├── StatCard.jsx        → Tarjeta de estadística
│   │   └── SubmitButton.jsx    → Botón guardar con spinner
│   └── ProtectedRoute.jsx      → Guard de autenticación
├── hooks/                      → 13 hooks personalizados
├── pages/                      → 24 páginas agrupadas por módulo
├── router/
│   └── AppRouter.jsx           → Definición de rutas
├── store/
│   └── authStore.js            → Store de autenticación (Zustand)
├── App.jsx
└── main.jsx
```

## Páginas por módulo

| Módulo | Archivos |
|---|---|
| Auth | LoginPage, RegistroPage, RecuperarPasswordPage, RestablecerPasswordPage |
| Dashboard | DashboardPage, LandingPage |
| Postulantes | PostulanteListPage, PostulanteFormPage, PostulanteDetailPage |
| Postulaciones | PostulacionFormPage |
| Grupos | GrupoListPage, GrupoFormPage |
| Exámenes | ExamenListPage, ExamenFormPage |
| Notas | NotasPage (DocenteNotas, AdminNotas, PostulanteNotas) |
| Promedios | PromediosPage |
| Horarios | HorarioListPage, HorarioFormPage |
| Docentes | DocenteListPage, DocenteFormPage |
| Pagos | PagoListPage, PagoFormPage |
| Reportes | ReportesPage |
| Requisitos | RequisitosPage |
| Admisiones | AdmisionListPage |
| Usuarios | UserListPage, UserFormPage |

## Componentes UI reutilizables

| Componente | Props principales | Uso en páginas |
|---|---|---|
| **BadgeStatus** | `value`, `colors` | NotasPage, PromediosPage, PostulanteDetailPage |
| **CancelButton** | `to` (ruta o -1) | Todas las form pages |
| **EmptyState** | `message`, `icon` | PostulanteDetailPage, PromediosPage |
| **FilterSelect** | `value`, `onChange`, `options`, `allLabel`, `mapOption` | GrupoListPage, ExamenListPage, HorarioListPage, UserListPage, AdmisionListPage |
| **FormPageLayout** | `title`, `maxWidth` | Todas las form pages (Postulante, Docente, Grupo, Examen, Horario, Pago, User, Postulacion) |
| **HeaderBar** | `title`, `createLabel`, `onCreate` | PostulanteListPage, DocenteListPage, GrupoListPage, ExamenListPage, HorarioListPage, PagoListPage, UserListPage |
| **Pagination** | `page`, `totalPages`, `setPage`, `simple` | PostulanteListPage, DocenteListPage, GrupoListPage, ExamenListPage, PagoListPage, UserListPage |
| **ProgressBar** | `value`, `height`, `showLabel`, `children` | DashboardPage, ReportesPage, DocenteListPage, AdmisionListPage |
| **SearchBar** | `placeholder`, `value`, `onChange`, `onSearch` | PostulanteListPage |
| **StatCard** | `title`, `value`, `color`, `icon`, `variant` (`border`/`bg`), `colClass` | DashboardPage, ReportesPage, AdmisionListPage, PromediosPage |
| **SubmitButton** | `loading`, `label`, `loadingLabel`, `disabled` | Todas las form pages |

## Hooks (API calls)

| Hook | Funciones principales |
|---|---|
| useAuth | login, register, logout, user |
| usePostulantes | getPostulantes(search, perPage), getPostulante, store, update, delete |
| usePostulaciones | getPostulaciones(page, filters), store, cancel |
| useGrupos | getGrupos(page, params), getGrupo(id) |
| useExamenes | getExamenes(page, grupoId), getExamenRindes(id) |
| useRindes | getRindesByPostulacion(id), storeRinde, updateRinde, deleteRinde |
| usePromedios | getPromedios(postulacionId) |
| useCatalogos | getMaterias, getCarreras, getTurnos, getSemestres, getRequisitos, getAdmisiones |
| useReportes | getReporteAdmision, getMisGrupos, getMisNotas |

## Convenciones

- Los hooks retornan los datos directamente (no response completo) cuando es posible.
- Las notificaciones se manejan con `sonner` (`toast.success`, `toast.error`).
- Las relaciones de Laravel llegan como `snake_case` en JSON (ej: `postulacion_grupos` no `postulacionGrupos`).
- Componentes de página se nombran con sufijo `Page` (ej: `NotasPage.jsx`).
- Estado global solo para autenticación (`authStore.js`); el resto es estado local.
- Store de Zustand se consume con destructuring: `const { user, logout } = useAuthStore()`.
- Componentes reutilizables van en `components/ui/` y aceptan props con defaults.

## Comandos

```bash
npm run dev        # Desarrollo
npm run build      # Producción
npm run lint       # ESLint
```
