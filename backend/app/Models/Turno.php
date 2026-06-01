<?php

// =============================================================================
// Modelo: Turno
// Tabla: turno
// Propósito: Define los turnos disponibles (mañana, tarde, noche) y su
//            modalidad (presencial, semipresencial, virtual).
//
// Relaciones:
//   - hasMany(Grupo)         → Grupos que pertenecen a este turno.
//   - hasMany(Postulacion)   → Postulaciones que eligieron este turno.
//
// Notas:
//   - No usa timestamps automáticos.
// =============================================================================

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Turno extends Model
{
    use HasFactory;

    protected $table = 'turno';

    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'modalidad',
    ];

    public function grupos()
    {
        return $this->hasMany(Grupo::class, 'turno_id');
    }

    public function postulacions()
    {
        return $this->hasMany(Postulacion::class, 'turno_id');
    }
}
