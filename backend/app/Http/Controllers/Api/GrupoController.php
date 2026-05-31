<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\GrupoStoreRequest;
use App\Http\Requests\GrupoUpdateRequest;
use App\Models\Grupo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GrupoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Grupo::with(['materia', 'docente.persona', 'turno'])
            ->orderBy('codigo');

        if ($user->tipo === 'docente') {
            $docente = \App\Models\Docente::where('persona_id', $user->persona_id)->first();
            if ($docente) {
                $query->where('docente_id', $docente->id);
            } else {
                return response()->json(['data' => []]);
            }
        }

        if ($request->filled('materia_id')) {
            $query->where('materia_id', $request->materia_id);
        }

        if ($request->filled('turno_id')) {
            $query->where('turno_id', $request->turno_id);
        }

        return response()->json($query->paginate(15));
    }

    public function store(GrupoStoreRequest $request): JsonResponse
    {
        $grupo = Grupo::create($request->validated());
        $grupo->load(['materia', 'docente.persona', 'turno']);

        return response()->json($grupo, 201);
    }

    public function show($id): JsonResponse
    {
        $grupo = Grupo::with(['materia', 'docente.persona', 'turno', 'horarios.aula', 'examenes'])->find($id);

        if (!$grupo) {
            return response()->json(['message' => 'Grupo no encontrado.'], 404);
        }

        return response()->json($grupo);
    }

    public function update(GrupoUpdateRequest $request, $id): JsonResponse
    {
        $grupo = Grupo::find($id);

        if (!$grupo) {
            return response()->json(['message' => 'Grupo no encontrado.'], 404);
        }

        $grupo->update($request->validated());
        $grupo->load(['materia', 'docente.persona', 'turno']);

        return response()->json($grupo);
    }

    public function destroy($id): JsonResponse
    {
        $grupo = Grupo::find($id);

        if (!$grupo) {
            return response()->json(['message' => 'Grupo no encontrado.'], 404);
        }

        if ($grupo->examenes()->count() > 0) {
            return response()->json(['message' => 'No se puede eliminar: el grupo tiene exámenes registrados.'], 422);
        }

        $grupo->delete();

        return response()->json(['message' => 'Grupo eliminado correctamente.']);
    }
}
