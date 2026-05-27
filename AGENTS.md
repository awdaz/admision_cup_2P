# CUP UAGRM — Database Project

## Stack
- **PostgreSQL 18** via Docker (imagen `postgres:18`)
- Sin backend/frontend todavía — solo esquema BD + datos de ejemplo

## Comandos esenciales
```powershell
# Iniciar contenedor en segundo plano
docker compose up -d

# Eliminar contenedor + volumen (reinicia BD desde los scripts init)
docker compose down -v
docker compose up -d

# Conectar directo desde el contenedor
docker exec -it cup_uagrm_db psql -U admin_test -d cup_uagrm
```

## Conexión BD
| Campo     | Valor          |
|-----------|----------------|
| Host      | `localhost`    |
| Port      | **5433**       |
| User      | `admin_test`   |
| Password  | `cup_pass_2026`|
| Database  | `cup_uagrm`    |

## Carga de datos (orden de init)
Los scripts se ejecutan automáticamente al crear el contenedor:

1. `cup_uagrm.sql` → esquema (22 tablas + funciones + triggers + vistas)
2. `cup_uagrm_datos.sql` → 1000 postulantes, 30 postulantes a docente (16 contratados), notas, pagos

Si ya existe el volumen (`postgres_data`), los init NO se re-ejecutan. Usar `docker compose down -v` para forzar recarga.

El archivo `cup_uagrm_datos.sql` comienza con `TRUNCATE ... RESTART IDENTITY CASCADE` que borra todo antes de insertar.

## Arquitectura BD

### Herencia
- `persona` → `postulante` (postulantes)
- `persona` → `docente` (docentes)

### Tablas principales (22)
- **persona**: CI, nombre, apellido, fecha_nac, sexo, email, teléfono, direccion, ciudad
- **postulante**: código, colegio_procedencia, requisitos_verificado
- **docente**: es_profesional_area, tiene_maestria, tiene_diplomado_edu_sup, contratado (max 4 grupos)
- **usuario**: credenciales (postulante/docente/admin)
- **requisito** + **postulante_requisito**: validación de Título Bachiller y otros
- **postulacion**: núcleo (carreras 1ra/2da opción, turno, promedios, estado)
- **postulacion_grupo**: asigna postulante a 4 grupos (1 por materia)
- **materia**: MAT(30%), FIS(30%), COM(30%), ING(10%) — campo `peso`
- **grupo**: cupo máximo 70, pertenece a materia+turno
- **examen**: 3 por grupo, con `porcentaje` configurable (default 33.33%)
- **rinde**: notas (0-100)
- **pago**: soporta pasarela (transaccion_id, gateway, respuesta_gateway)

## Algoritmos clave

### Promedio por materia
```
nota_materia = SUM(nota_parcial_i × porcentaje_parcial_i / 100)
```
Cada materia tiene 3 parciales con % definido por admisión. La suma de los 3 % da 100.

### Promedio general (nota final CUP)
```
promedio_general = MAT×0.30 + FIS×0.30 + COM×0.30 + ING×0.10
```

### Aprobación
- **Aprobado** si TODAS las materias tienen promedio ≥ 60
- Admitido por cupo: 1ra opción, si está llena → 2da opción, sino → rechazado

### Cálculo de grupos
```
CantidadGrupos = CEIL(TotalInscritos / 70)
```
Implementado en `sp_generar_grupos(p_admision_id)`.

## Procedimientos y triggers importantes

| Nombre | Propósito |
|--------|-----------|
| `sp_procesar_admision(id)` | Asigna cupos por orden de mérito |
| `sp_generar_grupos(id)` | Crea grupos automáticos según inscritos/70 |
| `sp_contratar_docente(id)` | Valida profesional+maestría+diplomado antes de contratar |
| `trg_after_rinde` | Recalcula promedios al insertar/actualizar/borrar notas |
| `trg_before_insert_grupo` | Impide asignar >4 grupos a un docente |

### Flujo típico de admisión
```sql
CALL sp_procesar_admision(1);
SELECT * FROM vw_resultados_admision ORDER BY promedio_general DESC;
SELECT * FROM fn_reporte_admision(1);
```

## Vistas disponibles
- `vw_resultados_admision` — resultados completos con datos personales
- `vw_acta_notas` — notas con ponderación por porcentaje
- `vw_requisitos_postulante` — estado de requisitos
- `vw_docentes_asignacion` — docentes contratados y sus grupos

## Convenciones
- `persona.ci` y `persona.email` son UNIQUE
- `rinde.nota` CHECK (0-100)
- `grupo.cupo` CHECK (<=70)
- Las FK usan `ON DELETE RESTRICT` (no cascade) en tablas críticas
- Los procedimientos se invocan con `CALL`, funciones con `SELECT`
- `fn_calcular_promedios` es una función TABLE (SELECT), `fn_actualizar_promedios_postulacion` es VOID (usada por trigger)
