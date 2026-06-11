<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Carrera;
use App\Models\Docente;
use App\Models\Grupo;
use App\Models\Materia;
use App\Models\Pago;
use App\Models\Postulacion;
use App\Models\Postulante;
use App\Models\Rinde;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Controlador de reportes y estadísticas del sistema.
// Proporciona datos agregados de admisiones, grupos del docente y notas del postulante.
// Caso de Uso: CU14 — Generar reportes
class ReporteController extends Controller
{
    // Reporte general de admisión: estadísticas globales y desglose por carrera.
    // Incluye total de postulantes, postulaciones, inscritos, admitidos, pendientes y pagos.
    public function admision(Request $request): JsonResponse
    {
        // Conteo de postulaciones por carrera usando withCount
        $carreras = Carrera::withCount([
            'postulacions as total_postulaciones',
            'postulacions as inscritos' => fn($q) => $q->where('estado', 'inscrito'),
            'postulacions as admitidos' => fn($q) => $q->where('estado', 'admitido'),
        ])->get();

        // Resumen global del proceso de admisión
        $resumen = [
            'total_postulantes' => Postulante::count(),
            'total_postulaciones' => Postulacion::count(),
            'inscritos' => Postulacion::where('estado', 'inscrito')->count(),
            'admitidos' => Postulacion::where('estado', 'admitido')->count(),
            'pendientes' => Postulacion::where('estado', 'pendiente')->count(),
            'pagos_confirmados' => Pago::where('estado', 'confirmado')->sum('monto'),
            'pagos_pendientes' => Pago::where('estado', 'pendiente')->count(),
        ];

        return response()->json([
            'resumen' => $resumen,
            'por_carrera' => $carreras,
        ]);
    }

    // Reporte de grupos del docente autenticado.
    // Incluye datos del docente, sus grupos con estudiantes y exámenes.
    // Retorna estadísticas: total de grupos, estudiantes y exámenes.
    public function docenteMisGrupos(Request $request): JsonResponse
    {
        $user = $request->user();
        $docente = Docente::where('persona_id', $user->persona_id)->first();

        if (!$docente) {
            return response()->json(['message' => 'Perfil docente no encontrado.'], 404);
        }

        $grupos = Grupo::with([
            'materia',
            'turno',
            'postulacionGrupos.postulacion.postulante.persona',
            'examenes.rindes',
        ])->where('docente_id', $docente->id)->get();

        // Cálculo de métricas del docente
        $stats = [
            'total_grupos' => $grupos->count(),
            'total_estudiantes' => $grupos->sum(fn($g) => $g->postulacionGrupos->count()),
            'total_examenes' => $grupos->sum(fn($g) => $g->examenes->count()),
        ];

        return response()->json([
            'docente' => $docente->load('persona'),
            'grupos' => $grupos,
            'stats' => $stats,
        ]);
    }

    // Reporte de notas del postulante autenticado.
    // Retorna sus postulaciones con calificaciones (rindes), exámenes y pagos.
    public function postulanteMisNotas(Request $request): JsonResponse
    {
        $user = $request->user();
        $postulante = Postulante::where('persona_id', $user->persona_id)->first();

        if (!$postulante) {
            return response()->json(['message' => 'Perfil postulante no encontrado.'], 404);
        }

        $postulaciones = Postulacion::with([
            'primeraOpcion',
            'segundaOpcion',
            'carreraAsignada',
            'turno',
            'semestre',
            'rindes.examen.grupo.materia',
            'pagos',
            'postulacionGrupos.grupo.materia',
            'postulacionGrupos.grupo.turno',
        ])->where('postulante_id', $postulante->id)->get();

        return response()->json([
            'postulante' => $postulante->load('persona'),
            'postulaciones' => $postulaciones,
        ]);
    }

