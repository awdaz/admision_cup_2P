-- ============================================================
-- CONSULTAS ÚTILES - CUP UAGRM
-- ============================================================

-- 1. Estadísticas generales
SELECT
    COUNT(*) AS total_postulantes,
    SUM(CASE WHEN aprobado THEN 1 ELSE 0 END) AS aprobados,
    SUM(CASE WHEN NOT aprobado THEN 1 ELSE 0 END) AS reprobados,
    ROUND(AVG(promedio_general), 2) AS promedio_gral,
    MIN(promedio_general) AS nota_min,
    MAX(promedio_general) AS nota_max
FROM postulacion WHERE admision_id = 1;

-- 2. Distribución por turno
SELECT
    t.nombre AS turno,
    t.modalidad,
    COUNT(p.id) AS postulantes
FROM postulacion p
JOIN turno t ON t.id = p.turno_id
WHERE p.admision_id = 1
GROUP BY t.nombre, t.modalidad
ORDER BY postulantes DESC;

-- 3. Preferencias (primera opción)
SELECT
    c.nombre AS carrera,
    COUNT(p.id) AS postulantes,
    ROUND(COUNT(p.id) * 100.0 / (SELECT COUNT(*) FROM postulacion WHERE admision_id = 1), 1) AS porcentaje
FROM postulacion p
JOIN carrera c ON c.id = p.primera_opcion_id
WHERE p.admision_id = 1
GROUP BY c.nombre
ORDER BY postulantes DESC;

-- 4. Reporte de admisión
SELECT * FROM fn_reporte_admision(1);

-- 5. Top 10 mejores promedios
SELECT
    per.nombre || ' ' || per.apellido AS postulante,
    c1.nombre AS primera_opcion,
    c2.nombre AS segunda_opcion,
    t.nombre AS turno,
    p.promedio_matematicas,
    p.promedio_fisica,
    p.promedio_computacion,
    p.promedio_ingles,
    p.promedio_general
FROM postulacion p
JOIN postulante pos ON pos.id = p.postulante_id
JOIN persona per ON per.id = pos.persona_id
JOIN carrera c1 ON c1.id = p.primera_opcion_id
LEFT JOIN carrera c2 ON c2.id = p.segunda_opcion_id
JOIN turno t ON t.id = p.turno_id
WHERE p.admision_id = 1 AND p.aprobado = TRUE
ORDER BY p.promedio_general DESC
LIMIT 10;

-- 6. Notas de un postulante
SELECT
    m.nombre AS materia,
    e.nro AS examen,
    e.descripcion,
    r.nota,
    CASE WHEN r.nota >= 60 THEN 'APROBADO' ELSE 'REPROBADO' END AS resultado
FROM rinde r
JOIN postulacion p ON p.id = r.postulacion_id
JOIN postulante pos ON pos.id = p.postulante_id
JOIN examen e ON e.id = r.examen_id
JOIN grupo g ON g.id = e.grupo_id
JOIN materia m ON m.id = g.materia_id
WHERE pos.codigo = 'POST-0001'
ORDER BY m.id, e.id;

-- 7. Admitidos por carrera
SELECT
    ca.nombre AS carrera_asignada,
    COUNT(*) AS admitidos,
    ca.cupo,
    ca.cupo - COUNT(*) AS vacantes
FROM postulacion p
JOIN carrera ca ON ca.id = p.carrera_asignada_id
WHERE p.admision_id = 1 AND p.estado = 'admitido'
GROUP BY ca.id, ca.nombre, ca.cupo
ORDER BY ca.id;

-- 8. Rechazados por falta de cupo
SELECT
    per.nombre || ' ' || per.apellido AS postulante,
    c1.nombre AS primera_opcion,
    c2.nombre AS segunda_opcion,
    p.promedio_general
FROM postulacion p
JOIN postulante pos ON pos.id = p.postulante_id
JOIN persona per ON per.id = pos.persona_id
JOIN carrera c1 ON c1.id = p.primera_opcion_id
LEFT JOIN carrera c2 ON c2.id = p.segunda_opcion_id
WHERE p.admision_id = 1 AND p.estado = 'rechazado'
ORDER BY p.promedio_general DESC;

