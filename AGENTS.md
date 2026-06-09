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
| Routng   | react-router-dom v7      |

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
├── backend/       → Laravel API
├── front/         → React SPA
├── db/            → SQL, Docker, diagramas
└── *.md           → documentos del proyecto
```

## Convenciones generales

- Laravel serializa relaciones como `snake_case` en JSON.
- Errores frecuentes: camelCase en JS para atributos que Laravel devuelve como snake_case.
- Comandos disponibles en `COMANDOS_PROYECTO.md`.
