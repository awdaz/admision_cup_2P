-- ============================================================
-- DATOS DE EJEMPLO - CUP UAGRM
-- 4 carreras, 3 turnos, 4 materias, 30 postulantes a docente (16 contratados), 60 grupos, 1000 postulantes
-- ============================================================

-- Limpiar datos existentes (evita error de PK duplicado)
TRUNCATE TABLE rinde, pago, postulacion_grupo, postulacion, usuario,
            postulante, docente, persona, examen, horario, grupo,
            aula, materia, admision, semestre, turno, carrera,
            postulante_requisito, requisito
RESTART IDENTITY CASCADE;

-- ============================================================
-- TURNOS
-- ============================================================

INSERT INTO turno (nombre, modalidad) VALUES
('Mañana', 'presencial'),
('Tarde', 'presencial'),
('Noche', 'virtual');

-- ============================================================
-- CARRERAS
-- ============================================================

INSERT INTO carrera (codigo, nombre, cupo, nota_corte) VALUES
('ING-SIS', 'Ingeniería de Sistemas', 200, NULL),
('ING-INF', 'Ingeniería Informática', 150, NULL),
('ING-RED', 'Ingeniería en Redes y Telecomunicaciones', 100, NULL),
('ING-ROB', 'Ingeniería en Robótica', 50, NULL);

-- ============================================================
-- SEMESTRE Y ADMISION
-- ============================================================

INSERT INTO semestre (semestre, anio) VALUES ('1-2026', 2026);

INSERT INTO admision (nro, estado, fecha_inicio, fecha_fin, gestion, descripcion)
VALUES ('ADM-001-2026', 'activa', '2026-01-15', '2026-03-15', 2026,
        'Admisión ordinaria gestión 2026');

-- ============================================================
-- ADMINISTRADOR
-- ============================================================

INSERT INTO persona (ci, nombre, apellido, fecha_nac, sexo, email, telefono, direccion, ciudad)
VALUES ('1234567', 'Admin', 'Principal', '1990-01-01', 'Masculino', 'admin@cup.uagrm.edu.bo',
        '70000000', 'Oficina Central', 'Santa Cruz');

INSERT INTO usuario (username, email, password_hash, tipo, persona_id)
VALUES ('admin', 'admin@cup.uagrm.edu.bo', '$2y$10$0TcHweH8OatRchjoj5VRnuLQA98z8aGnnzJ8o5mcacNI38Ik/mjA2', 'admin', 1);

-- ============================================================
-- AULAS
-- ============================================================

INSERT INTO aula (nro, piso, capacidad) VALUES
('101',1,70),('102',1,70),('103',1,70),('104',1,70),
('201',2,70),('202',2,70),('203',2,70),('204',2,70),
('LAB-1',3,35),('LAB-2',3,35),('LAB-3',3,35),('LAB-4',3,35);

-- ============================================================
-- MATERIAS
-- ============================================================

INSERT INTO materia (codigo, nombre, peso, descripcion) VALUES
('MAT', 'Matemáticas', 30.00, 'Razonamiento lógico matemático y álgebra'),
('FIS', 'Física', 30.00, 'Conceptos fundamentales de física'),
('COM', 'Computación', 30.00, 'Introducción a la computación y algoritmos'),
('ING', 'Inglés', 10.00, 'Comprensión lectora y gramática básica del inglés');

INSERT INTO requisito (nombre, descripcion) VALUES
('Título Bachiller', 'Título de bachiller otorgado por unidad educativa reconocida'),
('Certificado de Nacimiento', 'Certificado de nacimiento original o computarizado'),
('Cédula de Identidad', 'Fotocopia de cédula de identidad vigente'),
('Fotografías', 'Tres fotografías 4x4 fondo azul'),
('Examen Médico', 'Certificado de aptitud médica');

-- ============================================================
-- DOCENTES (30 postulantes, solo contratados los que cumplen los 3 requisitos)
-- [nombre, apellido, username, codigo, prof, maestria, diplomado]
-- ============================================================

