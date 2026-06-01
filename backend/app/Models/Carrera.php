<?php

// =============================================================================
// Modelo: Carrera
// Tabla: carrera
// Propósito: Define las carreras universitarias disponibles. Cada carrera
//            tiene un cupo máximo y una nota de corte para la admisión.
//
// Relaciones:
//   - hasMany(Postulacion, 'carrera_id')                → Postulaciones que
//                                                          corresponden a esta
//                                                          carrera.
//   - hasMany(Postulacion, 'primera_opcion_id')          → Postulaciones donde
//                                                          es 1ra opción.
//   - hasMany(Postulacion, 'segunda_opcion_id')          → Postulaciones donde
//                                                          es 2da opción.
//   - hasMany(Postulacion, 'carrera_asignada_id')        → Postulaciones donde
//                                                          fue la carrera
//                                                          asignada.
//
// Notas:
//   - No usa timestamps automáticos.
//   - 'cupo' es entero, 'nota_corte' es decimal(2).
// =============================================================================

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Carrera extends Model
{
    use HasFactory;

    protected $table = 'carrera';

    public $timestamps = false;

    protected $fillable = [
        'codigo',
        'nombre',
        'cupo',
        'nota_corte',
    ];

    protected function casts(): array
    {
        return [
            'cupo' => 'integer',
            'nota_corte' => 'decimal:2',
        ];
    }

    public function postulacions()
    {
        return $this->hasMany(Postulacion::class, 'carrera_id');
    }

    public function primeraOpcionPostulacions()
    {
        return $this->hasMany(Postulacion::class, 'primera_opcion_id');
    }

    public function segundaOpcionPostulacions()
    {
        return $this->hasMany(Postulacion::class, 'segunda_opcion_id');
    }

    public function carreraAsignadaPostulacions()
    {
        return $this->hasMany(Postulacion::class, 'carrera_asignada_id');
    }
}
