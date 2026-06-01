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

// Controlador para la gestión de notas (rindes) de postulantes en exámenes.
// Permite listar, registrar, consultar y eliminar notas.
// Incluye lógica de autorización para docentes y postulantes.
class RindeController extends Controller
{
    // Lista todas las notas con paginación (50 por página).
    // Filtros opcionales (query string): examen_id, postulacion_id.
    // Autorización: si es 'postulante', solo ve sus propias notas.
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Rinde::with([
            'postulacion.postulante.persona',
            'examen.grupo.materia',
        ]);

        // Restricción: postulantes solo ven sus propias notas
        if ($user->tipo === 'postulante') {
            $postulante = Postulante::where('persona_id', $user->persona_id)->first();
            if ($postulante) {
                $query->whereHas('postulacion', fn($q) => $q->where('postulante_id', $postulante->id));
            } else {
                return response()->json(['data' => []]);
            }
        }

        // Filtro opcional por examen
        if ($request->filled('examen_id')) {
            $query->where('examen_id', $request->examen_id);
        }

        // Filtro opcional por postulación
        if ($request->filled('postulacion_id')) {
            $query->where('postulacion_id', $request->postulacion_id);
        }

        return response()->json($query->paginate(50));
    }

    // Registra o actualiza la nota de un postulante en un examen.
    // Utiliza updateOrCreate para evitar duplicados (misma postulación + examen).
    // Autorización: si es 'docente', verifica que el examen pertenezca a sus grupos.
    // La operación se ejecuta dentro de una transacción para garantizar integridad.
    public function store(RindeStoreRequest $request): JsonResponse
    {
        $user = request()->user();

        // Validación: el docente solo puede calificar exámenes de sus grupos
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

            // Crea o actualiza la nota (evita duplicados por postulación + examen)
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

    // Muestra un registro de nota específico por su ID.
    // Incluye datos del postulante, persona, examen, grupo y materia.
    // Retorna 404 si no existe.
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

    // Elimina un registro de nota por su ID.
    // Retorna 404 si no existe.
    public function destroy($id): JsonResponse
    {
        $rinde = Rinde::find($id);

        if (!$rinde) {
            return response()->json(['message' => 'Registro de nota no encontrado.'], 404);
        }

        $rinde->delete();

        return response()->json(['message' => 'Nota eliminada correctamente.']);
    }

    // Obtiene todas las notas de una postulación específica junto con los datos completos de la postulación.
    // Parámetros: postulacionId (ruta).
    // Retorna las notas y la postulación con todas sus relaciones.
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
