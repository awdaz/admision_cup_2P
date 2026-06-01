<?php

// =============================================================================
// Modelo: Aula
// Tabla: aula
// Propósito: Registra los salones físicos disponibles, identificados por
//            número, piso y capacidad de estudiantes.
//
// Relaciones:
//   - hasMany(Horario) → Horarios asignados a esta aula.
//
// Notas:
//   - No usa timestamps automáticos.
//   - 'piso' y 'capacidad' son enteros.
// =============================================================================

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Aula extends Model
{
    use HasFactory;

    protected $table = 'aula';

    public $timestamps = false;

    protected $fillable = [
        'nro',
        'piso',
        'capacidad',
    ];

    protected function casts(): array
    {
        return [
            'piso' => 'integer',
            'capacidad' => 'integer',
        ];
    }

    public function horarios()
    {
        return $this->hasMany(Horario::class, 'aula_id');
    }
}
