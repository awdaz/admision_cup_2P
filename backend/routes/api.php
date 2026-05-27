<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PostulanteController;
use App\Http\Controllers\Api\RequisitoController;
use App\Http\Controllers\Api\PagoController;
use App\Http\Controllers\Api\CatalogoController;
use App\Http\Controllers\Api\DashboardController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Postulantes CRUD
    Route::apiResource('postulantes', PostulanteController::class);
    Route::get('/postulantes/buscar/{ci}', [PostulanteController::class, 'search']);

    // Requisitos
    Route::get('/postulantes/{postulante}/requisitos', [RequisitoController::class, 'index']);
    Route::put('/postulantes/{postulante}/requisitos', [RequisitoController::class, 'update']);

    // Pagos
    Route::apiResource('pagos', PagoController::class);
    Route::put('/pagos/{pago}/confirmar', [PagoController::class, 'confirmar']);

    // Catálogos
    Route::get('/carreras', [CatalogoController::class, 'carreras']);
    Route::get('/turnos', [CatalogoController::class, 'turnos']);
    Route::get('/semestres', [CatalogoController::class, 'semestres']);
    Route::get('/materias', [CatalogoController::class, 'materias']);
    Route::get('/requisitos', [CatalogoController::class, 'requisitos']);
});
