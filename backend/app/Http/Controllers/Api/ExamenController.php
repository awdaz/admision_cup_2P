<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ExamenStoreRequest;
use App\Models\Examen;
use App\Models\Grupo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// Controlador para la gestión de exámenes.
// Proporciona operaciones CRUD y consulta de notas asociadas a cada examen.
class ExamenController extends Controller
{
    // Lista todos los exámenes con paginación (15 por página).
    // Parámetros opcionales (query string): grupo_id para filtrar por grupo.
    // Autorización: si el usuario es 'docente', solo muestra exámenes de sus grupos.
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Examen::with(['grupo.materia', 'grupo.docente.persona']);

        // Filtro opcional por grupo
        if ($request->filled('grupo_id')) {
            $query->where('grupo_id', $request->grupo_id);
        }

        // Restricción: los docentes solo ven exámenes de sus propios grupos
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

    // Crea un nuevo examen.
    // Parámetros: datos validados por ExamenStoreRequest.
    // Retorna el examen creado con código 201.
    public function store(ExamenStoreRequest $request): JsonResponse
    {
        $examen = Examen::create($request->validated());
        $examen->load(['grupo.materia']);

        return response()->json($examen, 201);
    }

    // Muestra un examen específico por su ID.
    // Incluye relaciones: grupo, materia y docente.
    // Retorna 404 si el examen no existe.
    public function show($id): JsonResponse
    {
        $examen = Examen::with(['grupo.materia', 'grupo.docente.persona'])->find($id);

        if (!$examen) {
            return response()->json(['message' => 'Examen no encontrado.'], 404);
        }

        return response()->json($examen);
    }

    // Actualiza un examen existente.
    // Parámetros: ID del examen + datos validados.
    // Retorna 404 si no existe.
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

    // Elimina un examen por su ID.
    // Retorna 404 si no existe.
    public function destroy($id): JsonResponse
    {
        $examen = Examen::find($id);

        if (!$examen) {
            return response()->json(['message' => 'Examen no encontrado.'], 404);
        }

        $examen->delete();

        return response()->json(['message' => 'Examen eliminado correctamente.']);
    }

    // Obtiene las notas (rindes) asociadas a un examen específico.
    // Incluye datos del postulante y su persona.
    // Retorna 404 si el examen no existe.
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
