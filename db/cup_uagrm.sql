-- ============================================================
-- SISTEMA CUP - UAGRM
-- Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones
-- Carreras: Ing. Sistemas, Ing. Informática, Ing. Redes y Telecom., Ing. Robótica
-- Motor: PostgreSQL 15+
-- Propósito: Esquema principal del sistema de Control Único de Postulaciones (CUP)
--            de la Universidad Autónoma Gabriel René Moreno (UAGRM).
--            Gestiona postulantes, docentes, carreras, materias, exámenes,
--            admisiones, pagos y la asignación de cupos por carrera.
-- ============================================================

-- CREATE DATABASE cup_uagrm; -- DB creada por Docker via POSTGRES_DB

-- ============================================================
-- TABLAS BASE
-- ============================================================
-- Estas tablas representan las entidades fundamentales del sistema:
-- persona, postulante, docente y usuario. persona es la tabla raíz
-- de la que heredan postulante y docente (relación 1:1).

-- Tabla: persona
-- Almacena los datos personales de todos los individuos del sistema
-- (postulantes, docentes, administradores).
-- PK: id (SERIAL)
-- UQ: ci, email
-- Notas: sexo está restringido a 'Masculino', 'Femenino' u 'Otro'.
CREATE TABLE persona (
    id          SERIAL          PRIMARY KEY,
    ci          VARCHAR(20)     NOT NULL UNIQUE,
    nombre      VARCHAR(100)    NOT NULL,
    apellido    VARCHAR(100)    NOT NULL,
    fecha_nac   DATE            NOT NULL,
    sexo        VARCHAR(10)     CHECK (sexo IN ('Masculino', 'Femenino', 'Otro')),
    email       VARCHAR(200)    NOT NULL UNIQUE,
    telefono    VARCHAR(20),
    direccion   VARCHAR(300),
    ciudad      VARCHAR(100)
);

-- Tabla: postulante
-- Almacena a cada persona que se postula a una carrera.
-- PK: id (SERIAL)
-- FK: persona_id -> persona(id) (1:1, CASCADE)
-- UQ: codigo (código único de postulante, ej: POST-0001)
-- requisitos_verificado indica si ya se validaron sus documentos.
CREATE TABLE postulante (
    id          SERIAL          PRIMARY KEY,
    persona_id  INTEGER         NOT NULL UNIQUE,
    codigo      VARCHAR(50)     NOT NULL UNIQUE,
    colegio_procedencia VARCHAR(200),
    requisitos_verificado BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (persona_id) REFERENCES persona(id) ON DELETE CASCADE
);

-- Tabla: docente
-- Almacena a los docentes que dictan las materias del curso de admisión.
-- PK: id (SERIAL)
-- FK: persona_id -> persona(id) (1:1, CASCADE)
-- UQ: cod_docente (código único del docente, ej: DOC-MAT-01)
-- Los campos es_profesional_area, tiene_maestria, tiene_diplomado_edu_sup
-- son requisitos obligatorios para ser contratado.
CREATE TABLE docente (
    id                      SERIAL          PRIMARY KEY,
    persona_id              INTEGER         NOT NULL UNIQUE,
    cod_docente             VARCHAR(50)     NOT NULL UNIQUE,
    es_profesional_area     BOOLEAN         NOT NULL DEFAULT FALSE,
    tiene_maestria          BOOLEAN         NOT NULL DEFAULT FALSE,
    tiene_diplomado_edu_sup BOOLEAN         NOT NULL DEFAULT FALSE,
    contratado              BOOLEAN         NOT NULL DEFAULT FALSE,
    FOREIGN KEY (persona_id) REFERENCES persona(id) ON DELETE CASCADE
);

-- Tabla: usuario
-- Almacena las credenciales de acceso al sistema para cada persona.
-- PK: id (SERIAL)
-- FK: persona_id -> persona(id) (1:1, CASCADE)
-- UQ: username, email
-- tipo define el rol: 'postulante', 'docente' o 'admin'.
-- password_hash guarda el hash bcrypt de la contraseña.
CREATE TABLE usuario (
    id              SERIAL          PRIMARY KEY,
    username        VARCHAR(50)     NOT NULL UNIQUE,
    email           VARCHAR(200)    NOT NULL UNIQUE,
    password_hash   VARCHAR(300)    NOT NULL,
    tipo            VARCHAR(20)     NOT NULL CHECK (tipo IN ('postulante', 'docente', 'admin')),
    activo          BOOLEAN         NOT NULL DEFAULT TRUE,
    persona_id      INTEGER         NOT NULL UNIQUE,
    FOREIGN KEY (persona_id) REFERENCES persona(id) ON DELETE CASCADE
);

-- ============================================================
-- CARRERAS
-- ============================================================
-- Catálogo de carreras ofrecidas en la facultad.

-- Tabla: carrera
-- Define cada carrera universitaria disponible para postulación.
-- PK: id (SERIAL)
-- UQ: codigo (ej: ING-SIS, ING-INF)
-- cupo: cantidad máxima de estudiantes admitidos por carrera.
-- nota_corte: promedio mínimo del último admitido (se actualiza al procesar admisión).
CREATE TABLE carrera (
    id          SERIAL          PRIMARY KEY,
    codigo      VARCHAR(20)     NOT NULL UNIQUE,
    nombre      VARCHAR(200)    NOT NULL,
    cupo        INTEGER         NOT NULL CHECK (cupo > 0),
    nota_corte  DECIMAL(4,2)
);

-- ============================================================
-- TURNOS: Mañana (presencial), Tarde (presencial), Noche (virtual)
-- ============================================================

-- Tabla: turno
-- Catálogo de turnos disponibles para cursar las materias.
-- PK: id (SERIAL)
-- UQ: nombre ('Mañana', 'Tarde', 'Noche')
-- modalidad: 'presencial' (Mañana/Tarde) o 'virtual' (Noche).
CREATE TABLE turno (
    id          SERIAL          PRIMARY KEY,
    nombre      VARCHAR(50)     NOT NULL UNIQUE,
    modalidad   VARCHAR(20)     NOT NULL CHECK (modalidad IN ('presencial', 'virtual'))
);

-- ============================================================
-- SEMESTRE Y ADMISION
-- ============================================================

