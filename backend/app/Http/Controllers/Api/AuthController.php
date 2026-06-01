<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Persona;
use App\Models\Postulante;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

// Controlador de autenticación — gestiona el inicio/cierre de sesión,
// registro de postulantes y recuperación de contraseñas del sistema CUP-FICCT.
class AuthController extends Controller
{
    // Autentica al usuario con username y password, devuelve token Sanctum.
    // Parámetros: username (string), password (string).
    // Retorna: JSON con token de acceso y datos del usuario (con persona).
    // Lanza ValidationException si credenciales son incorrectas o cuenta está desactivada.
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password_hash)) {
            throw ValidationException::withMessages([
                'username' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        if (!$user->activo) {
            throw ValidationException::withMessages([
                'username' => ['La cuenta está desactivada. Contacte al administrador.'],
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        $user->load('persona');

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    // Cierra la sesión eliminando el token de acceso actual del usuario autenticado.
    // Retorna: mensaje de confirmación.
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada correctamente.']);
    }

    // Devuelve los datos del usuario autenticado junto con su relación 'persona'.
    // Retorna: objeto JSON con usuario y sus datos personales.
    public function user(Request $request): JsonResponse
    {
        return response()->json($request->user()->load('persona'));
    }

    // Registra un nuevo postulante en el sistema: crea Persona, Postulante y User en una transacción.
    // Parámetros: ci, nombre, apellido, fecha_nac, sexo, email, username, password, etc.
    // Retorna: JSON con token, datos del usuario y mensaje de bienvenida (código 201).
    // Si algo falla, revierte la transacción y devuelve error 500.
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'ci' => 'required|string|max:20|unique:persona,ci',
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'fecha_nac' => 'required|date',
            'sexo' => 'required|string|in:Masculino,Femenino,Otro',
            'email' => 'required|email|max:200|unique:persona,email',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string|max:300',
            'ciudad' => 'nullable|string|max:100',
            'colegio_procedencia' => 'nullable|string|max:200',
            'username' => 'required|string|max:50|unique:usuario,username',
            'password' => 'required|string|min:6',
        ]);

        try {
            DB::beginTransaction();

            $persona = Persona::create($request->only([
                'ci', 'nombre', 'apellido', 'fecha_nac', 'sexo',
                'email', 'telefono', 'direccion', 'ciudad',
            ]));

            $postulante = Postulante::create([
                'persona_id' => $persona->id,
                'codigo' => 'POST-' . str_pad($persona->id, 5, '0', STR_PAD_LEFT),
                'colegio_procedencia' => $request->colegio_procedencia,
                'requisitos_verificado' => false,
            ]);

            $user = User::create([
                'username' => $request->username,
                'email' => $request->email,
                'password_hash' => Hash::make($request->password),
                'tipo' => 'postulante',
                'activo' => true,
                'persona_id' => $persona->id,
            ]);

            DB::commit();

            $token = $user->createToken('api-token')->plainTextToken;
            $user->load('persona');

            return response()->json([
                'token' => $token,
                'user' => $user,
                'message' => 'Registro exitoso. Bienvenido al sistema CUP-FICCT.',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al registrar.', 'error' => $e->getMessage()], 500);
        }
    }

    // Genera un token para restablecer contraseña y lo almacena en la tabla password_reset_tokens.
    // Parámetros: email (string, debe existir en 'usuario').
    // Retorna: mensaje informativo y el token generado (modo simulación, sin envío de correo).
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|exists:usuario,email',
        ]);

        $token = Str::random(60);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            ['email' => $request->email, 'token' => Hash::make($token), 'created_at' => now()]
        );

        return response()->json([
            'message' => 'Si el correo está registrado, recibirá un enlace para restablecer su contraseña.',
            'token' => $token,
            '_dev_note' => 'Modo simulación — token devuelto para pruebas sin servidor de correo.',
        ]);
    }

    // Restablece la contraseña validando el token almacenado en password_reset_tokens.
    // Parámetros: email, token (string), password (string, min:6).
    // Retorna: mensaje de éxito o error 400 si el token es inválido/expirado.
    // Tras restablecer, elimina el registro del token usado.
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|exists:usuario,email',
            'token' => 'required|string',
            'password' => 'required|string|min:6',
        ]);

        $record = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$record || !Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Token inválido o expirado.'], 400);
        }

        $user = User::where('email', $request->email)->first();
        $user->password_hash = Hash::make($request->password);
        $user->save();

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Contraseña restablecida correctamente.']);
    }
}
