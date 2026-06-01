<?php

// =============================================================================
// Modelo: Rinde
// Tabla: rinde
// Propósito: Almacena las notas obtenidas por un postulante en cada examen
//            que rinde. Es la relación directa entre postulación y examen
//            con su respectiva calificación.
//
// Relaciones:
//   - belongsTo(Postulacion) → Postulación del estudiante.
//   - belongsTo(Examen)      → Examen que fue rendido.
//
// Notas:
//   - No usa timestamps automáticos.
//   - 'nota' es decimal(2).
// =============================================================================

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Rinde extends Model
{
    use HasFactory;

    protected $table = 'rinde';

    public $timestamps = false;

    protected $fillable = [
        'postulacion_id',
        'examen_id',
        'nota',
    ];

    protected function casts(): array
    {
        return [
            'nota' => 'decimal:2',
        ];
    }

    public function postulacion()
    {
        return $this->belongsTo(Postulacion::class, 'postulacion_id');
    }

    public function examen()
    {
        return $this->belongsTo(Examen::class, 'examen_id');
    }
}
