<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PostulanteStoreRequest;
use App\Http\Requests\PostulanteUpdateRequest;
use App\Models\Persona;
use App\Models\Postulante;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Controlador CRUD de postulantes — administra los perfiles de postulante
// con sus datos personales y postulaciones asociadas.
class PostulanteController extends Controller
{
    // Lista postulantes paginados (15 por página) con filtro opcional de búsqueda por CI/nombre/apellido.
    // Autorización: si el usuario es tipo 'postulante', solo ve su propio perfil.
    // Retorna: JSON con datos paginados; transforma la relación postulacions para incluir solo la primera.
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Postulante::select('postulante.*')
            ->with('persona', 'postulacions.carreraRel')
            ->join('persona', 'postulante.persona_id', '=', 'persona.id')
            ->orderBy('persona.ci');

        if ($user->tipo === 'postulante') {
            $postulante = Postulante::where('persona_id', $user->persona_id)->first();
            if (!$postulante) {
                return response()->json(['data' => [], 'message' => 'No tienes un perfil de postulante.']);
            }
            $query->where('postulante.id', $postulante->id);
        }

        if ($search = $request->get('search')) {
            $query->whereHas('persona', function ($q) use ($search) {
                $q->where('ci', 'ilike', "%{$search}%")
                  ->orWhere('nombre', 'ilike', "%{$search}%")
                  ->orWhere('apellido', 'ilike', "%{$search}%");
            });
        }

        $postulantes = $query->paginate(15);

        $postulantes->getCollection()->transform(function ($p) {
            $post = $p->postulacions->first();
            $p->unsetRelation('postulacions');
            if ($post) {
                $post->load('carreraRel');
                $p->setRelation('postulacion', $post);
            }
            return $p;
        });

        return response()->json($postulantes);
    }

    // Crea un nuevo postulante con sus datos personales en una transacción.
    // Parámetros: datos de persona (ci, nombre, apellido, etc.) y colegio_procedencia.
    // Genera automáticamente el código de postulante (POST-XXXXX).
    // Retorna: JSON del postulante creado con su relación persona (código 201).
    // En caso de error, revierte la transacción y retorna error 500.
    public function store(PostulanteStoreRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $persona = Persona::create($request->only([
                'ci', 'nombre', 'apellido', 'fecha_nac',
                'sexo', 'email', 'telefono', 'direccion', 'ciudad',
            ]));

            $postulante = Postulante::create([
                'persona_id' => $persona->id,
                'codigo' => 'POST-' . str_pad($persona->id, 5, '0', STR_PAD_LEFT),
                'colegio_procedencia' => $request->colegio_procedencia,
                'requisitos_verificado' => false,
            ]);

            DB::commit();

            $postulante->load('persona');

            return response()->json($postulante, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al crear postulante.', 'error' => $e->getMessage()], 500);
        }
    }

    // Muestra un postulante específico con sus relaciones (persona, postulacions).
    // Parámetros: id del postulante.
    // Autorización: si el usuario es 'postulante', solo puede ver su propio perfil.
    // Retorna: JSON con datos del postulante o error 404/403.
    public function show($id, Request $request): JsonResponse
    {
        $user = $request->user();
        $postulante = Postulante::with(['persona', 'postulacions'])->find($id);

        if (!$postulante) {
            return response()->json(['message' => 'Postulante no encontrado.'], 404);
        }

        if ($user->tipo === 'postulante') {
            $miPostulante = Postulante::where('persona_id', $user->persona_id)->first();
            if (!$miPostulante || $miPostulante->id !== (int) $id) {
                return response()->json(['message' => 'No autorizado para ver este postulante.'], 403);
            }
        }

        return response()->json($postulante);
    }

    // Actualiza los datos de un postulante y su persona asociada en una transacción.
    // Parámetros: id del postulante + datos editables de persona y colegio_procedencia.
    // Retorna: JSON del postulante actualizado con relación persona, o error 404/500.
    public function update(PostulanteUpdateRequest $request, $id): JsonResponse
    {
        $postulante = Postulante::with('persona')->find($id);

        if (!$postulante) {
            return response()->json(['message' => 'Postulante no encontrado.'], 404);
        }

        try {
            DB::beginTransaction();

            $postulante->persona->update($request->only([
                'ci', 'nombre', 'apellido', 'fecha_nac',
                'sexo', 'email', 'telefono', 'direccion', 'ciudad',
            ]));

            $postulante->update($request->only([
                'colegio_procedencia',
            ]));

            DB::commit();

            $postulante->load('persona');

            return response()->json($postulante);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al actualizar postulante.', 'error' => $e->getMessage()], 500);
        }
    }

    // Elimina un postulante y su persona asociada en una transacción.
    // Parámetros: id del postulante.
    // Retorna: mensaje de confirmación o error 404/500.
    // Primero elimina el postulante, luego la persona si existe.
    public function destroy($id): JsonResponse
    {
        $postulante = Postulante::find($id);

        if (!$postulante) {
            return response()->json(['message' => 'Postulante no encontrado.'], 404);
        }

        try {
            DB::beginTransaction();

            $personaId = $postulante->persona_id;
            $postulante->delete();
            Persona::find($personaId)?->delete();

            DB::commit();

            return response()->json(['message' => 'Postulante eliminado correctamente.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al eliminar postulante.', 'error' => $e->getMessage()], 500);
        }
    }

    // Busca un postulante por número de CI (cédula de identidad).
    // Parámetros: ci (string).
    // Retorna: JSON del postulante con relación persona, o error 404 si no existe.
    public function search($ci): JsonResponse
    {
        $persona = Persona::where('ci', $ci)->first();

        if (!$persona) {
            return response()->json(['message' => 'Postulante no encontrado con ese CI.'], 404);
        }

        $postulante = Postulante::with('persona')->where('persona_id', $persona->id)->first();

        if (!$postulante) {
            return response()->json(['message' => 'No existe un postulante registrado con ese CI.'], 404);
        }

        return response()->json($postulante);
    }
}