DO $$
DECLARE
    v_datos VARCHAR[][] := ARRAY[
        -- Matemáticas (8 postulantes, 4 contratados)
        ARRAY['Roberto','Méndez','roberto.mendez','DOC-MAT-01','true','true','true'],
        ARRAY['Carmen','Ríos','carmen.rios','DOC-MAT-02','true','false','true'],
        ARRAY['Pedro','Vargas','pedro.vargas','DOC-MAT-03','true','true','true'],
        ARRAY['Lucía','Torres','lucia.torres','DOC-MAT-04','true','false','false'],
        ARRAY['Marcos','Álvarez','marcos.alvarez','DOC-MAT-05','true','true','true'],
        ARRAY['Sofía','Cruz','sofia.cruz','DOC-MAT-06','true','true','true'],
        ARRAY['Javier','Roca','javier.roca','DOC-MAT-07','true','false','true'],
        ARRAY['Mónica','Díaz','monica.diaz','DOC-MAT-08','true','true','false'],
        -- Física (8 postulantes, 4 contratados)
        ARRAY['Alberto','Quispe','alberto.quispe','DOC-FIS-01','true','true','true'],
        ARRAY['Diana','Morales','diana.morales','DOC-FIS-02','true','false','false'],
        ARRAY['Jorge','Castillo','jorge.castillo','DOC-FIS-03','true','true','true'],
        ARRAY['Valeria','Ramos','valeria.ramos','DOC-FIS-04','true','false','true'],
        ARRAY['Héctor','Flores','hector.flores','DOC-FIS-05','true','true','true'],
        ARRAY['Gabriela','Peña','gabriela.pena','DOC-FIS-06','true','false','false'],
        ARRAY['Pablo','Cordero','pablo.cordero','DOC-FIS-07','true','true','true'],
        ARRAY['Liliana','Mamani','liliana.mamani','DOC-FIS-08','true','true','false'],
        -- Computación (7 postulantes, 4 contratados)
        ARRAY['Mariana','Soruco','mariana.soruco','DOC-COM-01','true','true','true'],
        ARRAY['Andrés','Navarro','andres.navarro','DOC-COM-02','true','false','true'],
        ARRAY['Patricia','Rivas','patricia.rivas','DOC-COM-03','true','true','true'],
        ARRAY['Fernando','Cabrera','fernando.cabrera','DOC-COM-04','true','true','true'],
        ARRAY['Laura','Medina','laura.medina','DOC-COM-05','true','true','true'],
        ARRAY['Cristian','Guerrero','cristian.guerrero','DOC-COM-06','true','false','false'],
        ARRAY['Tatiana','Vaca','tatiana.vaca','DOC-COM-07','true','false','true'],
        -- Inglés (7 postulantes, 3 contratados)
        ARRAY['Elena','García','elena.garcia','DOC-ING-01','true','false','true'],
        ARRAY['Ricardo','López','ricardo.lopez','DOC-ING-02','true','true','true'],
        ARRAY['Ana','Mendoza','ana.mendoza','DOC-ING-03','true','false','false'],
        ARRAY['Luis','Ortiz','luis.ortiz','DOC-ING-04','true','false','true'],
        ARRAY['Claudia','Silva','claudia.silva','DOC-ING-05','true','true','true'],
        ARRAY['Diego','Vega','diego.vega','DOC-ING-06','true','true','true'],
        ARRAY['Ruth','Paredes','ruth.paredes','DOC-ING-07','true','true','true']
    ];
    v_idx INTEGER;
    v_persona_id INTEGER;
    v_base_ci INTEGER := 2000001;
    v_femeninos VARCHAR[] := ARRAY['Méndez','Ríos','Torres','Cruz','Morales','Ramos','Peña','Soruco','Rivas','Medina','García','Mendoza','Ortiz','Silva','Díaz','Roca','Mamani','Vaca','Paredes'];
BEGIN
    FOR v_idx IN 1..30 LOOP
        INSERT INTO persona (ci, nombre, apellido, fecha_nac, sexo, email, telefono, direccion, ciudad)
        VALUES (
            LPAD((v_base_ci + v_idx - 1)::TEXT, 7, '0'),
            v_datos[v_idx][1], v_datos[v_idx][2],
            '1980-01-01'::DATE + ((v_idx - 1) * 90),
            CASE WHEN v_datos[v_idx][2] = ANY(v_femeninos) THEN 'Femenino' ELSE 'Masculino' END,
            v_datos[v_idx][3] || '@uagrm.edu.bo',
            '7' || LPAD((2000000 + v_idx)::TEXT, 7, '0'),
            'Calle Docente #' || v_idx,
            'Santa Cruz'
        ) RETURNING id INTO v_persona_id;

        INSERT INTO docente (persona_id, cod_docente,
            es_profesional_area, tiene_maestria, tiene_diplomado_edu_sup, contratado)
        VALUES (v_persona_id, v_datos[v_idx][4],
            v_datos[v_idx][5]::BOOLEAN,
            v_datos[v_idx][6]::BOOLEAN,
            v_datos[v_idx][7]::BOOLEAN,
            (v_datos[v_idx][5]::BOOLEAN AND v_datos[v_idx][6]::BOOLEAN AND v_datos[v_idx][7]::BOOLEAN));

        INSERT INTO usuario (username, email, password_hash, tipo, persona_id)
        VALUES (v_datos[v_idx][3], v_datos[v_idx][3] || '@uagrm.edu.bo', '$2y$10$ThmB1LDPv6Rbc4kzwM2j2Obu0.v2p9WS/3ostoCVQ4cRv4WezKt/K', 'docente', v_persona_id);
    END LOOP;
