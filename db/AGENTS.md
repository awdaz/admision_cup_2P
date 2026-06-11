# Base de Datos — PostgreSQL 18

Esquema y configuración de la base de datos del sistema CUP-FICCT.

## Stack

- PostgreSQL 18
- Docker Compose (entorno local)
- StarUML / pgModeler / PlantUML (diagramas)

## Estructura

```
db/
├── cup_uagrm.sql              → Esquema completo (tablas, funciones, triggers)
├── cup_uagrm_datos.sql        → Datos de semilla (catálogos)
├── cup_uagrm_consultas.sql    → Consultas de ejemplo/reporte
├── docker-compose.yml         → Entorno PostgreSQL local
├── comandos_docker.md         → Comandos útiles de Docker
├── diseño_clases.sql          → Diseño de clases (alternativo)
├── cup_uagrm.puml             → Diagrama PlantUML
├── base_cup.mdj               → Proyecto StarUML
├── diagramaEntidadRelacion.pgerd → Diagrama pgModeler
└── ent_rel.png                → Imagen del diagrama ER
```

## Esquema principal (`cup_uagrm.sql`)

### Tablas principales

| Tabla | Propósito |
|---|---|
| `persona` | Datos personales (CI, nombre, apellido, email, teléfono) |
| `postulante` | Postulante (hereda de persona vía `persona_id`) |
| `postulacion` | Postulación central con carreras, turno, semestre, promedios |
| `carrera` | Catálogo de carreras |
| `materia` | Materias del proceso (Matemáticas, Física, Computación, Inglés) |
| `docente` | Docentes del sistema |
| `grupo` | Grupos académicos con materia, docente, turno |
| `postulacion_grupo` | Asignación postulante ↔ grupo |
| `examen` | Exámenes por grupo (nro, porcentaje, fecha) |
| `rinde` | Notas individuales (postulacion_id, examen_id, nota) |
| `turno` | Turnos (mañana, tarde, noche) |
| `semestre` | Semestres académicos |
| `admision` | Procesos de admisión |
| `pago` | Pagos de postulaciones |
| `requisito` | Requisitos documentales |
| `postulante_requisito` | Cumplimiento de requisitos por postulante |
| `horario` | Horarios de grupos (día, hora, aula) |
| `aula` | Aulas disponibles |
| `usuario` | Usuarios del sistema (autenticación Sanctum) |

### Promedios

Los promedios se calculan automáticamente mediante:

1. **Función** `fn_calcular_promedios(p_postulacion_id)` — calcula promedio ponderado por materia y general.
2. **Función** `fn_actualizar_promedios_postulacion(p_postulacion_id)` — persiste los promedios en la tabla `postulacion`.
3. **Trigger** `trg_after_rinde` — se dispara después de INSERT/UPDATE/DELETE en `rinde` y actualiza los promedios automáticamente.

Columnas de promedio en `postulacion`:
- `promedio_matematicas`, `promedio_fisica`, `promedio_computacion`, `promedio_ingles`, `promedio_general` (decimal 4,2)
- `aprobado` (boolean)

### Docker

```bash
docker compose up -d    # Iniciar PostgreSQL
docker compose down     # Detener
```

### Convenciones

- Nombres de tablas y columnas en `snake_case`.
- Triggers con prefijo `trg_`, funciones con `fn_`, procedimientos con `sp_`.
- Relaciones con foreign keys explícitas.
- Catálogos cargados desde `cup_uagrm_datos.sql`.
