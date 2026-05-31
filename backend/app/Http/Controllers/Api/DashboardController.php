<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pago;
use App\Models\Postulacion;
use App\Models\Postulante;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->tipo === 'postulante') {
            $postulante = Postulante::where('persona_id', $user->persona_id)->first();

            if (!$postulante) {
                return response()->json([
                    'total_postulantes' => 0,
                    'postulantes_verificados' => 0,
                    'pagos_pendientes' => 0,
                    'pagos_confirmados' => 0,
                    'postulaciones_inscritas' => 0,
                ]);
            }

            $requisitosVerificados = $postulante->requisitos_verificado;
            $pagosPendientes = Pago::where('postulante_id', $postulante->id)
                ->where('estado', 'pendiente')->count();
            $pagosConfirmados = Pago::where('postulante_id', $postulante->id)
                ->where('estado', 'confirmado')->count();
            $postulacionInscrita = Postulacion::where('postulante_id', $postulante->id)
                ->where('estado', 'inscrito')->count();

            return response()->json([
                'total_postulantes' => 1,
                'postulantes_verificados' => $requisitosVerificados ? 1 : 0,
                'pagos_pendientes' => $pagosPendientes,
                'pagos_confirmados' => $pagosConfirmados,
                'postulaciones_inscritas' => $postulacionInscrita,
                '_role' => 'postulante',
            ]);
        }

        $totalPostulantes = Postulante::count();
        $postulantesVerificados = Postulante::where('requisitos_verificado', true)->count();
        $pagosPendientes = Pago::where('estado', 'pendiente')->count();
        $pagosConfirmados = Pago::where('estado', 'confirmado')->count();
        $postulacionesInscritas = Postulacion::where('estado', 'inscrito')->count();

        return response()->json([
            'total_postulantes' => $totalPostulantes,
            'postulantes_verificados' => $postulantesVerificados,
            'pagos_pendientes' => $pagosPendientes,
            'pagos_confirmados' => $pagosConfirmados,
            'postulaciones_inscritas' => $postulacionesInscritas,
            '_role' => $user->tipo,
        ]);
    }
}
