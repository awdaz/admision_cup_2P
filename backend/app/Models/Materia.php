<?php

// =============================================================================
// Modelo: Materia
// Tabla: materia
// Propósito: Define las materias o asignaturas del plan de estudios. Cada
//            materia tiene un peso (ponderación) que influye en el cálculo
//            de promedios.
//
// Relaciones:
//   - hasMany(Grupo)             → Grupos que imparten esta materia.
//   - hasMany(PostulacionGrupo)  → Asignación de materia a postulaciones.
//
// Notas:
//   - No usa timestamps automáticos.
//   - 'peso' es decimal(2).
// =============================================================================

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Materia extends Model
{
    use HasFactory;

    protected $table = 'materia';

    public $timestamps = false;

    protected $fillable = [
        'codigo',
        'nombre',
        'peso',
        'descripcion',
    ];

    protected function casts(): array
    {
        return [
            'peso' => 'decimal:2',
        ];
    }

    public function grupos()
    {
        return $this->hasMany(Grupo::class, 'materia_id');
    }

    public function postulacionGrupos()
    {
        return $this->hasMany(PostulacionGrupo::class, 'materia_id');
    }
}
