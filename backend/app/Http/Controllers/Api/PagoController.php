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

class PagoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $pagos = Pago::with([
            'postulante.persona',
            'postulacion.carreraRel',
        ])->paginate(15);

        return response()->json($pagos);
    }

    public function store(PagoStoreRequest $request): JsonResponse
    {
        $postulante = Postulante::find($request->postulante_id);

        if (!$postulante) {
            return response()->json(['message' => 'Postulante no encontrado.'], 404);
        }

        // Verificar que todos los requisitos estén cumplidos
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

            // Generar número de recibo
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

    public function show($id): JsonResponse
    {
        $pago = Pago::with([
            'postulante.persona',
            'postulacion.carreraRel',
        ])->find($id);

        if (!$pago) {
            return response()->json(['message' => 'Pago no encontrado.'], 404);
        }

        return response()->json($pago);
    }

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