-- Tabla: semestre
-- Define los períodos académicos (ej: 1-2026).
-- PK: id (SERIAL)
-- UQ: (semestre, anio) — no pueden existir dos registros con el mismo semestre y año.
CREATE TABLE semestre (
    id          SERIAL          PRIMARY KEY,
    semestre    VARCHAR(10)     NOT NULL,
    anio        INTEGER         NOT NULL CHECK (anio >= 2000),
    UNIQUE (semestre, anio)
);

-- Tabla: admision
-- Cada proceso de admisión (convocatoria) que agrupa postulaciones.
-- PK: id (SERIAL)
-- UQ: nro (número de admisión, ej: ADM-001-2026)
-- estado: 'activa' (en curso), 'cerrada' (ya no se reciben postulaciones),
--         'finalizada' (asignación de cupos completada).
CREATE TABLE admision (
    id              SERIAL          PRIMARY KEY,
    nro             VARCHAR(20)     NOT NULL UNIQUE,
    estado          VARCHAR(20)     NOT NULL DEFAULT 'activa'
                    CHECK (estado IN ('activa', 'cerrada', 'finalizada')),
    fecha_inicio    DATE            NOT NULL,
    fecha_fin       DATE,
    gestion         INTEGER         NOT NULL CHECK (gestion >= 2000),
    descripcion     VARCHAR(500)
);

-- ============================================================
-- MATERIAS: Matemáticas, Física, Computación, Inglés
-- ============================================================

-- Tabla: materia
-- Catálogo de materias que conforman el curso de admisión.
-- PK: id (SERIAL)
-- UQ: codigo (MAT, FIS, COM, ING)
-- peso: porcentaje que aporta cada materia al promedio general
--       (Mat 30%, Fis 30%, Com 30%, Ing 10%).
CREATE TABLE materia (
    id          SERIAL          PRIMARY KEY,
    codigo      VARCHAR(20)     NOT NULL UNIQUE,
    nombre      VARCHAR(200)    NOT NULL,
    peso        DECIMAL(4,2)    NOT NULL DEFAULT 25.00 CHECK (peso > 0 AND peso <= 100),
    descripcion VARCHAR(500)
);

-- Pesos por materia: Matemáticas 30%, Física 30%, Computación 30%, Inglés 10%
INSERT INTO materia (codigo, nombre, peso, descripcion) VALUES
('MAT', 'Matemáticas', 30.00, 'Razonamiento lógico matemático y álgebra'),
('FIS', 'Física', 30.00, 'Conceptos fundamentales de física'),
('COM', 'Computación', 30.00, 'Introducción a la computación y algoritmos'),
('ING', 'Inglés', 10.00, 'Comprensión lectora y gramática básica del inglés');

-- ============================================================
-- AULAS
-- ============================================================

-- Tabla: aula
-- Define los espacios físicos/virtuales donde se dictan las materias.
-- PK: id (SERIAL)
-- UQ: (nro, piso) — no pueden existir dos aulas con el mismo número en el mismo piso.
CREATE TABLE aula (
    id          SERIAL      PRIMARY KEY,
    nro         VARCHAR(20) NOT NULL,
    piso        INTEGER     NOT NULL DEFAULT 0,
    capacidad   INTEGER     NOT NULL CHECK (capacidad > 0),
    UNIQUE (nro, piso)
);

-- ============================================================
-- REQUISITOS DE POSTULACIÓN (Título Bachiller, etc.)
-- ============================================================

-- Tabla: requisito
-- Catálogo de documentos obligatorios que debe presentar cada postulante.
-- PK: id (SERIAL)
-- UQ: nombre (Título Bachiller, Cédula de Identidad, etc.)
CREATE TABLE requisito (
    id          SERIAL          PRIMARY KEY,
    nombre      VARCHAR(100)    NOT NULL UNIQUE,
    descripcion VARCHAR(500)
);

INSERT INTO requisito (nombre, descripcion) VALUES
('Título Bachiller', 'Título de bachiller otorgado por unidad educativa reconocida'),
('Certificado de Nacimiento', 'Certificado de nacimiento original o computarizado'),
('Cédula de Identidad', 'Fotocopia de cédula de identidad vigente'),
('Fotografías', 'Tres fotografías 4x4 fondo azul'),
('Examen Médico', 'Certificado de aptitud médica');

-- Tabla: postulante_requisito
-- Relación N:M entre postulantes y requisitos.
-- PK: id (SERIAL)
-- FK: postulante_id -> postulante(id) (CASCADE)
-- FK: requisito_id -> requisito(id) (RESTRICT)
-- UQ: (postulante_id, requisito_id) — un postulante no puede tener el mismo requisito duplicado.
-- cumplido indica si el postulante ya presentó ese documento.
CREATE TABLE postulante_requisito (
    id              SERIAL      PRIMARY KEY,
    postulante_id   INTEGER     NOT NULL,
    requisito_id    INTEGER     NOT NULL,
    cumplido        BOOLEAN     NOT NULL DEFAULT FALSE,
    fecha_verificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postulante_id) REFERENCES postulante(id) ON DELETE CASCADE,
    FOREIGN KEY (requisito_id) REFERENCES requisito(id) ON DELETE RESTRICT,
    UNIQUE (postulante_id, requisito_id)
);

-- ============================================================
-- GRUPOS (cada grupo = materia + turno, cupo max 70)
-- ============================================================

-- Tabla: grupo
-- Cada grupo es una combinación de materia, docente y turno.
-- Los postulantes se asignan a grupos para rendir exámenes.
-- PK: id (SERIAL)
-- UQ: codigo (ej: G-1-MAT-1-A)
-- FK: materia_id -> materia(id) (RESTRICT)
-- FK: docente_id -> docente(id) (RESTRICT)
-- FK: turno_id -> turno(id) (RESTRICT)
-- cupo: máximo 70 postulantes por grupo.
CREATE TABLE grupo (
    id          SERIAL          PRIMARY KEY,
    codigo      VARCHAR(20)     NOT NULL UNIQUE,
    nombre      VARCHAR(200)    NOT NULL,
    cupo        INTEGER         NOT NULL CHECK (cupo > 0 AND cupo <= 70),
    materia_id  INTEGER         NOT NULL,
    docente_id  INTEGER         NOT NULL,
    turno_id    INTEGER         NOT NULL,
    FOREIGN KEY (materia_id) REFERENCES materia(id) ON DELETE RESTRICT,
    FOREIGN KEY (docente_id) REFERENCES docente(id) ON DELETE RESTRICT,
    FOREIGN KEY (turno_id) REFERENCES turno(id) ON DELETE RESTRICT
);

