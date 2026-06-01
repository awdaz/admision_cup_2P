<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware que verifica si el usuario autenticado posee al menos uno
 * de los roles indicados. Se usa junto con auth:sanctum para restringir
 * el acceso a rutas según el tipo de usuario (admin, postulante, docente).
 *
 * Uso en rutas: ->middleware(['auth:sanctum', 'role:admin,docente'])
 */
class CheckRole
{
    /**
     * Maneja la solicitud entrante.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  ...$roles  Lista de roles permitidos (tipo de usuario)
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        foreach ($roles as $role) {
            if ($user->tipo === $role) {
                return $next($request);
            }
        }

        return response()->json(['message' => 'No autorizado para esta acción.'], 403);
    }
}