    // Estadísticas globales de promedios: promedio general, mínimo, máximo,
    // distribución por rango y cantidad de aprobados/reprobados.
    public function promediosGlobales(): JsonResponse
    {
        $stats = DB::select("
            SELECT
                COUNT(*) AS total_postulaciones,
                ROUND(AVG(promedio_general)::numeric, 2) AS promedio_general_avg,
                ROUND(MIN(promedio_general)::numeric, 2) AS promedio_general_min,
                ROUND(MAX(promedio_general)::numeric, 2) AS promedio_general_max,
                COUNT(CASE WHEN aprobado = true THEN 1 END) AS aprobados,
                COUNT(CASE WHEN aprobado = false THEN 1 END) AS reprobados,
                COUNT(CASE WHEN aprobado IS NULL THEN 1 END) AS sin_notas
            FROM postulacion
        ")[0];

        $rangos = DB::select("
            SELECT
                CASE
                    WHEN promedio_general < 60 THEN '0-59'
                    WHEN promedio_general < 70 THEN '60-69'
                    WHEN promedio_general < 80 THEN '70-79'
                    WHEN promedio_general < 90 THEN '80-89'
                    ELSE '90-100'
                END AS rango,
                COUNT(*) AS cantidad
            FROM postulacion
            WHERE promedio_general IS NOT NULL
            GROUP BY rango
            ORDER BY rango
        ");

        return response()->json([
            'stats' => $stats,
            'rangos' => $rangos,
        ]);
    }

    // Estadísticas por materia: promedio general, cantidad de aprobados/reprobados
    // de todas las postulaciones agrupadas por materia.
    public function estadisticasMaterias(): JsonResponse
    {
        $materias = DB::select("
            SELECT
                m.id,
                m.codigo,
                m.nombre,
                m.peso,
                COUNT(DISTINCT pg.postulacion_id) AS total_estudiantes,
                ROUND(AVG(p.promedio_general)::numeric, 2) AS promedio_general,
                COUNT(DISTINCT CASE WHEN p.aprobado = true THEN pg.postulacion_id END) AS aprobados,
                COUNT(DISTINCT CASE WHEN p.aprobado = false THEN pg.postulacion_id END) AS reprobados,
                COUNT(DISTINCT CASE WHEN p.aprobado IS NULL THEN pg.postulacion_id END) AS sin_notas
            FROM materia m
            LEFT JOIN postulacion_grupo pg ON pg.materia_id = m.id
            LEFT JOIN postulacion p ON p.id = pg.postulacion_id
            GROUP BY m.id
            ORDER BY m.id
        ");

        return response()->json($materias);
    }

    // Ranking de grupos por cantidad de postulantes aprobados.
    // Incluye total de estudiantes, aprobados, reprobados y % de aprobación.
    public function gruposRankingAprobados(): JsonResponse
    {
        $grupos = DB::select("
            SELECT
                g.id,
                g.codigo,
                g.nombre,
                g.cupo,
                m.nombre AS materia_nombre,
                CONCAT(per.nombre, ' ', per.apellido) AS docente_nombre,
                t.nombre AS turno_nombre,
                COUNT(pg.id) AS total_estudiantes,
                COUNT(CASE WHEN p.aprobado = true THEN 1 END) AS aprobados,
                COUNT(CASE WHEN p.aprobado = false OR p.aprobado IS NULL THEN 1 END) AS reprobados,
                CASE
                    WHEN COUNT(pg.id) > 0
                    THEN ROUND((COUNT(CASE WHEN p.aprobado = true THEN 1 END)::numeric / COUNT(pg.id)) * 100, 1)
                    ELSE 0
                END AS porcentaje_aprobacion
            FROM grupo g
            JOIN materia m ON m.id = g.materia_id
            JOIN docente d ON d.id = g.docente_id
            JOIN persona per ON per.id = d.persona_id
            JOIN turno t ON t.id = g.turno_id
            LEFT JOIN postulacion_grupo pg ON pg.grupo_id = g.id
            LEFT JOIN postulacion p ON p.id = pg.postulacion_id
            GROUP BY g.id, m.nombre, per.nombre, per.apellido, t.nombre
            ORDER BY aprobados DESC, porcentaje_aprobacion DESC
        ");

        return response()->json($grupos);
    }
}
