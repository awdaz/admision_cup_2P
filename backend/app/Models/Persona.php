<?php

// =============================================================================
// Modelo: Persona
// Tabla: persona
// Propósito: Almacena los datos personales de cualquier individuo del sistema
//            (postulantes, docentes, usuarios). Es la tabla base de la cual
//            dependen las demás entidades de persona.
//
// Relaciones:
//   - hasOne(Postulante)  → Un persona puede ser un postulante.
//   - hasOne(Docente)     → Un persona puede ser un docente.
//   - hasOne(User)        → Un persona puede tener un usuario de sistema.
//
// Notas:
//   - No usa timestamps automáticos (false).
//   - 'fecha_nac' se castea a tipo date.
// =============================================================================

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Persona extends Model
{
    use HasFactory;

    protected $table = 'persona';

    public $timestamps = false;

    protected $fillable = [
        'ci',
        'nombre',
        'apellido',
        'fecha_nac',
        'sexo',
        'email',
        'telefono',
        'direccion',
        'ciudad',
    ];

    protected function casts(): array
    {
        return [
            'fecha_nac' => 'date',
        ];
    }

    public function postulante()
    {
        return $this->hasOne(Postulante::class, 'persona_id');
    }

    public function docente()
    {
        return $this->hasOne(Docente::class, 'persona_id');
    }

    public function usuario()
    {
        return $this->hasOne(User::class, 'persona_id');
    }
}
