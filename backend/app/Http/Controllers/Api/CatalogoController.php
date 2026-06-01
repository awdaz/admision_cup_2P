<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admision;
use App\Models\Carrera;
use App\Models\Materia;
use App\Models\Requisito;
use App\Models\Semestre;
use App\Models\Turno;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// Controlador de catálogos: endpoints de solo lectura para datos maestros.
// Proporciona listados de carreras, turnos, semestres, materias, requisitos y admisiones.
class CatalogoController extends Controller
{
    // Retorna todas las carreras disponibles.
    public function carreras(): JsonResponse
    {
        return response()->json(Carrera::all());
    }

    // Retorna todos los turnos (mañana, tarde, noche, etc.).
    public function turnos(): JsonResponse
    {
        return response()->json(Turno::all());
    }

    // Retorna todos los semestres académicos.
    public function semestres(): JsonResponse
    {
        return response()->json(Semestre::all());
    }

    // Retorna todas las materias registradas.
    public function materias(): JsonResponse
    {
        return response()->json(Materia::all());
    }

    // Retorna todos los requisitos de postulación.
    public function requisitos(): JsonResponse
    {
        return response()->json(Requisito::all());
    }

    // Retorna las admisiones ordenadas por gestión y número descendente.
    // Filtro opcional (query string): estado (ej. 'activo', 'cerrado').
    public function admisiones(Request $request): JsonResponse
    {
        $query = Admision::orderBy('gestion', 'desc')->orderBy('nro', 'desc');

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        return response()->json($query->get());
    }
}
