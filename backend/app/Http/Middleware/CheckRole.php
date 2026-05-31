<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
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