-- 9. Nota de corte por carrera
SELECT
    c.nombre AS carrera,
    ROUND(AVG(p.promedio_general), 2) AS promedio_ingreso,
    MIN(p.promedio_general) AS nota_corte,
    MAX(p.promedio_general) AS nota_max
FROM postulacion p
JOIN carrera c ON c.id = p.carrera_asignada_id
WHERE p.admision_id = 1 AND p.estado = 'admitido'
GROUP BY c.nombre
ORDER BY promedio_ingreso DESC;

-- 10. Reprobaron alguna materia
SELECT
    per.nombre || ' ' || per.apellido AS postulante,
    p.promedio_matematicas,
    p.promedio_fisica,
    p.promedio_computacion,
    p.promedio_ingles,
    p.promedio_general
FROM postulacion p
JOIN postulante pos ON pos.id = p.postulante_id
JOIN persona per ON per.id = pos.persona_id
WHERE p.admision_id = 1 AND p.aprobado = FALSE
ORDER BY p.promedio_general DESC
LIMIT 20;

-- 11. Resultados completos
-- SELECT * FROM vw_resultados_admision ORDER BY promedio_general DESC;

-- 12. Notas con ponderación por porcentaje
SELECT
    per.nombre || ' ' || per.apellido AS postulante,
    m.nombre AS materia,
    e.descripcion,
    e.porcentaje,
    r.nota,
    ROUND(r.nota * e.porcentaje / 100, 2) AS nota_ponderada
FROM rinde r
JOIN postulacion p ON p.id = r.postulacion_id
JOIN postulante pos ON pos.id = p.postulante_id
JOIN persona per ON per.id = pos.persona_id
JOIN examen e ON e.id = r.examen_id
JOIN grupo g ON g.id = e.grupo_id
JOIN materia m ON m.id = g.materia_id
WHERE pos.codigo = 'POST-0001'
ORDER BY m.id, e.id;

-- 13. Materia con más reprobación
SELECT
    m.nombre AS materia,
    COUNT(*) AS total_examenes,
    ROUND(AVG(r.nota), 2) AS promedio,
    SUM(CASE WHEN r.nota < 60 THEN 1 ELSE 0 END) AS reprobados,
    ROUND(SUM(CASE WHEN r.nota < 60 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS pct_reprobacion
FROM rinde r
JOIN examen e ON e.id = r.examen_id
JOIN grupo g ON g.id = e.grupo_id
JOIN materia m ON m.id = g.materia_id
JOIN postulacion p ON p.id = r.postulacion_id
WHERE p.admision_id = 1
GROUP BY m.nombre
ORDER BY pct_reprobacion DESC;

-- 14. Docentes contratados y su asignación de grupos
SELECT * FROM vw_docentes_asignacion ORDER BY grupos_asignados DESC;

-- 15. Requisitos de postulantes
SELECT * FROM vw_requisitos_postulante WHERE codigo_postulante = 'POST-0001';

-- 16. Postulantes que NO cumplen requisitos
SELECT
    per.nombre || ' ' || per.apellido AS postulante,
    pos.codigo,
    r.nombre AS requisito_faltante
FROM postulante pos
JOIN persona per ON per.id = pos.persona_id
JOIN postulante_requisito pr ON pr.postulante_id = pos.id AND pr.cumplido = FALSE
JOIN requisito r ON r.id = pr.requisito_id
ORDER BY pos.codigo;

-- 17. Pagos realizados por pasarela
SELECT
    p.numero_recibo,
    p.monto,
    p.gateway,
    p.transaccion_id,
    p.estado,
    per.nombre || ' ' || per.apellido AS postulante
FROM pago p
JOIN postulante pos ON pos.id = p.postulante_id
JOIN persona per ON per.id = pos.persona_id
WHERE p.metodo_pago = 'pasarela'
ORDER BY p.id;

-- 18. Grupos disponibles por materia y turno
SELECT
    m.nombre AS materia,
    t.nombre AS turno,
    g.codigo AS grupo,
    g.cupo,
    COUNT(pg.id) AS inscritos,
    g.cupo - COUNT(pg.id) AS vacantes
FROM grupo g
JOIN materia m ON m.id = g.materia_id
JOIN turno t ON t.id = g.turno_id
LEFT JOIN postulacion_grupo pg ON pg.grupo_id = g.id
GROUP BY m.nombre, t.nombre, g.codigo, g.cupo
ORDER BY m.nombre, t.nombre;
