# CUP-FICCT — Sistema de Control Universitario de Postulaciones

Sistema web para la gestión del proceso de admisión de la carrera de Ingeniería de la FICCT (UAGRM). Maneja postulantes, postulaciones, asignación de grupos, registro de notas, promedios y reportes.

## Stack

| Capa     | Tecnología               |
| -------- | ------------------------ |
| Frontend | React 19 + Vite 8        |
| Backend  | Laravel 12 + PHP 8.2     |
| BD       | PostgreSQL 18            |
| Auth     | Laravel Sanctum          |
| UI       | Bootstrap 5 + sonner     |
| Estado   | Zustand 5                |
| Routing  | react-router-dom v7      |
| Linter   | standard (JS)            |

## Arquitectura

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  React   │────▶│ Laravel  │────▶│ Postgres │
│  (Vite)  │◀────│  (API)   │◀────│   (BD)   │
└──────────┘     └──────────┘     └──────────┘
```

- API RESTful con Sanctum (SPA con cookies).
- Roles: `admin`, `docente`, `postulante`.
- Promedios calculados por trigger BD `trg_after_rinde`.
- ~1000 postulantes, grupos de max. 70 estudiantes.

## Estructura del proyecto

```
/proyecto-cup/
├── backend/       → Laravel API (controladores, modelos, rutas)
├── front/         → React SPA (componentes, páginas, hooks)
├── db/            → SQL, Docker, diagramas
├── AGENTS.md      → Este archivo
├── COMANDOS_PROYECTO.md
├── front/AGENTS.md
├── backend/AGENTS.md
└── db/AGENTS.md
```

## Convenciones generales

- **Symbols**: todos los magic strings (estados, roles, sexo, días, etc.) reemplazados por constantes `Symbol()` en `front/src/constants/index.js`. Usar `str(sym)` para obtener el string value cuando se requiere (API, HTML options, BadgeStatus).
- **Filtros responsivos**: usar `d-flex flex-wrap gap-2` + `flex: [grow] [shrink] clamp(min, preferido, max)` en todos los filtros de listados. Sin Bootstrap grid columns.
- **Optional chaining** (`?.`) obligatorio al acceder propiedades, funciones opcionales, o elementos de array por índice.
- **Laravel serializa** relaciones como `snake_case` en JSON.
- **Comandos** en `COMANDOS_PROYECTO.md`.

## Postulante vs Estudiante

El sistema distingue dos estados de una misma persona:

| Concepto | Descripción |
|----------|-------------|
| **Postulante** | Persona registrada que aún no ha sido admitida. Su rol en BD es `postulante`. |
| **Estudiante** | Postulante cuyo estado de postulación cambió a `admitido`. Sigue teniendo rol `postulante` en BD, pero a nivel UI se muestra como "Estudiante". |

La tabla `postulante` en BD contiene ambos perfiles. El cambio es semántico según el estado de admisión.
