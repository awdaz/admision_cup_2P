<?php

// =============================================================================
// Modelo: Horario
// Tabla: horario
// Propósito: Define el día, hora de inicio y hora de fin en que un grupo
//            se reúne en un aula determinada.
//
// Relaciones:
//   - belongsTo(Grupo) → Grupo al que pertenece el horario.
//   - belongsTo(Aula)  → Aula donde se imparte la clase.
//
// Notas:
//   - No usa timestamps automáticos.
// =============================================================================

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Horario extends Model
{
    use HasFactory;

    protected $table = 'horario';

    public $timestamps = false;

    protected $fillable = [
        'dia',
        'hora_inicio',
        'hora_fin',
        'grupo_id',
        'aula_id',
    ];

    public function grupo()
    {
        return $this->belongsTo(Grupo::class, 'grupo_id');
    }

    public function aula()
    {
        return $this->belongsTo(Aula::class, 'aula_id');
    }
}