-- ============================================================
-- EXAMENES (3 parciales por grupo)
-- ============================================================

-- Tabla: examen
-- Cada grupo tiene 3 exámenes parciales (cada uno vale ~33.33%).
-- PK: id (SERIAL)
-- UQ: (nro, grupo_id) — no puede haber dos exámenes con el mismo número en un grupo.
-- FK: grupo_id -> grupo(id) (RESTRICT)
-- porcentaje: contribución del examen a la nota final de la materia (default 33.33).
CREATE TABLE examen (
    id          SERIAL          PRIMARY KEY,
    nro         VARCHAR(20)     NOT NULL,
    descripcion VARCHAR(500),
    fecha       DATE            NOT NULL,
    grupo_id    INTEGER         NOT NULL,
    porcentaje  DECIMAL(5,2)    DEFAULT 33.33,
    FOREIGN KEY (grupo_id) REFERENCES grupo(id) ON DELETE RESTRICT,
    UNIQUE (nro, grupo_id),
    CHECK (porcentaje > 0 AND porcentaje <= 100)
);

-- ============================================================
-- HORARIOS
-- ============================================================

-- Tabla: horario
-- Define en qué días y horas se dicta cada grupo, y en qué aula.
-- PK: id (SERIAL)
-- FK: grupo_id -> grupo(id) (CASCADE) — si se elimina un grupo, se eliminan sus horarios.
-- FK: aula_id -> aula(id) (SET NULL) — si se elimina un aula, el horario queda sin aula asignada.
-- CHECK: hora_fin > hora_inicio (valida que el horario sea lógico).
CREATE TABLE horario (
    id          SERIAL      PRIMARY KEY,
    dia         VARCHAR(15) NOT NULL CHECK (dia IN (
                    'Lunes', 'Martes', 'Miercoles', 'Jueves',
                    'Viernes', 'Sabado', 'Domingo'
                )),
    hora_inicio TIME        NOT NULL,
    hora_fin    TIME        NOT NULL,
    grupo_id    INTEGER     NOT NULL,
    aula_id     INTEGER,
    FOREIGN KEY (grupo_id) REFERENCES grupo(id) ON DELETE CASCADE,
    FOREIGN KEY (aula_id) REFERENCES aula(id) ON DELETE SET NULL,
    CHECK (hora_fin > hora_inicio)
);

-- ============================================================
-- POSTULACION (corazón del sistema)
-- ============================================================
-- Tabla central del sistema. Cada fila representa la postulación
-- de un postulante a una carrera, con sus preferencias, turno,
-- promedios y resultado de admisión.

-- Tabla: postulacion
-- PK: id (SERIAL)
-- FK: postulante_id -> postulante(id) (RESTRICT)
-- FK: carrera_id -> carrera(id) (RESTRICT) — carrera de preferencia principal
-- FK: primera_opcion_id -> carrera(id) (RESTRICT)
-- FK: segunda_opcion_id -> carrera(id) (RESTRICT) — opcional
-- FK: turno_id -> turno(id) (RESTRICT)
-- FK: semestre_id -> semestre(id) (RESTRICT)
-- FK: admision_id -> admision(id) (SET NULL)
-- FK: carrera_asignada_id -> carrera(id) (SET NULL) — carrera finalmente asignada
-- estado: 'pendiente', 'inscrito', 'admitido', 'rechazado', 'cancelado'
-- Los campos promedio_* se actualizan automáticamente vía trigger al insertar notas.
CREATE TABLE postulacion (
    id                      SERIAL          PRIMARY KEY,
    estado                  VARCHAR(20)     NOT NULL DEFAULT 'pendiente'
                            CHECK (estado IN ('pendiente', 'inscrito', 'admitido', 'rechazado', 'cancelado')),
    fecha                   DATE            NOT NULL DEFAULT CURRENT_DATE,
    hora                    TIME            NOT NULL DEFAULT LOCALTIME,
    postulante_id           INTEGER         NOT NULL,
    carrera_id              INTEGER         NOT NULL,
    primera_opcion_id       INTEGER         NOT NULL,
    segunda_opcion_id       INTEGER,
    turno_id                INTEGER         NOT NULL,
    semestre_id             INTEGER         NOT NULL,
    admision_id             INTEGER,
    promedio_matematicas    DECIMAL(4,2),
    promedio_fisica         DECIMAL(4,2),
    promedio_computacion    DECIMAL(4,2),
    promedio_ingles         DECIMAL(4,2),
    promedio_general        DECIMAL(4,2),
    aprobado                BOOLEAN         DEFAULT FALSE,
    carrera_asignada_id     INTEGER,
    FOREIGN KEY (postulante_id) REFERENCES postulante(id) ON DELETE RESTRICT,
    FOREIGN KEY (carrera_id) REFERENCES carrera(id) ON DELETE RESTRICT,
    FOREIGN KEY (primera_opcion_id) REFERENCES carrera(id) ON DELETE RESTRICT,
    FOREIGN KEY (segunda_opcion_id) REFERENCES carrera(id) ON DELETE RESTRICT,
    FOREIGN KEY (turno_id) REFERENCES turno(id) ON DELETE RESTRICT,
    FOREIGN KEY (semestre_id) REFERENCES semestre(id) ON DELETE RESTRICT,
    FOREIGN KEY (admision_id) REFERENCES admision(id) ON DELETE SET NULL,
    FOREIGN KEY (carrera_asignada_id) REFERENCES carrera(id) ON DELETE SET NULL
);

-- ============================================================
-- POSTULACION_GRUPO (asignación del postulante a sus 4 grupos)
-- ============================================================

-- Tabla: postulacion_grupo
-- Asigna cada postulación a los 4 grupos (uno por materia)
-- en los que el postulante rendirá exámenes.
-- PK: id (SERIAL)
-- FK: postulacion_id -> postulacion(id) (CASCADE)
-- FK: grupo_id -> grupo(id) (RESTRICT)
-- FK: materia_id -> materia(id) (RESTRICT)
-- UQ: (postulacion_id, materia_id) — un postulante tiene un solo grupo por materia.
CREATE TABLE postulacion_grupo (
    id              SERIAL      PRIMARY KEY,
    postulacion_id  INTEGER     NOT NULL,
    grupo_id        INTEGER     NOT NULL,
    materia_id      INTEGER     NOT NULL,
    FOREIGN KEY (postulacion_id) REFERENCES postulacion(id) ON DELETE CASCADE,
    FOREIGN KEY (grupo_id) REFERENCES grupo(id) ON DELETE RESTRICT,
    FOREIGN KEY (materia_id) REFERENCES materia(id) ON DELETE RESTRICT,
    UNIQUE (postulacion_id, materia_id)
);

