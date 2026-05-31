<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RindeStoreRequest;
use App\Models\Examen;
use App\Models\Postulacion;
use App\Models\Postulante;
use App\Models\Rinde;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RindeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Rinde::with([
            'postulacion.postulante.persona',
            'examen.grupo.materia',
        ]);

        if ($user->tipo === 'postulante') {
            $postulante = Postulante::where('persona_id', $user->persona_id)->first();
            if ($postulante) {
                $query->whereHas('postulacion', fn($q) => $q->where('postulante_id', $postulante->id));
            } else {
                return response()->json(['data' => []]);
            }
        }

        if ($request->filled('examen_id')) {
            $query->where('examen_id', $request->examen_id);
        }

        if ($request->filled('postulacion_id')) {
            $query->where('postulacion_id', $request->postulacion_id);
        }

        return response()->json($query->paginate(50));
    }

    public function store(RindeStoreRequest $request): JsonResponse
    {
        $user = request()->user();

        if ($user->tipo === 'docente') {
            $examen = Examen::with('grupo')->find($request->examen_id);
            if (!$examen) {
                return response()->json(['message' => 'Examen no encontrado.'], 404);
            }

            $docente = \App\Models\Docente::where('persona_id', $user->persona_id)->first();
            if (!$docente || $examen->grupo->docente_id !== $docente->id) {
                return response()->json(['message' => 'No autorizado: este examen no pertenece a tus grupos.'], 403);
            }
        }

        try {
            DB::beginTransaction();

            $rinde = Rinde::updateOrCreate(
                [
                    'postulacion_id' => $request->postulacion_id,
                    'examen_id' => $request->examen_id,
                ],
                ['nota' => $request->nota]
            );

            DB::commit();

            $rinde->load(['postulacion.postulante.persona', 'examen.grupo.materia']);

            return response()->json($rinde, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al registrar nota.', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id): JsonResponse
    {
        $rinde = Rinde::with([
            'postulacion.postulante.persona',
            'examen.grupo.materia',
        ])->find($id);

        if (!$rinde) {
            return response()->json(['message' => 'Registro de nota no encontrado.'], 404);
        }

        return response()->json($rinde);
    }

    public function destroy($id): JsonResponse
    {
        $rinde = Rinde::find($id);

        if (!$rinde) {
            return response()->json(['message' => 'Registro de nota no encontrado.'], 404);
        }

        $rinde->delete();

        return response()->json(['message' => 'Nota eliminada correctamente.']);
    }

    public function postulacion($postulacionId): JsonResponse
    {
        $rindes = Rinde::with(['examen.grupo.materia'])
            ->where('postulacion_id', $postulacionId)
            ->get();

        $postulacion = Postulacion::with([
            'postulante.persona',
            'primeraOpcion',
            'segundaOpcion',
            'carreraAsignada',
            'turno',
            'semestre',
        ])->find($postulacionId);

        return response()->json([
            'rindes' => $rindes,
            'postulacion' => $postulacion,
        ]);
    }
}
