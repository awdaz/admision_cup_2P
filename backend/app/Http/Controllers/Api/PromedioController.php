<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Postulacion;
use App\Models\Postulante;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PromedioController extends Controller
{
    public function show($postulacionId): JsonResponse
    {
        $user = request()->user();

        $postulacion = Postulacion::with([
            'postulante.persona',
            'primeraOpcion',
            'segundaOpcion',
            'carreraAsignada',
            'turno',
            'semestre',
        ])->find($postulacionId);

        if (!$postulacion) {
            return response()->json(['message' => 'Postulación no encontrada.'], 404);
        }

        if ($user->tipo === 'postulante') {
            $postulante = Postulante::where('persona_id', $user->persona_id)->first();
            if (!$postulante || $postulacion->postulante_id !== $postulante->id) {
                return response()->json(['message' => 'No autorizado.'], 403);
            }
        }

        $promedios = DB::select("SELECT * FROM fn_calcular_promedios(?)", [$postulacionId]);

        $detalle = DB::select("
            SELECT
                m.nombre AS materia,
                m.codigo AS materia_codigo,
                m.peso,
                e.nro AS examen_nro,
                e.porcentaje AS examen_porcentaje,
                r.nota,
                ROUND(r.nota * e.porcentaje / 100, 2) AS nota_ponderada
            FROM rinde r
            JOIN examen e ON e.id = r.examen_id
            JOIN grupo g ON g.id = e.grupo_id
            JOIN materia m ON m.id = g.materia_id
            WHERE r.postulacion_id = ?
            ORDER BY m.id, e.nro
        ", [$postulacionId]);

        return response()->json([
            'postulacion' => $postulacion,
            'promedios' => $promedios[0] ?? null,
            'detalle' => $detalle,
        ]);
    }

    public function recalcular($postulacionId): JsonResponse
    {
        $postulacion = Postulacion::find($postulacionId);
        if (!$postulacion) {
            return response()->json(['message' => 'Postulación no encontrada.'], 404);
        }

        try {
            DB::select("SELECT fn_actualizar_promedios_postulacion(?)", [$postulacionId]);

            $promedios = DB::select("SELECT * FROM fn_calcular_promedios(?)", [$postulacionId]);

            return response()->json([
                'message' => 'Promedios recalculados correctamente.',
                'promedios' => $promedios[0] ?? null,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al recalcular promedios.', 'error' => $e->getMessage()], 500);
        }
    }
}
