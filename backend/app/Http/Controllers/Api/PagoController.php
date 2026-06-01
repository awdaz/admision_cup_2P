<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PagoStoreRequest;
use App\Models\Pago;
use App\Models\Postulacion;
use App\Models\Postulante;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Controlador de pagos — gestiona el registro, consulta y confirmación
// de pagos de postulantes en el sistema CUP-FICCT.
class PagoController extends Controller
{
    // Lista pagos paginados (15 por página) con relaciones postulante y postulación.
    // Autorización: si el usuario es 'postulante', solo ve sus propios pagos.
    // Retorna: JSON con datos paginados.
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $pagos = Pago::with([
            'postulante.persona',
            'postulacion.carreraRel',
        ]);

        if ($user->tipo === 'postulante') {
            $postulante = Postulante::where('persona_id', $user->persona_id)->first();
            if ($postulante) {
                $pagos->where('postulante_id', $postulante->id);
            } else {
                return response()->json(['data' => []]);
            }
        }

        return response()->json($pagos->paginate(15));
    }

    // Registra un nuevo pago para un postulante.
    // Parámetros: postulante_id, monto, metodo_pago, postulacion_id.
    // Regla de negocio: el postulante debe tener todos los requisitos cumplidos para poder pagar.
    // Genera automáticamente el número de recibo (REC-XXXXXX).
    // El pago se crea en estado 'pendiente'.
    // Retorna: JSON del pago creado (código 201) o error 404/422/500.
    public function store(PagoStoreRequest $request): JsonResponse
    {
        $postulante = Postulante::find($request->postulante_id);

        if (!$postulante) {
            return response()->json(['message' => 'Postulante no encontrado.'], 404);
        }

        $requisitosPendientes = DB::table('postulante_requisito')
            ->where('postulante_id', $postulante->id)
            ->where('cumplido', false)
            ->count();

        if ($requisitosPendientes > 0) {
            return response()->json([
                'message' => 'No se puede registrar el pago. El postulante tiene requisitos pendientes por cumplir.',
            ], 422);
        }

        try {
            DB::beginTransaction();

            $ultimoRecibo = Pago::max('id') ?? 0;
            $numeroRecibo = 'REC-' . str_pad($ultimoRecibo + 1, 6, '0', STR_PAD_LEFT);

            $pago = Pago::create([
                'numero_recibo' => $numeroRecibo,
                'monto' => $request->monto,
                'metodo_pago' => $request->metodo_pago,
                'estado' => 'pendiente',
                'postulacion_id' => $request->postulacion_id,
                'postulante_id' => $request->postulante_id,
            ]);

            DB::commit();

            $pago->load(['postulante.persona', 'postulacion.carreraRel']);

            return response()->json($pago, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al registrar el pago.', 'error' => $e->getMessage()], 500);
        }
    }

    // Muestra un pago específico con sus relaciones (postulante, postulación).
    // Parámetros: id del pago.
    // Autorización: si el usuario es 'postulante', solo ve sus propios pagos.
    // Retorna: JSON del pago o error 404/403.
    public function show($id, Request $request): JsonResponse
    {
        $user = $request->user();

        $pago = Pago::with([
            'postulante.persona',
            'postulacion.carreraRel',
        ])->find($id);

        if (!$pago) {
            return response()->json(['message' => 'Pago no encontrado.'], 404);
        }

        if ($user->tipo === 'postulante') {
            $postulante = Postulante::where('persona_id', $user->persona_id)->first();
            if (!$postulante || $pago->postulante_id !== $postulante->id) {
                return response()->json(['message' => 'No autorizado.'], 403);
            }
        }

        return response()->json($pago);
    }

    // Confirma un pago pendiente y actualiza el estado de la postulación a 'inscrito'.
    // Parámetros: id del pago.
    // Reglas de negocio:
    //   - No se puede confirmar un pago ya confirmado.
    //   - Al confirmar el pago, la postulación asociada pasa a estado 'inscrito'.
    // Retorna: JSON con mensaje y pago actualizado, o error 404/422/500.
    public function confirmar($id): JsonResponse
    {
        $pago = Pago::with('postulacion')->find($id);

        if (!$pago) {
            return response()->json(['message' => 'Pago no encontrado.'], 404);
        }

        if ($pago->estado === 'confirmado') {
            return response()->json(['message' => 'El pago ya ha sido confirmado anteriormente.'], 422);
        }

        try {
            DB::beginTransaction();

            $pago->estado = 'confirmado';
            $pago->save();

            if ($pago->postulacion) {
                $pago->postulacion->estado = 'inscrito';
                $pago->postulacion->save();
            }

            DB::commit();

            $pago->load(['postulante.persona', 'postulacion.carreraRel']);

            return response()->json([
                'message' => 'Pago confirmado correctamente.',
                'pago' => $pago,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al confirmar el pago.', 'error' => $e->getMessage()], 500);
        }
    }
}
