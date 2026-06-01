<?php

// =============================================================================
// Modelo: Admision
// Tabla: admision
// Propósito: Gestiona los procesos de admisión. Define las fechas de inicio
//            y fin del período de postulación, el estado del proceso y la
//            gestión (año) correspondiente.
//
// Relaciones:
//   - hasMany(Postulacion) → Postulaciones realizadas en esta admisión.
//
// Notas:
//   - No usa timestamps automáticos.
//   - 'fecha_inicio' y 'fecha_fin' se castean a date; 'gestion' a entero.
// =============================================================================

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Admision extends Model
{
    use HasFactory;

    protected $table = 'admision';

    public $timestamps = false;

    protected $fillable = [
        'nro',
        'estado',
        'fecha_inicio',
        'fecha_fin',
        'gestion',
        'descripcion',
    ];

    protected function casts(): array
    {
        return [
            'fecha_inicio' => 'date',
            'fecha_fin' => 'date',
            'gestion' => 'integer',
        ];
    }

    public function postulacions()
    {
        return $this->hasMany(Postulacion::class, 'admision_id');
    }
}
