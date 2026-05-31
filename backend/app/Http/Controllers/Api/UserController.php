<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdateRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::with('persona')->orderBy('username');

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

        if ($tipo = $request->get('tipo')) {
            $query->where('tipo', $tipo);
        }

        return response()->json($query->paginate(15));
    }

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

    public function show($id): JsonResponse
    {
        $user = User::with('persona')->find($id);

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        return response()->json($user);
    }

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

    public function destroy($id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        $user->delete();

        return response()->json(['message' => 'Usuario eliminado correctamente.']);
    }

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
