<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;

return Application::configure(basePath: dirname(__DIR__))

    // --- Registro de archivos de rutas (web, API, consola) y health check ---
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )

    // --- Configuración de middleware global / alias ---
    // Define el alias 'role' que apunta a CheckRole para usarlo en rutas:
    // Route::...->middleware('role:admin')
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);
    })

    // --- Manejo de excepciones (personalizar respuestas de error) ---
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
