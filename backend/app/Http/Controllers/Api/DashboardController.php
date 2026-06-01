<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pago;
use App\Models\Postulacion;
use App\Models\Postulante;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// Controlador para el dashboard con estadísticas generales.
// Muestra métricas de postulantes, pagos y postulaciones según el rol del usuario.
class DashboardController extends Controller
{
    // Devuelve estadísticas del dashboard.
    // Si el usuario es 'postulante', retorna solo sus datos personales.
    // Si es admin/docente, retorna totales globales del sistema.
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        // Vista personalizada para postulantes: solo sus propias métricas
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

            // Métricas individuales del postulante
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

        // Vista global para roles administrativos (admin, docente)
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