END $$;

-- ============================================================
-- GRUPOS (max 70 por grupo, solo docentes contratados)
-- Mañana: 400 est → ceil(400/70)=6 grupos/materia → 24 grupos
-- Tarde:  350 est → ceil(350/70)=5 grupos/materia → 20 grupos
-- Noche:  250 est → ceil(250/70)=4 grupos/materia → 16 grupos
-- Total: 60 grupos, 16 docentes contratados (~4 grupos c/u)
-- ============================================================

DO $$
DECLARE
    v_grupos_por_turno INTEGER[] := ARRAY[6, 5, 4];
    v_m RECORD;
    v_t RECORD;
    v_turno_idx INTEGER;
    v_seccion INTEGER;
    v_letra CHAR(1);
    v_docentes_materia INTEGER[];
    v_doc_idx INTEGER;
BEGIN
    FOR v_m IN SELECT * FROM materia ORDER BY id LOOP
        SELECT ARRAY(
            SELECT d.id FROM docente d
            WHERE d.contratado = TRUE
              AND d.cod_docente LIKE 'DOC-' || v_m.codigo || '-%'
            ORDER BY d.id
        ) INTO v_docentes_materia;

        IF v_docentes_materia IS NULL OR array_length(v_docentes_materia, 1) = 0 THEN
            CONTINUE;
        END IF;

        v_doc_idx := 1;
        v_turno_idx := 1;

        FOR v_t IN SELECT * FROM turno ORDER BY id LOOP
            FOR v_seccion IN 1..v_grupos_por_turno[v_turno_idx] LOOP
                v_letra := CHR(64 + v_seccion);
                INSERT INTO grupo (codigo, nombre, cupo, materia_id, docente_id, turno_id)
                VALUES (
                    v_m.codigo || '-' || v_t.id || '-' || v_letra,
                    'Grupo ' || v_letra || ' - ' || v_m.nombre || ' (' || v_t.nombre || ')',
                    70,
                    v_m.id,
                    v_docentes_materia[1 + ((v_doc_idx - 1) % array_length(v_docentes_materia, 1))],
                    v_t.id
                );
                v_doc_idx := v_doc_idx + 1;
            END LOOP;
            v_turno_idx := v_turno_idx + 1;
        END LOOP;
    END LOOP;
END $$;

-- ============================================================
-- EXAMENES (3 parciales por grupo)
-- ============================================================

DO $$
DECLARE
    v_g RECORD;
    v_fecha_base DATE;
    v_desc VARCHAR[];
BEGIN
    v_desc := ARRAY['1er Parcial', '2do Parcial', '3er Parcial'];
    FOR v_g IN SELECT id, materia_id FROM grupo ORDER BY id LOOP
        FOR i IN 1..3 LOOP
            v_fecha_base := CASE v_g.materia_id
                WHEN 1 THEN '2026-02-16' WHEN 2 THEN '2026-02-17'
                WHEN 3 THEN '2026-02-18' WHEN 4 THEN '2026-02-19'
            END;
            INSERT INTO examen (nro, descripcion, fecha, grupo_id, porcentaje)
            VALUES (
                'PAR-' || i || '-' || v_g.id,
                v_desc[i],
                v_fecha_base + (i - 1) * 21,
                v_g.id,
                CASE i WHEN 1 THEN 33.33 WHEN 2 THEN 33.33 WHEN 3 THEN 33.34 END
            );
        END LOOP;
    END LOOP;
END $$;

-- ============================================================
-- HORARIOS
-- ============================================================

