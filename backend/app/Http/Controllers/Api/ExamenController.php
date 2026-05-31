<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ExamenStoreRequest;
use App\Models\Examen;
use App\Models\Grupo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExamenController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Examen::with(['grupo.materia', 'grupo.docente.persona']);

        if ($request->filled('grupo_id')) {
            $query->where('grupo_id', $request->grupo_id);
        }

        if ($user->tipo === 'docente') {
            $docente = \App\Models\Docente::where('persona_id', $user->persona_id)->first();
            if ($docente) {
                $query->whereHas('grupo', fn($q) => $q->where('docente_id', $docente->id));
            } else {
                return response()->json(['data' => []]);
            }
        }

        return response()->json($query->orderBy('fecha')->paginate(15));
    }

    public function store(ExamenStoreRequest $request): JsonResponse
    {
        $examen = Examen::create($request->validated());
        $examen->load(['grupo.materia']);

        return response()->json($examen, 201);
    }

    public function show($id): JsonResponse
    {
        $examen = Examen::with(['grupo.materia', 'grupo.docente.persona'])->find($id);

        if (!$examen) {
            return response()->json(['message' => 'Examen no encontrado.'], 404);
        }

        return response()->json($examen);
    }

    public function update(ExamenStoreRequest $request, $id): JsonResponse
    {
        $examen = Examen::find($id);

        if (!$examen) {
            return response()->json(['message' => 'Examen no encontrado.'], 404);
        }

        $examen->update($request->validated());
        $examen->load(['grupo.materia']);

        return response()->json($examen);
    }

    public function destroy($id): JsonResponse
    {
        $examen = Examen::find($id);

        if (!$examen) {
            return response()->json(['message' => 'Examen no encontrado.'], 404);
        }

        $examen->delete();

        return response()->json(['message' => 'Examen eliminado correctamente.']);
    }

    public function rindes($id): JsonResponse
    {
        $examen = Examen::with([
            'rindes.postulacion.postulante.persona',
        ])->find($id);

        if (!$examen) {
            return response()->json(['message' => 'Examen no encontrado.'], 404);
        }

        return response()->json($examen);
    }
}
