<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\HorarioStoreRequest;
use App\Models\Horario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HorarioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Horario::with(['grupo.materia', 'aula'])
            ->orderBy('dia')
            ->orderBy('hora_inicio');

        if ($request->filled('grupo_id')) {
            $query->where('grupo_id', $request->grupo_id);
        }

        if ($request->filled('dia')) {
            $query->where('dia', $request->dia);
        }

        return response()->json($query->get());
    }

    public function store(HorarioStoreRequest $request): JsonResponse
    {
        $horario = Horario::create($request->validated());
        $horario->load(['grupo.materia', 'aula']);

        return response()->json($horario, 201);
    }

    public function show($id): JsonResponse
    {
        $horario = Horario::with(['grupo.materia', 'aula'])->find($id);

        if (!$horario) {
            return response()->json(['message' => 'Horario no encontrado.'], 404);
        }

        return response()->json($horario);
    }

    public function update(HorarioStoreRequest $request, $id): JsonResponse
    {
        $horario = Horario::find($id);

        if (!$horario) {
            return response()->json(['message' => 'Horario no encontrado.'], 404);
        }

        $horario->update($request->validated());
        $horario->load(['grupo.materia', 'aula']);

        return response()->json($horario);
    }

    public function destroy($id): JsonResponse
    {
        $horario = Horario::find($id);

        if (!$horario) {
            return response()->json(['message' => 'Horario no encontrado.'], 404);
        }

        $horario->delete();

        return response()->json(['message' => 'Horario eliminado correctamente.']);
    }
}