-- ============================================================
-- PAGOS
-- ============================================================

-- Tabla: pago
-- Registra los pagos realizados por cada postulante para su inscripción.
-- PK: id (SERIAL)
-- UQ: numero_recibo (número único de recibo)
-- FK: postulacion_id -> postulacion(id) (RESTRICT)
-- FK: postulante_id -> postulante(id) (RESTRICT)
-- metodo_pago: 'efectivo', 'transferencia', 'tarjeta', 'qr', 'pasarela'
-- estado: 'pendiente', 'confirmado', 'rechazado', 'reembolsado'
-- transaccion_id, gateway, respuesta_gateway: soporte para pagos por pasarela.
CREATE TABLE pago (
    id              SERIAL          PRIMARY KEY,
    numero_recibo   VARCHAR(50)     NOT NULL UNIQUE,
    monto           DECIMAL(10,2)   NOT NULL CHECK (monto > 0),
    metodo_pago     VARCHAR(30)     NOT NULL
                    CHECK (metodo_pago IN ('efectivo', 'transferencia', 'tarjeta', 'qr', 'pasarela')),
    estado          VARCHAR(20)     NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'confirmado', 'rechazado', 'reembolsado')),
    transaccion_id  VARCHAR(100),
    gateway         VARCHAR(50),
    respuesta_gateway TEXT,
    postulacion_id  INTEGER         NOT NULL,
    postulante_id   INTEGER         NOT NULL,
    FOREIGN KEY (postulacion_id) REFERENCES postulacion(id) ON DELETE RESTRICT,
    FOREIGN KEY (postulante_id) REFERENCES postulante(id) ON DELETE RESTRICT
);

-- ============================================================
-- RINDE (notas de exámenes)
-- ============================================================

-- Tabla: rinde
-- Almacena las notas obtenidas por cada postulante en cada examen.
-- PK: id (SERIAL)
-- FK: postulacion_id -> postulacion(id) (CASCADE)
-- FK: examen_id -> examen(id) (RESTRICT)
-- UQ: (postulacion_id, examen_id) — un postulante no puede rendir el mismo examen dos veces.
-- nota: valor entre 0 y 100. Al insertar/actualizar, un trigger recalcula los promedios.
CREATE TABLE rinde (
    id              SERIAL          PRIMARY KEY,
    postulacion_id  INTEGER         NOT NULL,
    examen_id       INTEGER         NOT NULL,
    nota            DECIMAL(5,2)    NOT NULL CHECK (nota >= 0 AND nota <= 100),
    FOREIGN KEY (postulacion_id) REFERENCES postulacion(id) ON DELETE CASCADE,
    FOREIGN KEY (examen_id) REFERENCES examen(id) ON DELETE RESTRICT,
    UNIQUE (postulacion_id, examen_id)
);


-- ============================================================
-- ÍNDICES
-- ============================================================
-- Los siguientes índices optimizan las consultas más frecuentes
-- del sistema: búsquedas por código, estado, fechas, FK,
-- ordenamientos por promedio, etc.

CREATE INDEX idx_postulante_codigo ON postulante(codigo);
CREATE INDEX idx_docente_codigo ON docente(cod_docente);
CREATE INDEX idx_postulacion_estado ON postulacion(estado);
CREATE INDEX idx_postulacion_fecha ON postulacion(fecha);
CREATE INDEX idx_postulacion_postulante ON postulacion(postulante_id);
CREATE INDEX idx_postulacion_carrera ON postulacion(carrera_id);
CREATE INDEX idx_postulacion_primera_opcion ON postulacion(primera_opcion_id);
CREATE INDEX idx_postulacion_segunda_opcion ON postulacion(segunda_opcion_id);
CREATE INDEX idx_postulacion_asignada ON postulacion(carrera_asignada_id);
CREATE INDEX idx_postulacion_aprobado ON postulacion(aprobado);
CREATE INDEX idx_postulacion_promedio ON postulacion(promedio_general DESC);
CREATE INDEX idx_postulacion_turno ON postulacion(turno_id);
CREATE INDEX idx_postulacion_semestre ON postulacion(semestre_id);
CREATE INDEX idx_postulacion_admision ON postulacion(admision_id);
CREATE INDEX idx_postulacion_grupo_postulacion ON postulacion_grupo(postulacion_id);
CREATE INDEX idx_postulacion_grupo_grupo ON postulacion_grupo(grupo_id);
CREATE INDEX idx_pago_postulacion ON pago(postulacion_id);
CREATE INDEX idx_pago_postulante ON pago(postulante_id);
CREATE INDEX idx_rinde_postulacion ON rinde(postulacion_id);
CREATE INDEX idx_rinde_examen ON rinde(examen_id);
CREATE INDEX idx_examen_grupo ON examen(grupo_id);
CREATE INDEX idx_horario_grupo ON horario(grupo_id);
CREATE INDEX idx_horario_aula ON horario(aula_id);
CREATE INDEX idx_grupo_materia ON grupo(materia_id);
CREATE INDEX idx_grupo_docente ON grupo(docente_id);
CREATE INDEX idx_grupo_turno ON grupo(turno_id);
CREATE INDEX idx_usuario_persona ON usuario(persona_id);
CREATE INDEX idx_usuario_email ON usuario(email);

CREATE INDEX idx_postulante_requisito_postulante ON postulante_requisito(postulante_id);
CREATE INDEX idx_postulante_requisito_requisito ON postulante_requisito(requisito_id);
CREATE INDEX idx_postulante_requisito_cumplido ON postulante_requisito(cumplido);
CREATE INDEX idx_docente_contratado ON docente(contratado);
CREATE INDEX idx_grupo_docente_count ON grupo(docente_id);
CREATE INDEX idx_examen_porcentaje ON examen(porcentaje);
CREATE INDEX idx_pago_transaccion ON pago(transaccion_id);
CREATE INDEX idx_pago_gateway ON pago(gateway);
CREATE INDEX idx_postulante_requisitos ON postulante(requisitos_verificado);

