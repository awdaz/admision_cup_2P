<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admision;
use App\Models\Carrera;
use App\Models\Postulacion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Casos de Uso: CU11 (Controlar cupos), CU12 (Asignar grupos)
class AdmisionProcesoController extends Controller
{
    public function procesar($admisionId): JsonResponse
    {
        $admision = Admision::find($admisionId);
        if (!$admision) {
            return response()->json(['message' => 'Admisión no encontrada.'], 404);
        }

        try {
            DB::select("CALL sp_procesar_admision(?, ?)", [$admisionId, true]);

            $resultados = Postulacion::with([
                'postulante.persona',
                'primeraOpcion',
                'segundaOpcion',
                'carreraAsignada',
            ])->where('admision_id', $admisionId)->get();

            $carreras = Carrera::withCount([
                'carreraAsignadaPostulacions as admitidos' => fn($q) => $q->where('admision_id', $admisionId)->where('estado', 'admitido'),
            ])->get();

            return response()->json([
                'message' => 'Admisión procesada correctamente.',
                'resultados' => $resultados,
                'carreras' => $carreras,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al procesar admisión.', 'error' => $e->getMessage()], 500);
        }
    }

    public function generarGrupos($admisionId): JsonResponse
    {
        $admision = Admision::find($admisionId);
        if (!$admision) {
            return response()->json(['message' => 'Admisión no encontrada.'], 404);
        }

        try {
            DB::select("CALL sp_generar_grupos(?)", [$admisionId]);

            $grupos = \App\Models\Grupo::with(['materia', 'docente.persona', 'turno'])
                ->orderBy('created_at', 'desc')
                ->take(50)
                ->get();

            return response()->json([
                'message' => 'Grupos generados correctamente.',
                'grupos' => $grupos,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al generar grupos.', 'error' => $e->getMessage()], 500);
        }
    }

    public function cupos($admisionId): JsonResponse
    {
        $admision = Admision::find($admisionId);
        if (!$admision) {
            return response()->json(['message' => 'Admisión no encontrada.'], 404);
        }

        $carreras = Carrera::select([
            'carrera.id', 'carrera.codigo', 'carrera.nombre', 'carrera.cupo',
        ])->selectRaw('COALESCE(admitidos.admitidos, 0) AS admitidos')
            ->selectRaw('carrera.cupo - COALESCE(admitidos.admitidos, 0) AS vacantes')
            ->leftJoin(DB::raw('(
                SELECT carrera_asignada_id, COUNT(*) AS admitidos
                FROM postulacion
                WHERE admision_id = ? AND estado = \'admitido\'
                GROUP BY carrera_asignada_id
            ) AS admitidos'), 'admitidos.carrera_asignada_id', '=', 'carrera.id')
            ->addBinding($admisionId, 'select')
            ->orderBy('carrera.id')
            ->get();

        $resumen = [
            'total_admitidos' => Postulacion::where('admision_id', $admisionId)->where('estado', 'admitido')->count(),
            'total_rechazados' => Postulacion::where('admision_id', $admisionId)->where('estado', 'rechazado')->count(),
            'total_inscritos' => Postulacion::where('admision_id', $admisionId)->where('estado', 'inscrito')->count(),
            'total_pendientes' => Postulacion::where('admision_id', $admisionId)->where('estado', 'pendiente')->count(),
        ];

        return response()->json([
            'resumen' => $resumen,
            'carreras' => $carreras,
        ]);
    }

    public function listarPostulantesCupo($admisionId): JsonResponse
    {
        $admision = Admision::find($admisionId);
        if (!$admision) {
            return response()->json(['message' => 'Admisión no encontrada.'], 404);
        }

        $postulantes = Postulacion::with([
            'postulante.persona',
            'primeraOpcion',
            'segundaOpcion',
            'carreraAsignada',
            'turno',
        ])->where('admision_id', $admisionId)
            ->whereIn('estado', ['inscrito', 'admitido', 'rechazado'])
            ->orderBy('promedio_general', 'desc')
            ->get();

        return response()->json($postulantes);
    }

    public function asignarGrupos($admisionId): JsonResponse
    {
        $admision = Admision::find($admisionId);
        if (!$admision) {
            return response()->json(['message' => 'Admisión no encontrada.'], 404);
        }

        try {
            DB::select("CALL sp_asignar_postulantes_grupos(?)", [$admisionId]);

            $asignaciones = \App\Models\PostulacionGrupo::with([
                'postulacion.postulante.persona',
                'grupo.materia',
            ])->whereHas('postulacion', fn($q) => $q->where('admision_id', $admisionId))
                ->get();

            return response()->json([
                'message' => 'Postulantes asignados a grupos correctamente.',
                'total' => $asignaciones->count(),
                'asignaciones' => $asignaciones,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al asignar grupos.', 'error' => $e->getMessage()], 500);
        }
    }
}