DO $$
DECLARE
    v_g RECORD;
    v_hora_inicio TIME[];
    v_dias_manana VARCHAR[] := ARRAY['Lunes','Miercoles'];
    v_dias_tarde VARCHAR[] := ARRAY['Martes','Jueves'];
    v_dias_noche VARCHAR[] := ARRAY['Lunes','Miercoles','Viernes'];
    v_dias_actual VARCHAR[];
    v_dia VARCHAR;
    v_aula_id INTEGER;
BEGIN
    v_hora_inicio := ARRAY['07:30'::TIME, '14:00'::TIME, '19:00'::TIME];
    v_aula_id := 1;
    FOR v_g IN SELECT g.id, g.turno_id FROM grupo g ORDER BY g.id LOOP
        v_dias_actual := CASE v_g.turno_id
            WHEN 1 THEN v_dias_manana
            WHEN 2 THEN v_dias_tarde
            ELSE v_dias_noche
        END;
        FOREACH v_dia IN ARRAY v_dias_actual
        LOOP
            INSERT INTO horario (dia, hora_inicio, hora_fin, grupo_id, aula_id)
            VALUES (
                v_dia,
                v_hora_inicio[v_g.turno_id],
                v_hora_inicio[v_g.turno_id] + INTERVAL '1.5 hours',
                v_g.id,
                v_aula_id
            );
            v_aula_id := (v_aula_id % 12) + 1;
        END LOOP;
    END LOOP;
END $$;

-- ============================================================
-- 1000 POSTULANTES
-- ============================================================

ALTER TABLE rinde DISABLE TRIGGER trg_after_rinde;

DO $$
DECLARE
    v_i INTEGER;
    v_persona_id INTEGER;
    v_ci VARCHAR(20);
    v_nombre VARCHAR(100);
    v_apellido VARCHAR(100);
    v_email VARCHAR(200);
    v_codigo VARCHAR(50);
    v_postulante_id INTEGER;
    v_postulacion_id INTEGER;
    v_primera_opcion INTEGER;
    v_segunda_opcion INTEGER;
    v_turno_id INTEGER;
    v_turno_ids INTEGER[];
    v_random NUMERIC;
    v_id_sis INTEGER; v_id_inf INTEGER; v_id_red INTEGER; v_id_rob INTEGER;
    v_semestre_id INTEGER; v_admision_id INTEGER;
    v_examen RECORD;
    v_nota DECIMAL(5,2);
    v_materia_id INTEGER;
    v_grupo_id INTEGER;
    v_total INTEGER;
    v_nombres VARCHAR[] := ARRAY[
        'Carlos','Maria','Pedro','Ana','Luis','Sofia','Diego','Valentina','Juan','Gabriela',
        'Jose','Laura','Miguel','Camila','Andres','Isabella','David','Fernanda','Jorge','Lucia',
        'Daniel','Paula','Alejandro','Mariana','Pablo','Daniela','Sergio','Carolina','Javier','Andrea',
        'Manuel','Rosa','Fernando','Diana','Ricardo','Elena','Hugo','Silvia','Ivan','Patricia',
        'Oscar','Monica','Adrian','Claudia','Raul','Gloria','Enrique','Liliana','Cristian','Tatiana',
        'Eduardo','Veronica','Gustavo','Ruth','Mario','Julia','Victor','Nancy','Ruben','Sara'
    ];
    v_apellidos VARCHAR[] := ARRAY[
        'Garcia','Lopez','Mendoza','Rojas','Torrez','Vargas','Flores','Morales','Perez','Cruz',
        'Rodriguez','Martinez','Gonzalez','Alvarez','Quispe','Gutierrez','Fernandez','Diaz','Castillo','Ramos',
        'Romero','Ortiz','Silva','Torres','Chavez','Vega','Reyes','Cordova','Medina','Carrasco',
        'Aguilar','Navarro','Miranda','Delgado','Pena','Cabrera','Solis','Guerrero','Villalba','Campos',
        'Rivas','Caceres','Arias','Maldonado','Espinoza','Soria','Parra','Valencia','Ponce','Molina'
    ];
