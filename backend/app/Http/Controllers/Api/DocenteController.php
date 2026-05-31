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

class DocenteController extends Controller
{
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

    public function show($id): JsonResponse
    {
        $docente = Docente::with(['persona', 'grupos.materia', 'grupos.turno'])->find($id);

        if (!$docente) {
            return response()->json(['message' => 'Docente no encontrado.'], 404);
        }

        return response()->json($docente);
    }

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
