<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Carrera;
use App\Models\Materia;
use App\Models\Requisito;
use App\Models\Semestre;
use App\Models\Turno;
use Illuminate\Http\JsonResponse;

class CatalogoController extends Controller
{
    public function carreras(): JsonResponse
    {
        return response()->json(Carrera::all());
    }

    public function turnos(): JsonResponse
    {
        return response()->json(Turno::all());
    }

    public function semestres(): JsonResponse
    {
        return response()->json(Semestre::all());
    }

    public function materias(): JsonResponse
    {
        return response()->json(Materia::all());
    }

    public function requisitos(): JsonResponse
    {
        return response()->json(Requisito::all());
    }
}
