<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Carrera;
use App\Models\Docente;
use App\Models\Grupo;
use App\Models\Pago;
use App\Models\Postulacion;
use App\Models\Postulante;
use App\Models\Rinde;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReporteController extends Controller
{
    public function admision(Request $request): JsonResponse
    {
        $carreras = Carrera::withCount([
            'postulacions as total_postulaciones',
            'postulacions as inscritos' => fn($q) => $q->where('estado', 'inscrito'),
            'postulacions as admitidos' => fn($q) => $q->where('estado', 'admitido'),
        ])->get();

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
        ])->where('postulante_id', $postulante->id)->get();

        return response()->json([
            'postulante' => $postulante->load('persona'),
            'postulaciones' => $postulaciones,
        ]);
    }
}
