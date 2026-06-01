<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DocenteStoreRequest;
use App\Http\Requests\DocenteUpdateRequest;
use App\Models\Docente;
use App\Models\Persona;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Controlador de docentes — gestiona el CRUD de docentes y su contratación
// en el sistema CUP-FICCT.
class DocenteController extends Controller
{
    // Lista docentes paginados (15 por página) con filtro opcional de búsqueda y estado contratado.
    // Parámetros opcionales: search (CI/nombre/apellido), contratado (boolean).
    // Retorna: JSON con datos paginados y relaciones persona y grupos.
    public function index(Request $request): JsonResponse
    {
        $query = Docente::with('persona', 'grupos.materia')
            ->orderBy('cod_docente');

        if ($search = $request->get('search')) {
            $query->whereHas('persona', function ($q) use ($search) {
                $q->where('ci', 'ilike', "%{$search}%")
                  ->orWhere('nombre', 'ilike', "%{$search}%")
                  ->orWhere('apellido', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('contratado')) {
            $query->where('contratado', $request->boolean('contratado'));
        }

        return response()->json($query->paginate(15));
    }

    // Crea un nuevo docente con sus datos personales en una transacción.
    // Parámetros: datos de persona + cod_docente, es_profesional_area, tiene_maestria, tiene_diplomado_edu_sup.
    // Regla de negocio: contratado se calcula automáticamente como true si las tres condiciones son true.
    // Retorna: JSON del docente creado (código 201) o error 500.
    public function store(DocenteStoreRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $persona = Persona::create($request->only([
                'ci', 'nombre', 'apellido', 'fecha_nac', 'sexo',
                'email', 'telefono', 'direccion', 'ciudad',
            ]));

            $docente = Docente::create([
                'persona_id' => $persona->id,
                'cod_docente' => $request->cod_docente,
                'es_profesional_area' => $request->boolean('es_profesional_area'),
                'tiene_maestria' => $request->boolean('tiene_maestria'),
                'tiene_diplomado_edu_sup' => $request->boolean('tiene_diplomado_edu_sup'),
                'contratado' => $request->boolean('es_profesional_area')
                    && $request->boolean('tiene_maestria')
                    && $request->boolean('tiene_diplomado_edu_sup'),
            ]);

            DB::commit();

            $docente->load('persona');

            return response()->json($docente, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al crear docente.', 'error' => $e->getMessage()], 500);
        }
    }

    // Muestra un docente específico con sus relaciones (persona, grupos con materia y turno).
    // Parámetros: id del docente.
    // Retorna: JSON con datos del docente o error 404.
    public function show($id): JsonResponse
    {
        $docente = Docente::with(['persona', 'grupos.materia', 'grupos.turno'])->find($id);

        if (!$docente) {
            return response()->json(['message' => 'Docente no encontrado.'], 404);
        }

        return response()->json($docente);
    }

    // Actualiza los datos de un docente y su persona asociada en una transacción.
    // Parámetros: id del docente + datos editables.
    // Si se envía 'contratado' explícitamente, usa ese valor; si no, lo recalcula automáticamente.
    // Retorna: JSON del docente actualizado o error 404/500.
    public function update(DocenteUpdateRequest $request, $id): JsonResponse
    {
        $docente = Docente::with('persona')->find($id);

        if (!$docente) {
            return response()->json(['message' => 'Docente no encontrado.'], 404);
        }

        try {
            DB::beginTransaction();

            $docente->persona->update($request->only([
                'ci', 'nombre', 'apellido', 'fecha_nac', 'sexo',
                'email', 'telefono', 'direccion', 'ciudad',
            ]));

            $datos = $request->only([
                'cod_docente', 'es_profesional_area',
                'tiene_maestria', 'tiene_diplomado_edu_sup',
            ]);

            if ($request->has('contratado')) {
                $datos['contratado'] = $request->boolean('contratado');
            } else {
                $datos['contratado'] = $request->boolean('es_profesional_area')
                    && $request->boolean('tiene_maestria')
                    && $request->boolean('tiene_diplomado_edu_sup');
            }

            $docente->update($datos);

            DB::commit();

            $docente->load('persona');

            return response()->json($docente);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al actualizar docente.', 'error' => $e->getMessage()], 500);
        }
    }

    // Elimina un docente y su persona asociada en una transacción.
    // Parámetros: id del docente.
    // Regla de negocio: no se puede eliminar si tiene grupos asignados.
    // Retorna: mensaje de confirmación o error 404/422/500.
    public function destroy($id): JsonResponse
    {
        $docente = Docente::find($id);

        if (!$docente) {
            return response()->json(['message' => 'Docente no encontrado.'], 404);
        }

        if ($docente->grupos()->count() > 0) {
            return response()->json(['message' => 'No se puede eliminar: el docente tiene grupos asignados.'], 422);
        }

        try {
            DB::beginTransaction();
            $personaId = $docente->persona_id;
            $docente->delete();
            Persona::find($personaId)?->delete();
            DB::commit();

            return response()->json(['message' => 'Docente eliminado correctamente.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al eliminar docente.', 'error' => $e->getMessage()], 500);
        }
    }

    // Cambia el estado de un docente a contratado manualmente.
    // Parámetros: id del docente.
    // Retorna: JSON con mensaje y datos del docente actualizado, o error 404.
    public function contratar($id): JsonResponse
    {
        $docente = Docente::find($id);

        if (!$docente) {
            return response()->json(['message' => 'Docente no encontrado.'], 404);
        }

        $docente->contratado = true;
        $docente->save();

        return response()->json(['message' => 'Docente contratado correctamente.', 'docente' => $docente->load('persona')]);
    }
}