-- ============================================================
-- FUNCIÓN: Calcular promedios de un postulante
-- ============================================================
-- Parámetros:
--   p_postulacion_id (INTEGER): ID de la postulación a calcular.
-- Retorna: tabla con:
--   promedio_matematicas, promedio_fisica, promedio_computacion,
--   promedio_ingles, promedio_general, todas_aprobadas (BOOLEAN).
-- Lógica:
--   1. Obtiene los pesos de cada materia desde la tabla materia.
--   2. Calcula el promedio ponderado de cada materia sumando
--      (nota * porcentaje_del_examen / 100) para sus 3 parciales.
--   3. Calcula el promedio general como suma ponderada de las 4 materias.
--   4. todas_aprobadas es TRUE si las 4 materias tienen promedio >= 60.

CREATE FUNCTION fn_calcular_promedios(p_postulacion_id INTEGER)
RETURNS TABLE (
    promedio_matematicas DECIMAL(4,2),
    promedio_fisica      DECIMAL(4,2),
    promedio_computacion DECIMAL(4,2),
    promedio_ingles      DECIMAL(4,2),
    promedio_general     DECIMAL(4,2),
    todas_aprobadas      BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH pesos AS (
        SELECT
            MAX(CASE WHEN codigo = 'MAT' THEN peso END) AS peso_mat,
            MAX(CASE WHEN codigo = 'FIS' THEN peso END) AS peso_fis,
            MAX(CASE WHEN codigo = 'COM' THEN peso END) AS peso_com,
            MAX(CASE WHEN codigo = 'ING' THEN peso END) AS peso_ing
        FROM materia
    ),
    promedios AS (
        SELECT
            ROUND(SUM(CASE WHEN ma.codigo = 'MAT' THEN r.nota * e.porcentaje / 100 END), 2) AS mat,
            ROUND(SUM(CASE WHEN ma.codigo = 'FIS' THEN r.nota * e.porcentaje / 100 END), 2) AS fis,
            ROUND(SUM(CASE WHEN ma.codigo = 'COM' THEN r.nota * e.porcentaje / 100 END), 2) AS com,
            ROUND(SUM(CASE WHEN ma.codigo = 'ING' THEN r.nota * e.porcentaje / 100 END), 2) AS ing
        FROM rinde r
        JOIN examen e ON e.id = r.examen_id
        JOIN grupo g ON g.id = e.grupo_id
        JOIN materia ma ON ma.id = g.materia_id
        WHERE r.postulacion_id = p_postulacion_id
    )
    SELECT
        p.mat,
        p.fis,
        p.com,
        p.ing,
        ROUND(
            COALESCE(p.mat, 0) * s.peso_mat / 100
            + COALESCE(p.fis, 0) * s.peso_fis / 100
            + COALESCE(p.com, 0) * s.peso_com / 100
            + COALESCE(p.ing, 0) * s.peso_ing / 100
        , 2),
        (COALESCE(p.mat, 0) >= 60 AND COALESCE(p.fis, 0) >= 60
         AND COALESCE(p.com, 0) >= 60 AND COALESCE(p.ing, 0) >= 60)
    FROM promedios p, pesos s;
END;
$$;

-- ============================================================
-- FUNCIÓN: Actualizar promedios en postulacion
-- ============================================================
-- Parámetros:
--   p_postulacion_id (INTEGER): ID de la postulación.
-- Retorna: VOID
-- Lógica:
--   Similar a fn_calcular_promedios pero en lugar de retornar los valores,
--   hace un UPDATE directo a la tabla postulacion con los nuevos promedios
--   y el campo aprobado (TRUE si todas las materias >= 60).

CREATE FUNCTION fn_actualizar_promedios_postulacion(p_postulacion_id INTEGER)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_mat DECIMAL(4,2);
    v_fis DECIMAL(4,2);
    v_com DECIMAL(4,2);
    v_ing DECIMAL(4,2);
    v_prom DECIMAL(4,2);
    v_aprobado BOOLEAN;
BEGIN
    SELECT
        ROUND(SUM(CASE WHEN ma.codigo = 'MAT' THEN r.nota * e.porcentaje / 100 END), 2),
        ROUND(SUM(CASE WHEN ma.codigo = 'FIS' THEN r.nota * e.porcentaje / 100 END), 2),
        ROUND(SUM(CASE WHEN ma.codigo = 'COM' THEN r.nota * e.porcentaje / 100 END), 2),
        ROUND(SUM(CASE WHEN ma.codigo = 'ING' THEN r.nota * e.porcentaje / 100 END), 2)
    INTO v_mat, v_fis, v_com, v_ing
    FROM rinde r
    JOIN examen e ON e.id = r.examen_id
    JOIN grupo g ON g.id = e.grupo_id
    JOIN materia ma ON ma.id = g.materia_id
    WHERE r.postulacion_id = p_postulacion_id;

    v_prom := ROUND(
        COALESCE(v_mat, 0) * (SELECT peso FROM materia WHERE codigo = 'MAT') / 100
        + COALESCE(v_fis, 0) * (SELECT peso FROM materia WHERE codigo = 'FIS') / 100
        + COALESCE(v_com, 0) * (SELECT peso FROM materia WHERE codigo = 'COM') / 100
        + COALESCE(v_ing, 0) * (SELECT peso FROM materia WHERE codigo = 'ING') / 100
    , 2);
    v_aprobado := (COALESCE(v_mat, 0) >= 60 AND COALESCE(v_fis, 0) >= 60
                   AND COALESCE(v_com, 0) >= 60 AND COALESCE(v_ing, 0) >= 60);

    UPDATE postulacion SET
        promedio_matematicas = ROUND(v_mat, 2),
        promedio_fisica = ROUND(v_fis, 2),
        promedio_computacion = ROUND(v_com, 2),
        promedio_ingles = ROUND(v_ing, 2),
        promedio_general = v_prom,
        aprobado = v_aprobado
    WHERE id = p_postulacion_id;
END;
$$;

-- ============================================================
-- TRIGGER: Actualizar promedios al insertar/actualizar notas
-- ============================================================
-- Función de trigger que se ejecuta después de INSERT, UPDATE o DELETE en rinde.
-- Lógica:
--   - Recalcula los promedios de la postulación afectada llamando
--     a fn_actualizar_promedios_postulacion().
--   - Si la postulación tiene una admisión asociada, reprocesa la
--     asignación de cupos llamando a sp_procesar_admision().
--   - Esto garantiza que los promedios y las admisiones estén
--     siempre sincronizados con las notas registradas.

CREATE FUNCTION trg_rinde_actualizar_promedios()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_admision_id INTEGER;
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM fn_actualizar_promedios_postulacion(OLD.postulacion_id);
        SELECT admision_id INTO v_admision_id FROM postulacion WHERE id = OLD.postulacion_id;
        IF v_admision_id IS NOT NULL THEN
            CALL sp_procesar_admision(v_admision_id, FALSE);
        END IF;
        RETURN OLD;
    END IF;

    PERFORM fn_actualizar_promedios_postulacion(NEW.postulacion_id);

    SELECT admision_id INTO v_admision_id FROM postulacion WHERE id = NEW.postulacion_id;
    IF v_admision_id IS NOT NULL THEN
        CALL sp_procesar_admision(v_admision_id, FALSE);
    END IF;

    RETURN NEW;
END;
$$;

-- Trigger: trg_after_rinde
-- Se dispara AFTER INSERT, UPDATE o DELETE en la tabla rinde.
-- Por cada fila afectada, ejecuta trg_rinde_actualizar_promedios()
-- para mantener actualizados los promedios y asignaciones de admisión.
CREATE TRIGGER trg_after_rinde
    AFTER INSERT OR UPDATE OR DELETE ON rinde
    FOR EACH ROW
    EXECUTE FUNCTION trg_rinde_actualizar_promedios();

-- ============================================================
-- PROCEDIMIENTO: Procesar admisión
-- ============================================================
-- Parámetros:
--   p_admision_id (INTEGER): ID del proceso de admisión a procesar.
--   p_finalizar (BOOLEAN, default TRUE): si TRUE, marca la admisión como 'finalizada'.
-- Lógica:
--   1. Reinicia las asignaciones previas (carrera_asignada_id = NULL,
--      estado = 'inscrito') para todos los postulantes aprobados.
--   2. Itera sobre los postulantes aprobados ordenados por promedio_general DESC.
--   3. Para cada postulante:
--      a. Intenta asignar a su primera opción si hay cupo disponible.
--      b. Si no hay cupo en 1ra opción, intenta con la 2da opción
--         (si el promedio supera la nota de corte actual de esa carrera).
--      c. Si ninguna opción tiene cupo, el postulante es rechazado.
--   4. Actualiza la nota_corte de cada carrera al promedio del último admitido.
--   5. Si p_finalizar es TRUE, cambia el estado de la admisión a 'finalizada'.

CREATE PROCEDURE sp_procesar_admision(
    p_admision_id INTEGER,
    p_finalizar BOOLEAN DEFAULT TRUE
)
LANGUAGE plpgsql
AS $$
DECLARE
    r RECORD;
    v_cupo_actual INTEGER;
    v_nota_corte DECIMAL(4,2);
    v_total_admitidos INTEGER := 0;
    v_total_rechazados INTEGER := 0;
BEGIN
    UPDATE postulacion
    SET carrera_asignada_id = NULL, estado = 'inscrito'
    WHERE admision_id = p_admision_id AND aprobado = TRUE;

    UPDATE carrera SET nota_corte = NULL;

    FOR r IN
        SELECT p.id, p.primera_opcion_id, p.segunda_opcion_id, p.promedio_general
        FROM postulacion p
        WHERE p.admision_id = p_admision_id AND p.aprobado = TRUE
        ORDER BY p.promedio_general DESC
    LOOP
        SELECT COUNT(*) INTO v_cupo_actual
        FROM postulacion
        WHERE admision_id = p_admision_id
          AND carrera_asignada_id = r.primera_opcion_id;

        IF v_cupo_actual < (SELECT cupo FROM carrera WHERE id = r.primera_opcion_id) THEN
            UPDATE postulacion
            SET carrera_asignada_id = r.primera_opcion_id, estado = 'admitido'
            WHERE id = r.id;

            UPDATE carrera SET nota_corte = r.promedio_general
            WHERE id = r.primera_opcion_id;

            v_total_admitidos := v_total_admitidos + 1;

        ELSIF r.segunda_opcion_id IS NOT NULL THEN
            SELECT nota_corte INTO v_nota_corte
            FROM carrera WHERE id = r.segunda_opcion_id;

            IF v_nota_corte IS NULL OR r.promedio_general > v_nota_corte THEN
                UPDATE postulacion
                SET carrera_asignada_id = r.segunda_opcion_id, estado = 'admitido'
                WHERE id = r.id;

                UPDATE carrera SET nota_corte = r.promedio_general
                WHERE id = r.segunda_opcion_id;

                v_total_admitidos := v_total_admitidos + 1;
            ELSE
                UPDATE postulacion SET estado = 'rechazado' WHERE id = r.id;
                v_total_rechazados := v_total_rechazados + 1;
            END IF;
        ELSE
            UPDATE postulacion SET estado = 'rechazado' WHERE id = r.id;
            v_total_rechazados := v_total_rechazados + 1;
        END IF;
    END LOOP;

    IF p_finalizar THEN
        UPDATE admision SET estado = 'finalizada' WHERE id = p_admision_id;
    END IF;

    RAISE NOTICE 'Admisión procesada: % admitidos, % rechazados',
                 v_total_admitidos, v_total_rechazados;
END;
$$;

-- ============================================================
-- PROCEDIMIENTO: Contratar docente (valida requisitos)
-- ============================================================
-- Parámetros:
--   p_docente_id (INTEGER): ID del docente a contratar.
-- Lógica:
--   1. Verifica que el docente cumpla los 3 requisitos:
--      es_profesional_area, tiene_maestria, tiene_diplomado_edu_sup.
--   2. Si alguno falta, lanza una excepción (RAISE EXCEPTION).
--   3. Si cumple todos, actualiza contratado = TRUE.

CREATE PROCEDURE sp_contratar_docente(
    p_docente_id INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_prof BOOLEAN;
    v_maestria BOOLEAN;
    v_diplomado BOOLEAN;
BEGIN
    SELECT es_profesional_area, tiene_maestria, tiene_diplomado_edu_sup
    INTO v_prof, v_maestria, v_diplomado
    FROM docente WHERE id = p_docente_id;

    IF NOT v_prof THEN
        RAISE EXCEPTION 'El docente debe ser profesional en el área';
    END IF;
    IF NOT v_maestria THEN
        RAISE EXCEPTION 'El docente debe tener maestría';
    END IF;
    IF NOT v_diplomado THEN
        RAISE EXCEPTION 'El docente debe tener diplomado en educación superior';
    END IF;

    UPDATE docente SET contratado = TRUE WHERE id = p_docente_id;
    RAISE NOTICE 'Docente % contratado exitosamente', p_docente_id;
END;
$$;

-- ============================================================
-- PROCEDIMIENTO: Generar grupos automáticamente
-- Calcula la cantidad de grupos según total de inscritos (max 70 por grupo)
-- ============================================================
-- Parámetros:
--   p_admision_id (INTEGER): ID de la admisión para la cual generar grupos.
-- Lógica:
--   1. Para cada combinación de materia x turno, cuenta los postulantes
--      inscritos (excluyendo cancelados).
--   2. Calcula cuántos grupos se necesitan: CEIL(inscritos / 70).
--   3. Selecciona aleatoriamente docentes contratados que aún no tengan
--      4 grupos asignados.
--   4. Crea los grupos con código único, nombre descriptivo, cupo=70,
--      y asigna docentes en round-robin.
--   5. Emite NOTICE con la cantidad de grupos creados por materia/turno.

CREATE PROCEDURE sp_generar_grupos(
    p_admision_id INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    r RECORD;
    v_total_inscritos INTEGER;
    v_grupos_necesarios INTEGER;
    v_grupo_actual INTEGER;
    v_letra CHAR(1);
    v_docentes_materia INTEGER[];
    v_doc_idx INTEGER;
    v_materia_id INTEGER;
    v_turno_id INTEGER;
    v_contador INTEGER;
BEGIN
    FOR r IN
        SELECT m.id AS materia_id, t.id AS turno_id, t.nombre AS turno_nombre,
               COUNT(p.id) AS inscritos
        FROM materia m
        CROSS JOIN turno t
        LEFT JOIN postulacion p ON p.turno_id = t.id
            AND p.admision_id = p_admision_id
            AND p.estado NOT IN ('cancelado')
        GROUP BY m.id, t.id, t.nombre
        ORDER BY m.id, t.id
    LOOP
        v_total_inscritos := r.inscritos;
        v_grupos_necesarios := CEIL(v_total_inscritos::NUMERIC / 70)::INTEGER;

        IF v_grupos_necesarios = 0 THEN
            CONTINUE;
        END IF;

        SELECT ARRAY(SELECT d.id FROM docente d
                      WHERE d.contratado = TRUE
                        AND d.id NOT IN (
                            SELECT g.docente_id FROM grupo g
                            GROUP BY g.docente_id
                            HAVING COUNT(*) >= 4
                        )
                      ORDER BY RANDOM())
        INTO v_docentes_materia;

        IF v_docentes_materia IS NULL OR array_length(v_docentes_materia, 1) = 0 THEN
            RAISE WARNING 'No hay docentes disponibles para materia % turno %',
                          r.materia_id, r.turno_id;
            CONTINUE;
        END IF;

        v_doc_idx := 1;
        FOR v_grupo_actual IN 1..v_grupos_necesarios LOOP
            v_letra := CHR(64 + v_grupo_actual);

            SELECT COALESCE(MAX(CAST(SUBSTRING(codigo FROM '[0-9]+$') AS INTEGER)), 0) + 1
            INTO v_contador
            FROM grupo;

            INSERT INTO grupo (codigo, nombre, cupo, materia_id, docente_id, turno_id)
            VALUES (
                'G' || v_contador || '-' || r.materia_id || '-' || r.turno_id || '-' || v_letra,
                'Grupo ' || v_letra || ' - Materia ' || r.materia_id || ' (' || r.turno_nombre || ')',
                70,
                r.materia_id,
                v_docentes_materia[1 + ((v_doc_idx - 1) % array_length(v_docentes_materia, 1))],
                r.turno_id
            );

            v_doc_idx := v_doc_idx + 1;
        END LOOP;

        RAISE NOTICE 'Materia % - Turno %: % grupos creados para % inscritos',
                     r.materia_id, r.turno_id, v_grupos_necesarios, v_total_inscritos;
    END LOOP;
END;
$$;

-- ============================================================
-- FUNCIÓN: Verificar cantidad de grupos de un docente
-- ============================================================
-- Parámetros:
--   p_docente_id (INTEGER): ID del docente.
-- Retorna: INTEGER — cantidad de grupos que tiene asignados el docente.
-- Uso: función auxiliar para validaciones antes de asignar más grupos.

CREATE FUNCTION fn_contar_grupos_docente(p_docente_id INTEGER)
RETURNS INTEGER
LANGUAGE SQL
AS $$
    SELECT COUNT(*)::INTEGER FROM grupo WHERE docente_id = p_docente_id;
$$;

-- ============================================================
-- TRIGGER: Validar que un docente no tenga más de 4 grupos
-- ============================================================
-- Función de trigger que se ejecuta BEFORE INSERT en grupo.
-- Lógica:
--   Cuenta cuántos grupos tiene ya el docente (NEW.docente_id).
--   Si ya tiene 4 o más, lanza una excepción y cancela la inserción.
--   Esto garantiza que ningún docente tenga más de 4 grupos.

CREATE FUNCTION trg_check_docente_grupos()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_total INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total FROM grupo WHERE docente_id = NEW.docente_id;
    IF v_total >= 4 THEN
        RAISE EXCEPTION 'El docente % ya tiene asignados 4 grupos (máximo permitido)', NEW.docente_id;
    END IF;
    RETURN NEW;
END;
$$;

-- Trigger: trg_before_insert_grupo
-- Se dispara BEFORE INSERT en la tabla grupo.
-- Por cada fila a insertar, ejecuta trg_check_docente_grupos()
-- para asegurar que el docente no exceda el límite de 4 grupos.
CREATE TRIGGER trg_before_insert_grupo
    BEFORE INSERT ON grupo
    FOR EACH ROW
    EXECUTE FUNCTION trg_check_docente_grupos();

-- ============================================================
-- FUNCIÓN: Reporte de admisión
-- ============================================================
-- Parámetros:
--   p_admision_id (INTEGER): ID de la admisión a reportar.
-- Retorna: tabla con carrera, cupo, asignados, vacantes,
--          promedio_min, promedio_max por carrera.
-- Lógica:
--   Para cada carrera, cuenta cuántos postulantes fueron admitidos
--   y calcula el promedio mínimo y máximo entre los admitidos.
--   Las vacantes se calculan como cupo - asignados.

CREATE FUNCTION fn_reporte_admision(p_admision_id INTEGER)
RETURNS TABLE (
    carrera         VARCHAR(200),
    cupo            INTEGER,
    asignados       BIGINT,
    vacantes        BIGINT,
    promedio_min    DECIMAL(4,2),
    promedio_max    DECIMAL(4,2)
)
LANGUAGE SQL
AS $$
    SELECT
        c.nombre,
        c.cupo,
        COUNT(p.id) AS asignados,
        c.cupo - COUNT(p.id) AS vacantes,
        MIN(p.promedio_general),
        MAX(p.promedio_general)
    FROM carrera c
    LEFT JOIN postulacion p ON p.carrera_asignada_id = c.id
        AND p.admision_id = p_admision_id AND p.estado = 'admitido'
    GROUP BY c.id, c.nombre, c.cupo
    ORDER BY c.id;
$$;

-- ============================================================
-- VISTAS
-- ============================================================

-- Vista: vw_resultados_admision
-- Muestra los resultados completos de la admisión: datos del postulante,
-- código, colegio, preferencias de carrera (1ra y 2da opción),
-- carrera finalmente asignada, turno, promedios por materia,
-- promedio general, estado académico (APROBADO/REPROBADO)
-- y estado de admisión (admitido/rechazado/etc.).
-- Útil para reportes generales y consulta de resultados.
CREATE VIEW vw_resultados_admision AS
SELECT
    per.ci,
    per.nombre || ' ' || per.apellido AS postulante,
    per.sexo,
    per.ciudad,
    pos.codigo AS codigo_postulante,
    pos.colegio_procedencia,
    c1.nombre AS primera_opcion,
    c2.nombre AS segunda_opcion,
    ca.nombre AS carrera_asignada,
    t.nombre AS turno,
    p.promedio_matematicas,
    p.promedio_fisica,
    p.promedio_computacion,
    p.promedio_ingles,
    p.promedio_general,
    CASE WHEN p.aprobado THEN 'APROBADO' ELSE 'REPROBADO' END AS estado_academico,
    p.estado AS estado_admision
FROM postulacion p
JOIN postulante pos ON pos.id = p.postulante_id
JOIN persona per ON per.id = pos.persona_id
JOIN carrera c1 ON c1.id = p.primera_opcion_id
LEFT JOIN carrera c2 ON c2.id = p.segunda_opcion_id
LEFT JOIN carrera ca ON ca.id = p.carrera_asignada_id
JOIN turno t ON t.id = p.turno_id;

-- Vista: vw_acta_notas
-- Muestra el acta de notas detallada: por cada examen rendido, muestra
-- el postulante, materia, grupo, turno, número de examen, porcentaje,
-- nota obtenida, nota ponderada (nota * % / 100) y resultado.
-- Útil para generar actas oficiales y revisar calificaciones.
CREATE VIEW vw_acta_notas AS
SELECT
    r.id AS rinde_id,
    per.ci,
    per.nombre || ' ' || per.apellido AS postulante,
    pos.codigo AS codigo_postulante,
    m.nombre AS materia,
    g.codigo AS grupo,
    t.nombre AS turno,
    e.nro AS examen,
    e.descripcion,
    e.porcentaje,
    r.nota,
    ROUND(r.nota * e.porcentaje / 100, 2) AS nota_ponderada,
    CASE WHEN r.nota >= 60 THEN 'APROBADO' ELSE 'REPROBADO' END AS resultado
FROM rinde r
JOIN postulacion p ON p.id = r.postulacion_id
JOIN postulante pos ON pos.id = p.postulante_id
JOIN persona per ON per.id = pos.persona_id
JOIN examen e ON e.id = r.examen_id
JOIN grupo g ON g.id = e.grupo_id
JOIN materia m ON m.id = g.materia_id
JOIN turno t ON t.id = g.turno_id;

-- ============================================================
-- VISTA: Estado de requisitos por postulante
-- ============================================================

-- Vista: vw_requisitos_postulante
-- Muestra el estado de cada requisito por postulante: CI, nombre,
-- código, nombre del requisito, si está cumplido, fecha de verificación,
-- y si todos los requisitos están verificados.
-- Útil para control documental y seguimiento de admisión.

CREATE VIEW vw_requisitos_postulante AS
SELECT
    per.ci,
    per.nombre || ' ' || per.apellido AS postulante,
    pos.codigo AS codigo_postulante,
    r.nombre AS requisito,
    pr.cumplido,
    pr.fecha_verificacion,
    pos.requisitos_verificado AS todos_verificados
FROM postulante pos
JOIN persona per ON per.id = pos.persona_id
LEFT JOIN postulante_requisito pr ON pr.postulante_id = pos.id
LEFT JOIN requisito r ON r.id = pr.requisito_id;

-- ============================================================
-- VISTA: Docentes contratados y asignación
-- ============================================================

-- Vista: vw_docentes_asignacion
-- Muestra información de cada docente: código, nombre, estado de
-- requisitos (profesional, maestría, diplomado), si está contratado,
-- cuántos grupos tiene asignados y cuántos grupos disponibles le quedan
-- (máximo 4 grupos por docente).
-- Útil para la gestión de asignación de docentes a grupos.

CREATE VIEW vw_docentes_asignacion AS
SELECT
    d.id AS docente_id,
    d.cod_docente,
    per.nombre || ' ' || per.apellido AS docente,
    d.es_profesional_area,
    d.tiene_maestria,
    d.tiene_diplomado_edu_sup,
    d.contratado,
    COUNT(g.id) AS grupos_asignados,
    4 - COUNT(g.id) AS grupos_disponibles
FROM docente d
JOIN persona per ON per.id = d.persona_id
LEFT JOIN grupo g ON g.docente_id = d.id
GROUP BY d.id, d.cod_docente, per.nombre, per.apellido,
         d.es_profesional_area, d.tiene_maestria,
         d.tiene_diplomado_edu_sup, d.contratado;

