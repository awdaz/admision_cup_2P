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
│   └── cliente.js          → Cliente axios con interceptors
├── components/
│   ├── Layout/             → Sidebar, navbar, layout wrappers
│   ├── ui/                 → Componentes reutilizables
│   └── ProtectedRoute.jsx  → Guard de autenticación
├── hooks/                  → 13 hooks personalizados
├── pages/                  → 24 páginas agrupadas por módulo
├── router/
│   └── AppRouter.jsx       → Definición de rutas
├── store/
│   └── authStore.js        → Store de autenticación (Zustand)
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

## Comandos

```bash
npm run dev        # Desarrollo
npm run build      # Producción
npm run lint       # ESLint
```
