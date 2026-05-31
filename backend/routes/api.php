<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CatalogoController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DocenteController;
use App\Http\Controllers\Api\ExamenController;
use App\Http\Controllers\Api\GrupoController;
use App\Http\Controllers\Api\HorarioController;
use App\Http\Controllers\Api\PagoController;
use App\Http\Controllers\Api\PostulacionController;
use App\Http\Controllers\Api\PostulanteController;
use App\Http\Controllers\Api\ReporteController;
use App\Http\Controllers\Api\RequisitoController;
use App\Http\Controllers\Api\RindeController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Protected routes (any authenticated user)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Postulantes (read: admin + postulante suyo; write: admin only)
    Route::get('/postulantes', [PostulanteController::class, 'index']);
    Route::get('/postulantes/{postulante}', [PostulanteController::class, 'show']);

    // Requisitos (read: admin + postulante suyo)
    Route::get('/postulantes/{postulante}/requisitos', [RequisitoController::class, 'index']);

    // Postulaciones (postulante puede crear su propia, admin todo)
    Route::get('/postulaciones', [PostulacionController::class, 'index']);
    Route::post('/postulaciones', [PostulacionController::class, 'store']);
    Route::get('/postulaciones/{postulacion}', [PostulacionController::class, 'show']);
    Route::put('/postulaciones/{postulacion}/cancelar', [PostulacionController::class, 'cancelar']);

    // Pagos (read: admin + postulante suyo)
    Route::get('/pagos', [PagoController::class, 'index']);
    Route::get('/pagos/{pago}', [PagoController::class, 'show']);

    // Docentes (read: all authenticated)
    Route::get('/docentes', [DocenteController::class, 'index']);
    Route::get('/docentes/{docente}', [DocenteController::class, 'show']);

    // Grupos (read: all authenticated; docente sees own)
    Route::get('/grupos', [GrupoController::class, 'index']);
    Route::get('/grupos/{grupo}', [GrupoController::class, 'show']);

    // Exámenes (read: all authenticated)
    Route::get('/examenes', [ExamenController::class, 'index']);
    Route::get('/examenes/{examen}', [ExamenController::class, 'show']);

    // Horarios (read)
    Route::get('/horarios', [HorarioController::class, 'index']);
    Route::get('/horarios/{horario}', [HorarioController::class, 'show']);

    // Rindes / notas (read: postulante sus notas, admin todas)
    Route::get('/rindes', [RindeController::class, 'index']);
    Route::get('/rindes/{rinde}', [RindeController::class, 'show']);
    Route::get('/rindes/postulacion/{postulacion}', [RindeController::class, 'postulacion']);
    Route::post('/rindes', [RindeController::class, 'store']); // admin + docente (validado en controller)

    // Reportes
    Route::get('/reportes/admision', [ReporteController::class, 'admision']);
    Route::get('/reportes/docente/mis-grupos', [ReporteController::class, 'docenteMisGrupos']);
    Route::get('/reportes/postulante/mis-notas', [ReporteController::class, 'postulanteMisNotas']);

    // Catálogos (todos los roles)
    Route::get('/carreras', [CatalogoController::class, 'carreras']);
    Route::get('/turnos', [CatalogoController::class, 'turnos']);
    Route::get('/semestres', [CatalogoController::class, 'semestres']);
    Route::get('/materias', [CatalogoController::class, 'materias']);
    Route::get('/requisitos', [CatalogoController::class, 'requisitos']);
    Route::get('/admisiones', [CatalogoController::class, 'admisiones']);
});

// Admin only routes
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Postulantes (write)
    Route::post('/postulantes', [PostulanteController::class, 'store']);
    Route::put('/postulantes/{postulante}', [PostulanteController::class, 'update']);
    Route::delete('/postulantes/{postulante}', [PostulanteController::class, 'destroy']);
    Route::get('/postulantes/buscar/{ci}', [PostulanteController::class, 'search']);

    // Requisitos (write)
    Route::put('/postulantes/{postulante}/requisitos', [RequisitoController::class, 'update']);

    // Pagos (write)
    Route::post('/pagos', [PagoController::class, 'store']);
    Route::put('/pagos/{pago}/confirmar', [PagoController::class, 'confirmar']);

    // Docentes (write)
    Route::post('/docentes', [DocenteController::class, 'store']);
    Route::put('/docentes/{docente}', [DocenteController::class, 'update']);
    Route::delete('/docentes/{docente}', [DocenteController::class, 'destroy']);
    Route::put('/docentes/{docente}/contratar', [DocenteController::class, 'contratar']);

    // Grupos (write)
    Route::post('/grupos', [GrupoController::class, 'store']);
    Route::put('/grupos/{grupo}', [GrupoController::class, 'update']);
    Route::delete('/grupos/{grupo}', [GrupoController::class, 'destroy']);

    // Exámenes (write)
    Route::post('/examenes', [ExamenController::class, 'store']);
    Route::put('/examenes/{examen}', [ExamenController::class, 'update']);
    Route::delete('/examenes/{examen}', [ExamenController::class, 'destroy']);
    Route::get('/examenes/{examen}/rindes', [ExamenController::class, 'rindes']);

    // Horarios (write)
    Route::post('/horarios', [HorarioController::class, 'store']);
    Route::put('/horarios/{horario}', [HorarioController::class, 'update']);
    Route::delete('/horarios/{horario}', [HorarioController::class, 'destroy']);

    // Rindes / notas (write)
    Route::delete('/rindes/{rinde}', [RindeController::class, 'destroy']);

    // Usuarios
    Route::apiResource('users', UserController::class);
    Route::put('/users/{user}/toggle-active', [UserController::class, 'toggleActive']);
    Route::put('/users/{user}/change-password', [UserController::class, 'changePassword']);
});
