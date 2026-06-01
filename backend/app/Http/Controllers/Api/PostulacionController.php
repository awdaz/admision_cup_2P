<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PostulacionStoreRequest;
use App\Models\Postulacion;
use App\Models\Postulante;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Controlador de postulaciones — gestiona las solicitudes de inscripción
// de postulantes a carreras en el sistema CUP-FICCT.
class PostulacionController extends Controller
{
    // Lista postulaciones paginadas (15 por página) con filtros opcionales (estado, admision_id, postulante_id).
    // Autorización: si el usuario es 'postulante', solo ve sus propias postulaciones.
    // Retorna: JSON con datos paginados y relaciones (postulante, opciones, turno, semestre, admisión).
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Postulacion::with([
            'postulante.persona',
            'primeraOpcion',
            'segundaOpcion',
            'turno',
            'semestre',
            'admision',
            'carreraAsignada',
        ])->orderBy('fecha', 'desc')->orderBy('hora', 'desc');

        if ($user->tipo === 'postulante') {
            $postulante = Postulante::where('persona_id', $user->persona_id)->first();
            if (!$postulante) {
                return response()->json(['data' => []]);
            }
            $query->where('postulante_id', $postulante->id);
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('admision_id')) {
            $query->where('admision_id', $request->admision_id);
        }

        if ($request->filled('postulante_id')) {
            $query->where('postulante_id', $request->postulante_id);
        }

        return response()->json($query->paginate(15));
    }

    // Crea una nueva postulación para un postulante.
    // Parámetros: postulante_id, admision_id, primera_opcion_id, segunda_opcion_id, turno_id, semestre_id.
    // Autorización: si el usuario es 'postulante', fuerza su propio postulante_id.
    // Reglas de negocio:
    //   - El postulante debe tener requisitos verificados.
    //   - No puede tener otra postulación activa en la misma admisión.
    // Retorna: JSON con la postulación creada (código 201) o error 403/404/422/500.
    public function store(PostulacionStoreRequest $request): JsonResponse
    {
        $user = request()->user();

        $postulanteId = $request->postulante_id;

        if ($user->tipo === 'postulante') {
            $miPostulante = Postulante::where('persona_id', $user->persona_id)->first();
            if (!$miPostulante) {
                return response()->json(['message' => 'No tienes un perfil de postulante.'], 403);
            }
            $postulanteId = $miPostulante->id;
        }

        $postulante = Postulante::with('postulacions')->find($postulanteId);

        if (!$postulante) {
            return response()->json(['message' => 'Postulante no encontrado.'], 404);
        }

        if (!$postulante->requisitos_verificado) {
            return response()->json([
                'message' => 'No puede postular sin haber verificado los requisitos.',
            ], 422);
        }

        $admisionId = $request->admision_id;
        $postulacionExistente = $postulante->postulacions()
            ->when($admisionId, fn($q) => $q->where('admision_id', $admisionId))
            ->first();

        if ($postulacionExistente) {
            return response()->json([
                'message' => 'El postulante ya tiene una postulación en esta admisión.',
            ], 422);
        }

        try {
            DB::beginTransaction();

            $postulacion = Postulacion::create([
                'estado' => 'pendiente',
                'fecha' => now()->toDateString(),
                'hora' => now()->toTimeString(),
                'postulante_id' => $postulante->id,
                'primera_opcion_id' => $request->primera_opcion_id,
                'segunda_opcion_id' => $request->segunda_opcion_id,
                'turno_id' => $request->turno_id,
                'semestre_id' => $request->semestre_id,
                'admision_id' => $admisionId,
            ]);

            DB::commit();

            $postulacion->load([
                'postulante.persona',
                'primeraOpcion',
                'segundaOpcion',
                'turno',
                'semestre',
                'admision',
            ]);

            return response()->json($postulacion, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al crear postulación.', 'error' => $e->getMessage()], 500);
        }
    }

    // Muestra una postulación específica con todas sus relaciones.
    // Parámetros: id de la postulación.
    // Autorización: si el usuario es 'postulante', solo ve su propia postulación.
    // Retorna: JSON con postulación y relaciones (pagos, grupos, rindes) o error 404/403.
    public function show($id, Request $request): JsonResponse
    {
        $user = $request->user();

        $postulacion = Postulacion::with([
            'postulante.persona',
            'primeraOpcion',
            'segundaOpcion',
            'turno',
            'semestre',
            'admision',
            'pagos',
            'postulacionGrupos.grupo.materia',
            'rindes.examen',
        ])->find($id);

        if (!$postulacion) {
            return response()->json(['message' => 'Postulación no encontrada.'], 404);
        }

        if ($user->tipo === 'postulante') {
            $postulante = Postulante::where('persona_id', $user->persona_id)->first();
            if (!$postulante || $postulacion->postulante_id !== $postulante->id) {
                return response()->json(['message' => 'No autorizado.'], 403);
            }
        }

        return response()->json($postulacion);
    }

    // Cancela una postulación cambiando su estado a 'cancelado'.
    // Parámetros: id de la postulación.
    // Autorización: si el usuario es 'postulante', solo puede cancelar su propia postulación.
    // Reglas de negocio:
    //   - No se puede cancelar si ya está cancelada.
    //   - No se puede cancelar si está en estado 'inscrito' o 'admitido'.
    // Retorna: JSON con mensaje y postulación actualizada, o error 404/403/422.
    public function cancelar($id, Request $request): JsonResponse
    {
        $user = $request->user();

        $postulacion = Postulacion::find($id);

        if (!$postulacion) {
            return response()->json(['message' => 'Postulación no encontrada.'], 404);
        }

        if ($user->tipo === 'postulante') {
            $postulante = Postulante::where('persona_id', $user->persona_id)->first();
            if (!$postulante || $postulacion->postulante_id !== $postulante->id) {
                return response()->json(['message' => 'No autorizado.'], 403);
            }
        }

        if ($postulacion->estado === 'cancelado') {
            return response()->json(['message' => 'La postulación ya está cancelada.'], 422);
        }

        if (in_array($postulacion->estado, ['inscrito', 'admitido'])) {
            return response()->json(['message' => 'No se puede cancelar una postulación en estado ' . $postulacion->estado . '.'], 422);
        }

        $postulacion->estado = 'cancelado';
        $postulacion->save();

        return response()->json(['message' => 'Postulación cancelada correctamente.', 'postulacion' => $postulacion]);
    }
}