BEGIN
    SELECT id INTO v_id_sis FROM carrera WHERE codigo = 'ING-SIS';
    SELECT id INTO v_id_inf FROM carrera WHERE codigo = 'ING-INF';
    SELECT id INTO v_id_red FROM carrera WHERE codigo = 'ING-RED';
    SELECT id INTO v_id_rob FROM carrera WHERE codigo = 'ING-ROB';
    SELECT id INTO v_semestre_id FROM semestre LIMIT 1;
    SELECT id INTO v_admision_id FROM admision LIMIT 1;
    SELECT ARRAY(SELECT id FROM turno ORDER BY id) INTO v_turno_ids;

    CREATE TEMP TABLE _rr_grupo (
        materia_id INTEGER, turno_id INTEGER, grupo_id INTEGER, rn INTEGER
    );
    INSERT INTO _rr_grupo
    SELECT g.materia_id, g.turno_id, g.id,
           ROW_NUMBER() OVER (PARTITION BY g.materia_id, g.turno_id ORDER BY g.id)
    FROM grupo g;

    CREATE TEMP TABLE _rr_idx (
        materia_id INTEGER, turno_id INTEGER, next_rn INTEGER DEFAULT 1
    );
    INSERT INTO _rr_idx
    SELECT DISTINCT materia_id, turno_id, 1 FROM _rr_grupo;

    FOR v_i IN 1..1000 LOOP
        v_ci := LPAD((1000004 + v_i)::TEXT, 7, '0');
        v_nombre := v_nombres[1 + ((v_i - 1) % 60)];
        v_apellido := v_apellidos[1 + ((v_i - 1) % 50)];
        v_email := LOWER(v_nombre || '.' || v_apellido || v_i || '@email.com');
        v_codigo := 'POST-' || LPAD(v_i::TEXT, 4, '0');

        INSERT INTO persona (ci, nombre, apellido, fecha_nac, sexo, email, telefono, direccion, ciudad)
        VALUES (v_ci, v_nombre, v_apellido,
                '2005-01-01'::DATE + (v_i % 365),
                CASE WHEN (v_i % 2) = 0 THEN 'Masculino' ELSE 'Femenino' END,
                v_email,
                '7' || LPAD((1000000 + v_i)::TEXT, 7, '0'),
                'Av. ' || CHR(65 + (v_i % 26)) || ' #' || v_i,
                CASE (v_i % 5) WHEN 0 THEN 'Santa Cruz' WHEN 1 THEN 'La Paz'
                               WHEN 2 THEN 'Cochabamba' WHEN 3 THEN 'Beni'
                               ELSE 'Tarija' END)
        RETURNING id INTO v_persona_id;

        INSERT INTO postulante (persona_id, codigo, colegio_procedencia, requisitos_verificado)
        VALUES (v_persona_id, v_codigo,
                'Colegio ' || CHR(65 + (v_i % 26)) || ' N° ' || (1000 + v_i),
                TRUE)
        RETURNING id INTO v_postulante_id;

        -- Asignar requisitos cumplidos al postulante
        INSERT INTO postulante_requisito (postulante_id, requisito_id, cumplido, fecha_verificacion)
        SELECT v_postulante_id, id, TRUE, CURRENT_TIMESTAMP FROM requisito;

        INSERT INTO usuario (username, email, password_hash, tipo, persona_id)
        VALUES (LOWER(v_nombre || '.' || v_apellido || v_i), v_email, '$2y$10$8o6ixN6NrgpPD2m/oU9xbOv8SP4UGpueZrdPuGmc3BhxuYJog2L62', 'postulante', v_persona_id);

        -- Preferencias de carrera (SIS e INF más demandadas)
        v_random := RANDOM();
        IF v_random < 0.40 THEN
            v_primera_opcion := v_id_sis; v_segunda_opcion := v_id_inf;
        ELSIF v_random < 0.70 THEN
            v_primera_opcion := v_id_inf; v_segunda_opcion := v_id_sis;
        ELSIF v_random < 0.85 THEN
            v_primera_opcion := v_id_red; v_segunda_opcion := v_id_sis;
        ELSE
            v_primera_opcion := v_id_rob; v_segunda_opcion := v_id_inf;
        END IF;

        -- Turno: 40% mañana, 35% tarde, 25% noche
        v_random := RANDOM();
        IF v_random < 0.40 THEN
            v_turno_id := v_turno_ids[1];
        ELSIF v_random < 0.75 THEN
            v_turno_id := v_turno_ids[2];
        ELSE
            v_turno_id := v_turno_ids[3];
        END IF;

        INSERT INTO postulacion (
            estado, fecha, hora, postulante_id, carrera_id,
            primera_opcion_id, segunda_opcion_id,
            turno_id, semestre_id, admision_id
        ) VALUES (
            'inscrito', '2026-01-15'::DATE + (v_i % 30),
            '08:00:00'::TIME + (v_i % 480) * INTERVAL '1 minute',
            v_postulante_id, v_primera_opcion,
            v_primera_opcion, v_segunda_opcion,
            v_turno_id, v_semestre_id, v_admision_id
        ) RETURNING id INTO v_postulacion_id;

        -- Pago (con soporte de pasarela)
        INSERT INTO pago (numero_recibo, monto, metodo_pago, estado,
                          transaccion_id, gateway, respuesta_gateway,
                          postulacion_id, postulante_id)
        VALUES (
            'REC-' || LPAD(v_i::TEXT, 4, '0') || '-2026',
            350.00,
            CASE (v_i % 5) WHEN 0 THEN 'pasarela' WHEN 1 THEN 'efectivo'
                           WHEN 2 THEN 'qr' WHEN 3 THEN 'tarjeta'
                           ELSE 'transferencia' END,
            CASE WHEN v_i % 20 = 0 THEN 'pendiente' ELSE 'confirmado' END,
            CASE WHEN (v_i % 5) = 0 THEN 'TXN-' || LPAD(v_i::TEXT, 10, '0') ELSE NULL END,
            CASE WHEN (v_i % 5) = 0 THEN 'PagoFacil' ELSE NULL END,
            CASE WHEN (v_i % 5) = 0 THEN '{"status":"approved","code":"00"}' ELSE NULL END,
            v_postulacion_id, v_postulante_id
        );

        -- Asignar a 4 grupos (uno por materia) en el mismo turno
        -- Round-robin entre grupos de la misma materia+turno (max 60 c/u)
        FOR v_materia_id IN 1..4 LOOP
            SELECT grupo_id INTO v_grupo_id
            FROM _rr_idx i
            JOIN _rr_grupo g ON g.materia_id = i.materia_id
                             AND g.turno_id = i.turno_id
                             AND g.rn = i.next_rn
            WHERE i.materia_id = v_materia_id AND i.turno_id = v_turno_id;

            INSERT INTO postulacion_grupo (postulacion_id, grupo_id, materia_id)
            VALUES (v_postulacion_id, v_grupo_id, v_materia_id);

            -- Avanzar al siguiente grupo para esta materia+turno
            UPDATE _rr_idx
            SET next_rn = next_rn + 1
            WHERE materia_id = v_materia_id AND turno_id = v_turno_id;

            SELECT COUNT(*) INTO v_total FROM _rr_grupo
            WHERE materia_id = v_materia_id AND turno_id = v_turno_id;

            UPDATE _rr_idx
            SET next_rn = 1
            WHERE materia_id = v_materia_id
              AND turno_id = v_turno_id
              AND next_rn > v_total;
        END LOOP;

        -- Notas (12 exámenes: 3 por cada una de las 4 materias)
        FOR v_examen IN
            SELECT e.id, g.materia_id
            FROM postulacion_grupo pg
            JOIN grupo g ON g.id = pg.grupo_id
            JOIN examen e ON e.grupo_id = g.id
            WHERE pg.postulacion_id = v_postulacion_id
            ORDER BY g.materia_id, e.id
        LOOP
            v_random := RANDOM();
            IF v_random < 0.17 THEN
                v_nota := ROUND((20 + RANDOM() * 39)::numeric, 2);
            ELSIF v_random < 0.47 THEN
                v_nota := ROUND((60 + RANDOM() * 14)::numeric, 2);
            ELSIF v_random < 0.77 THEN
                v_nota := ROUND((75 + RANDOM() * 14)::numeric, 2);
            ELSE
                v_nota := ROUND((90 + RANDOM() * 10)::numeric, 2);
            END IF;

            INSERT INTO rinde (postulacion_id, examen_id, nota)
            VALUES (v_postulacion_id, v_examen.id, v_nota);
        END LOOP;
    END LOOP;

    DROP TABLE _rr_grupo;
    DROP TABLE _rr_idx;
END $$;

ALTER TABLE rinde ENABLE TRIGGER trg_after_rinde;

-- Recalcular promedios de todas las postulaciones
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM postulacion LOOP
        PERFORM fn_actualizar_promedios_postulacion(r.id);
    END LOOP;
END $$;

-- Procesar admisión con todos los datos ya cargados
CALL sp_procesar_admision(1);
