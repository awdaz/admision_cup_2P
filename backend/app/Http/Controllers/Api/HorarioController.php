<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\HorarioStoreRequest;
use App\Models\Horario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// Controlador para la gestión de horarios de grupos.
// Permite listar, crear, ver, actualizar y eliminar horarios.
class HorarioController extends Controller
{
    // Lista todos los horarios ordenados por día y hora de inicio.
    // Filtros opcionales (query string): grupo_id, dia.
    // Incluye relaciones: grupo, materia y aula.
    public function index(Request $request): JsonResponse
    {
        $query = Horario::with(['grupo.materia', 'aula'])
            ->orderBy('dia')
            ->orderBy('hora_inicio');

        // Filtro opcional por grupo
        if ($request->filled('grupo_id')) {
            $query->where('grupo_id', $request->grupo_id);
        }

        // Filtro opcional por día de la semana
        if ($request->filled('dia')) {
            $query->where('dia', $request->dia);
        }

        return response()->json($query->get());
    }

    // Crea un nuevo horario.
    // Parámetros: datos validados por HorarioStoreRequest.
    // Retorna el horario creado con código 201.
    public function store(HorarioStoreRequest $request): JsonResponse
    {
        $horario = Horario::create($request->validated());
        $horario->load(['grupo.materia', 'aula']);

        return response()->json($horario, 201);
    }

    // Muestra un horario específico por su ID.
    // Retorna 404 si no existe.
    public function show($id): JsonResponse
    {
        $horario = Horario::with(['grupo.materia', 'aula'])->find($id);

        if (!$horario) {
            return response()->json(['message' => 'Horario no encontrado.'], 404);
        }

        return response()->json($horario);
    }

    // Actualiza un horario existente.
    // Parámetros: ID del horario + datos validados.
    // Retorna 404 si no existe.
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

    // Elimina un horario por su ID.
    // Retorna 404 si no existe.
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
