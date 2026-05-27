<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Postulante;
use App\Models\PostulanteRequisito;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RequisitoController extends Controller
{
    public function index($postulanteId): JsonResponse
    {
        $postulante = Postulante::find($postulanteId);

        if (!$postulante) {
            return response()->json(['message' => 'Postulante no encontrado.'], 404);
        }

        $requisitos = PostulanteRequisito::with('requisito')
            ->where('postulante_id', $postulanteId)
            ->get()
            ->map(function ($pr) {
                return [
                    'id' => $pr->id,
                    'requisito_id' => $pr->requisito_id,
                    'nombre' => $pr->requisito->nombre,
                    'descripcion' => $pr->requisito->descripcion,
                    'cumplido' => $pr->cumplido,
                    'fecha_verificacion' => $pr->fecha_verificacion,
                ];
            });

        return response()->json($requisitos);
    }

    public function update(Request $request, $postulanteId): JsonResponse
    {
        $request->validate([
            'requisitos' => 'required|array',
            'requisitos.*.requisito_id' => 'required|exists:requisito,id',
            'requisitos.*.cumplido' => 'required|boolean',
        ]);

        $postulante = Postulante::find($postulanteId);

        if (!$postulante) {
            return response()->json(['message' => 'Postulante no encontrado.'], 404);
        }

        try {
            DB::beginTransaction();

            foreach ($request->requisitos as $item) {
                PostulanteRequisito::updateOrCreate(
                    [
                        'postulante_id' => $postulanteId,
                        'requisito_id' => $item['requisito_id'],
                    ],
                    [
                        'cumplido' => $item['cumplido'],
                        'fecha_verificacion' => $item['cumplido'] ? now() : null,
                    ]
                );
            }

            // Actualizar requisitos_verificado del postulante
            $total = PostulanteRequisito::where('postulante_id', $postulanteId)->count();
            $cumplidos = PostulanteRequisito::where('postulante_id', $postulanteId)
                ->where('cumplido', true)
                ->count();

            $postulante->requisitos_verificado = $total > 0 && $total === $cumplidos;
            $postulante->save();

            DB::commit();

            return response()->json(['message' => 'Requisitos actualizados correctamente.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al actualizar requisitos.', 'error' => $e->getMessage()], 500);
        }
    }
}
