<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pago;
use App\Models\Postulacion;
use App\Models\Postulante;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
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
        ]);
    }
}
