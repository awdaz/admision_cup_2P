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
├── *.md           → documentos del proyecto
│   ├── AGENTS.md            → Este archivo (visión general)
│   ├── COMANDOS_PROYECTO.md → Comandos útiles
│   ├── front/AGENTS.md      → Frontend (componentes, hooks, páginas)
│   ├── backend/AGENTS.md    → Backend (controladores, rutas)
│   └── db/AGENTS.md         → Base de datos (esquema, triggers)
```

## Convenciones generales

- Laravel serializa relaciones como `snake_case` en JSON.
- Errores frecuentes: camelCase en JS para atributos que Laravel devuelve como snake_case.
- Optional chaining (`?.`) obligatorio en frontend al acceder propiedades, funciones opcionales, o elementos de array por índice (`obj?.prop`, `arr?.[i]`, `fn?.()`).
- Comandos disponibles en `COMANDOS_PROYECTO.md`.

## Postulante vs Estudiante

El sistema distingue dos estados de una misma persona:

| Concepto | Descripción |
|----------|-------------|
| **Postulante** | Persona registrada que aún no ha sido admitida. Su rol en BD es `postulante`. |
| **Estudiante** | Postulante cuyo estado de postulación cambió a `admitido`. Sigue teniendo rol `postulante` en BD, pero a nivel UI se muestra como "Estudiante". |

La tabla `postulante` en BD contiene ambos perfiles. El cambio de "Postulante" a "Estudiante" es semántico según el estado de admisión. En componentes de UI:
- Las listas de personas aplicando se etiquetan como **Postulante**.
- Las personas ya asignadas a grupos (con notas, horarios, etc.) se etiquetan como **Estudiante**.
- El rol `tipo: 'postulante'` en la API se mantiene igual para ambos casos.
