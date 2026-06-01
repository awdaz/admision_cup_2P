<?php

use Illuminate\Support\Facades\Route;

// ============================================================
// Ruta de bienvenida — página principal de la aplicación
// ============================================================
Route::get('/', function () {
    return view('welcome');
});
