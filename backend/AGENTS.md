# Backend — Laravel 12 API

API RESTful que gestiona postulantes, postulaciones, grupos, notas, promedios y reportes del sistema CUP-FICCT.

## Stack

- Laravel 12 / PHP 8.2
- PostgreSQL 18
- Sanctum (autenticación SPA con cookies)
- Roles: `admin`, `docente`, `postulante`

## Estructura

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/    → 16 controladores
│   │   └── Requests/           → Form requests con validación
│   └── Models/                 → 19 modelos Eloquent
├── routes/
│   └── api.php                 → Definición de rutas
├── database/
│   ├── migrations/
│   ├── factories/
│   └── seeders/
└── config/
```

## Controladores (API)

| Controlador | Endpoints clave |
|---|---|
| AuthController | login, register, logout, user |
| PostulanteController | CRUD + search por CI |
| PostulacionController | CRUD + cancelar |
| GrupoController | CRUD + listar con filtros (materia, turno) |
| ExamenController | CRUD + rindes por examen (accesible por admin y docente con autorización) |
| RindeController | store/update (upsert por postulacion_id+examen_id), rindes por postulacion |
| PromedioController | show (cálculo desde BD), recalcular (admin) |
| ReporteController | admision, mis-grupos, mis-notas |
| CatalogoController | carreras, turnos, semestres, materias, requisitos, admisiones |
| DashboardController | estadísticas |
| DocenteController | CRUD + contratar + disponibilidad |
| HorarioController | CRUD |
| PagoController | CRUD + confirmar |
| RequisitoController | CRUD |
| UserController | CRUD + toggle-active + change-password |
| AdmisionProcesoController | procesar, generar-grupos, cupos, listarPostulantesCupo |

## Middleware y rutas

- **`auth:sanctum`** — grupo base para todas las rutas protegidas.
- **`role:admin`** — grupo adicional para operaciones exclusivas de administradores (escritura de postulantes, docentes, grupos, exámenes, horarios; eliminación de rindes; gestión de admisiones y usuarios).
- La ruta `examenes/{examen}/rindes` está en el grupo `auth:sanctum` (no solo admin) para que **docentes** también puedan consultar notas de sus exámenes. El controlador verifica que el docente tenga acceso al grupo del examen.
- Las rutas de escritura de rindes (`POST /rindes`, `PUT /rindes/{rinde}`) están en el grupo `auth:sanctum`. Docentes solo pueden calificar exámenes de sus propios grupos (validado en el controlador).

## Modelos clave

- **Postulacion**: contiene promedios calculados (`promedio_matematicas`, `promedio_fisica`, `promedio_computacion`, `promedio_ingles`, `promedio_general`, `aprobado`). Actualizados por trigger `trg_after_rinde`.
- **Rinde**: nota individual por `(postulacion_id, examen_id)`. Unique key compuesta.
- **Grupo**: asociado a materia, docente, turno. Tiene `postulacionGrupos` (estudiantes) y `examenes`.
- **PostulacionGrupo**: pivote grupo ↔ postulación.

## Convenciones

- Rutas con `auth:sanctum` y middleware `role:admin` para operaciones administrativas.
- Paginación con `per_page` (max 200 en grupo, 1000 en postulante).
- Filtros por query params: `search` (ILIKE), `materia_id`, `turno_id`.
- Las relaciones Eloquent se serializan como `snake_case` en JSON.
- Docentes autorizados via verificación de `docente_id` contra el grupo del examen.

## Comandos útiles

```bash
php artisan serve
php artisan make:controller Api/...Controller
php artisan make:model ... -m
php artisan migrate:fresh --seed
```
