<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdateRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

// Controlador para la administración de usuarios del sistema.
// Proporciona CRUD de usuarios, activación/desactivación y cambio de contraseña.
class UserController extends Controller
{
    // Lista todos los usuarios paginados (15 por página) con su relación 'persona'.
    // Búsqueda opcional (query string 'search'): filtra por username, email, nombre o apellido (ILIKE).
    // Filtro opcional (query string 'tipo'): filtra por rol (admin, docente, postulante).
    public function index(Request $request): JsonResponse
    {
        $query = User::with('persona')->orderBy('username');

        // Búsqueda textual en múltiples campos
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('username', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%")
                  ->orWhereHas('persona', function ($p) use ($search) {
                      $p->where('nombre', 'ilike', "%{$search}%")
                        ->orWhere('apellido', 'ilike', "%{$search}%");
                  });
            });
        }

        // Filtro por tipo de usuario
        if ($tipo = $request->get('tipo')) {
            $query->where('tipo', $tipo);
        }

        return response()->json($query->paginate(15));
    }

    // Crea un nuevo usuario.
    // Parámetros: datos validados por UserStoreRequest.
    // La contraseña se guarda hasheada con bcrypt (Hash::make).
    // Retorna el usuario creado con código 201.
    public function store(UserStoreRequest $request): JsonResponse
    {
        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password_hash' => Hash::make($request->password),
            'tipo' => $request->tipo,
            'persona_id' => $request->persona_id,
            'activo' => $request->boolean('activo', true),
        ]);

        $user->load('persona');

        return response()->json($user, 201);
    }

    // Muestra un usuario específico por su ID.
    // Retorna 404 si no existe.
    public function show($id): JsonResponse
    {
        $user = User::with('persona')->find($id);

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        return response()->json($user);
    }

    // Actualiza los datos de un usuario (excepto contraseña).
    // Parámetros: ID del usuario + datos validados por UserUpdateRequest.
    // Retorna 404 si no existe.
    public function update(UserUpdateRequest $request, $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        $user->update([
            'username' => $request->username,
            'email' => $request->email,
            'tipo' => $request->tipo,
            'activo' => $request->boolean('activo', $user->activo),
        ]);

        $user->load('persona');

        return response()->json($user);
    }

    // Elimina un usuario por su ID.
    // Retorna 404 si no existe.
    public function destroy($id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        $user->delete();

        return response()->json(['message' => 'Usuario eliminado correctamente.']);
    }

    // Activa o desactiva un usuario alternando el estado del campo 'activo'.
    // No requiere parámetros adicionales; invierte el valor actual.
    // Retorna 404 si el usuario no existe.
    public function toggleActive($id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        $user->activo = !$user->activo;
        $user->save();

        return response()->json([
            'message' => $user->activo ? 'Usuario activado correctamente.' : 'Usuario desactivado correctamente.',
            'user' => $user->load('persona'),
        ]);
    }

    // Cambia la contraseña de un usuario.
    // Parámetros: ID del usuario + nueva contraseña (mín. 6 caracteres).
    // La contraseña se hashea con bcrypt antes de guardar.
    // Retorna 404 si el usuario no existe.
    public function changePassword(Request $request, $id): JsonResponse
    {
        $request->validate([
            'password' => 'required|string|min:6',
        ]);

        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        $user->password_hash = Hash::make($request->password);
        $user->save();

        return response()->json(['message' => 'Contraseña actualizada correctamente.']);
    }
}
