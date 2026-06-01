<?php

// =============================================================================
// Modelo: Grupo
// Tabla: grupo
// Propósito: Representa una comisión o grupo de estudiantes que cursan una
//            materia específica con un docente en un turno determinado.
//            Cada grupo tiene un código, nombre y cupo máximo.
//
// Relaciones:
//   - belongsTo(Materia)            → Materia que se imparte en el grupo.
//   - belongsTo(Docente)            → Docente a cargo del grupo.
//   - belongsTo(Turno)              → Turno (mañana/tarde/noche).
//   - hasMany(Examen)               → Exámenes del grupo.
//   - hasMany(Horario)              → Horarios del grupo.
//   - hasMany(PostulacionGrupo)     → Postulaciones asignadas al grupo.
//
// Notas:
//   - No usa timestamps automáticos.
//   - 'cupo' es entero.
// =============================================================================

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Grupo extends Model
{
    use HasFactory;

    protected $table = 'grupo';

    public $timestamps = false;

    protected $fillable = [
        'codigo',
        'nombre',
        'cupo',
        'materia_id',
        'docente_id',
        'turno_id',
    ];

    protected function casts(): array
    {
        return [
            'cupo' => 'integer',
        ];
    }

    public function materia()
    {
        return $this->belongsTo(Materia::class, 'materia_id');
    }

    public function docente()
    {
        return $this->belongsTo(Docente::class, 'docente_id');
    }

    public function turno()
    {
        return $this->belongsTo(Turno::class, 'turno_id');
    }

    public function examenes()
    {
        return $this->hasMany(Examen::class, 'grupo_id');
    }

    public function horarios()
    {
        return $this->hasMany(Horario::class, 'grupo_id');
    }

    public function postulacionGrupos()
    {
        return $this->hasMany(PostulacionGrupo::class, 'grupo_id');
    }
}
