<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PagoStoreRequest;
use App\Models\Pago;
use App\Models\Postulacion;
use App\Models\Postulante;
use App\Services\LibelulaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Controlador de pagos — gestiona el registro, consulta y confirmación
// de pagos de postulantes en el sistema CUP-FICCT.
// Caso de Uso: CU07 — Realizar pago
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

        if ($request->filled('estado')) {
            $pagos->where('estado', $request->estado);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $pagos->whereHas('postulante.persona', function ($q) use ($search) {
                $q->where('nombre', 'ilike', "%{$search}%")
                  ->orWhere('apellido', 'ilike', "%{$search}%");
            });
        }

        return response()->json($pagos->paginate(15));
    }

    // Registra un nuevo pago para un postulante.
    // Parámetros: postulante_id (admin), postulacion_id, monto, metodo_pago.
    // Si el usuario es postulante, postulante_id se resuelve automáticamente desde el token.
    // Regla de negocio: el postulante debe tener todos los requisitos cumplidos para poder pagar.
    // Genera automáticamente el número de recibo (REC-XXXXXX).
    // El pago se crea en estado 'pendiente'.
    // Retorna: JSON del pago creado (código 201) o error 404/422/500.
    public function store(PagoStoreRequest $request): JsonResponse
    {
        $user = $request->user();

        // Si es postulante, forzar su propio postulante_id
        if ($user->tipo === 'postulante') {
            $postulante = Postulante::where('persona_id', $user->persona_id)->first();
            if (!$postulante) {
                return response()->json(['message' => 'Perfil postulante no encontrado.'], 404);
            }
            $request->merge(['postulante_id' => $postulante->id]);

            // Validar que la postulación pertenezca al postulante
            $postulacion = Postulacion::where('id', $request->postulacion_id)
                ->where('postulante_id', $postulante->id)
                ->first();
            if (!$postulacion) {
                return response()->json(['message' => 'La postulación no pertenece al postulante.'], 422);
            }
        }

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

            if ($pago->postulacion) {
                try {
                    $this->asignarPostulanteAGrupos($pago->postulacion);
                } catch (\Exception $e) {
                    \Log::warning('Error al asignar grupos automáticamente: ' . $e->getMessage());
                }
            }

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

    // Crea un pago con monto fijo de 700 Bs via pasarela Libelula y devuelve la URL de redirección.
    // Parámetros: postulacion_id.
    // Retorna: JSON con pago_id y url_redireccion a Libelula.
    public function libelulaCheckout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->tipo !== 'postulante') {
            return response()->json(['message' => 'Solo postulantes pueden usar este método.'], 403);
        }

        $postulante = Postulante::where('persona_id', $user->persona_id)->first();
        if (!$postulante) {
            return response()->json(['message' => 'Perfil postulante no encontrado.'], 404);
        }

        $request->validate([
            'postulacion_id' => 'required|exists:postulacion,id',
        ]);

        $postulacion = Postulacion::where('id', $request->postulacion_id)
            ->where('postulante_id', $postulante->id)
            ->first();

        if (!$postulacion) {
            return response()->json(['message' => 'La postulación no pertenece al postulante.'], 422);
        }

        $requisitosPendientes = DB::table('postulante_requisito')
            ->where('postulante_id', $postulante->id)
            ->where('cumplido', false)
            ->count();

        if ($requisitosPendientes > 0) {
            return response()->json([
                'message' => 'No se puede registrar el pago. Tiene requisitos pendientes por cumplir.',
            ], 422);
        }

        $montoFijo = '700.00';

        $existePago = Pago::where('postulacion_id', $request->postulacion_id)
            ->where('gateway', 'libelula')
            ->whereIn('estado', ['pendiente', 'confirmado'])
            ->first();

        if ($existePago) {
            if ($existePago->estado === 'confirmado') {
                return response()->json(['message' => 'Esta postulación ya tiene un pago confirmado.'], 422);
            }

            $libelula = new LibelulaService();

            try {
                $resultado = $libelula->consultarDeuda((string) $existePago->id);
                $urlPago = $resultado['url_pago'] ?? $resultado['url'] ?? '';

                return response()->json([
                    'pago_id' => $existePago->id,
                    'url_redireccion' => $urlPago,
                    'message' => 'Ya existe un pago pendiente. Redirigiendo a Libelula.',
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'pago_id' => $existePago->id,
                    'url_redireccion' => '',
                    'message' => 'Ya existe un pago pendiente. Complete el pago en Libelula.',
                ]);
            }
        }

        try {
            DB::beginTransaction();

            $ultimoRecibo = Pago::max('id') ?? 0;
            $numeroRecibo = 'REC-' . str_pad($ultimoRecibo + 1, 6, '0', STR_PAD_LEFT);

            $pago = Pago::create([
                'numero_recibo' => $numeroRecibo,
                'monto' => $montoFijo,
                'metodo_pago' => 'pasarela',
                'estado' => 'pendiente',
                'gateway' => 'libelula',
                'postulacion_id' => $request->postulacion_id,
                'postulante_id' => $postulante->id,
            ]);

            $libelula = new LibelulaService();

            $resultado = $libelula->registrarDeuda(
                identificadorDeuda: (string) $pago->id,
                monto: $montoFijo,
                emailCliente: $user->email,
                nombreCliente: $postulante->persona->nombre ?? '',
                apellidoCliente: $postulante->persona->apellido ?? '',
                ci: $postulante->persona->ci ?? '',
                descripcion: 'Pago de postulación CUP-FICCT',
            );

            $pago->transaccion_id = $resultado['id_transaccion'] ?? null;
            $pago->respuesta_gateway = json_encode($resultado);
            $pago->save();

            DB::commit();

            $urlPago = $resultado['url_pago'] ?? $resultado['url'] ?? '';

            return response()->json([
                'pago_id' => $pago->id,
                'url_redireccion' => $urlPago,
                'message' => 'Redirigiendo a pasarela de pago Libelula.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al procesar el pago con Libelula.', 'error' => $e->getMessage()], 500);
        }
    }

    // Callback público de Libelula — actualiza el pago cuando se completa el pago.
    // Se invoca como POST desde Libelula al completar la transacción.
    public function libelulaCallback(Request $request): JsonResponse
    {
        $identificadorDeuda = $request->input('identificador_deuda');
        $idTransaccion = $request->input('id_transaccion');
        $estadoPago = $request->input('estado');

        if (!$identificadorDeuda) {
            return response()->json(['message' => 'Falta identificador_deuda.'], 422);
        }

        $pago = Pago::with('postulacion')->find($identificadorDeuda);

        if (!$pago) {
            return response()->json(['message' => 'Pago no encontrado.'], 404);
        }

        $pago->respuesta_gateway = json_encode($request->all());
        if ($idTransaccion) {
            $pago->transaccion_id = $idTransaccion;
        }

        if ($estadoPago === 'pagado' || $estadoPago === 'confirmado') {
            try {
                DB::beginTransaction();

                $pago->estado = 'confirmado';
                $pago->save();

                if ($pago->postulacion) {
                    $pago->postulacion->estado = 'inscrito';
                    $pago->postulacion->save();
                }

                DB::commit();

                if ($pago->postulacion) {
                    try {
                        $this->asignarPostulanteAGrupos($pago->postulacion);
                    } catch (\Exception $e) {
                        \Log::warning('Error al asignar grupos en callback: ' . $e->getMessage());
                    }
                }

                return response()->json(['message' => 'Pago confirmado correctamente.']);
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(['message' => 'Error al confirmar pago.', 'error' => $e->getMessage()], 500);
            }
        }

        $pago->save();

        return response()->json(['message' => 'Callback recibido, estado: ' . ($estadoPago ?? 'desconocido')]);
    }

    // Asigna un postulante a grupos aleatorios para las 4 materias al confirmar el pago.
    private function asignarPostulanteAGrupos(Postulacion $postulacion): void
    {
        $materias = [1, 2, 3, 4]; // MAT, FIS, COM, ING

        $existeMateria = function ($mid) use ($postulacion) {
            return DB::table('postulacion_grupo')
                ->where('postulacion_id', $postulacion->id)
                ->where('materia_id', $mid)->exists();
        };

        foreach ($materias as $materiaId) {
            if ($existeMateria($materiaId)) continue;

            // Buscar grupo con cupo disponible (menos asignados primero)
            $grupo = DB::selectOne("
                SELECT g.* FROM grupo g
                LEFT JOIN postulacion_grupo pg ON pg.grupo_id = g.id
                WHERE g.materia_id = ? AND g.turno_id = ?
                GROUP BY g.id, g.codigo, g.nombre, g.cupo, g.materia_id, g.docente_id, g.turno_id
                HAVING COUNT(pg.id) < g.cupo
                ORDER BY COUNT(pg.id) ASC
                LIMIT 1
            ", [$materiaId, $postulacion->turno_id]);

            if (!$grupo) {
                // Crear grupo nuevo
                $docente = DB::selectOne("
                    SELECT d.id FROM docente d
                    LEFT JOIN grupo g ON g.docente_id = d.id
                    WHERE d.contratado = true
                    GROUP BY d.id, d.persona_id, d.cod_docente, d.titulo, d.es_profesional_area,
                             d.tiene_maestria, d.tiene_diplomado_edu_sup, d.contratado, d.created_at
                    HAVING COUNT(g.id) < 4
                    ORDER BY RANDOM()
                    LIMIT 1
                ");

                if (!$docente) continue;

                $ultimoId = DB::table('grupo')->max('id') ?? 0;
                $codigo = 'G' . ($ultimoId + 1) . '-' . $materiaId . '-' . $postulacion->turno_id . '-A';

                $turno = DB::table('turno')->find($postulacion->turno_id);
                $materia = DB::table('materia')->find($materiaId);

                DB::table('grupo')->insert([
                    'codigo' => $codigo,
                    'nombre' => 'Grupo A - ' . ($materia->nombre ?? 'Materia ' . $materiaId) . ' (' . ($turno->nombre ?? '') . ')',
                    'cupo' => 70,
                    'materia_id' => $materiaId,
                    'docente_id' => $docente->id,
                    'turno_id' => $postulacion->turno_id,
                ]);

                $grupo = DB::table('grupo')->where('codigo', $codigo)->first();
            }

            try {
                DB::table('postulacion_grupo')->insert([
                    'postulacion_id' => $postulacion->id,
                    'grupo_id' => $grupo->id,
                    'materia_id' => $materiaId,
                ]);
            } catch (\Exception $e) {
                \Log::warning('Error al asignar postulacion ' . $postulacion->id . ' a grupo: ' . $e->getMessage());
            }
        }
    }
}
