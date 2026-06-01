<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\GrupoStoreRequest;
use App\Http\Requests\GrupoUpdateRequest;
use App\Models\Grupo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// Controlador de grupos — gestiona el CRUD de grupos académicos
// con materia, docente y turno en el sistema CUP-FICCT.
class GrupoController extends Controller
{
    // Lista grupos paginados (15 por página) con filtros opcionales (materia_id, turno_id).
    // Autorización: si el usuario es tipo 'docente', solo ve sus propios grupos.
    // Retorna: JSON con datos paginados y relaciones (materia, docente.persona, turno).
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

    // Crea un nuevo grupo académico.
    // Parámetros: datos validados por GrupoStoreRequest (código, materia_id, docente_id, turno_id, etc.).
    // Retorna: JSON del grupo creado (código 201) con relaciones cargadas.
    public function store(GrupoStoreRequest $request): JsonResponse
    {
        $grupo = Grupo::create($request->validated());
        $grupo->load(['materia', 'docente.persona', 'turno']);

        return response()->json($grupo, 201);
    }

    // Muestra un grupo específico con todas sus relaciones.
    // Parámetros: id del grupo.
    // Retorna: JSON con datos del grupo y relaciones (materia, docente, turno, horarios, examenes) o error 404.
    public function show($id): JsonResponse
    {
        $grupo = Grupo::with(['materia', 'docente.persona', 'turno', 'horarios.aula', 'examenes'])->find($id);

        if (!$grupo) {
            return response()->json(['message' => 'Grupo no encontrado.'], 404);
        }

        return response()->json($grupo);
    }

    // Actualiza los datos de un grupo académico.
    // Parámetros: id del grupo + datos validados por GrupoUpdateRequest.
    // Retorna: JSON del grupo actualizado con relaciones, o error 404.
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

    // Elimina un grupo académico.
    // Parámetros: id del grupo.
    // Regla de negocio: no se puede eliminar si tiene exámenes registrados.
    // Retorna: mensaje de confirmación o error 404/422.
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
