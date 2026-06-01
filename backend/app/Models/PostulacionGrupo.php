<?php

// =============================================================================
// Modelo: PostulacionGrupo (Pivote)
// Tabla: postulacion_grupo
// Propósito: Tabla pivote que asigna una postulación a un grupo y materia
//            específicos. Permite saber en qué grupo y materia quedó
//            inscrito cada postulante.
//
// Relaciones:
//   - belongsTo(Postulacion) → Postulación asociada.
//   - belongsTo(Grupo)       → Grupo asignado.
//   - belongsTo(Materia)     → Materia dentro del grupo.
//
// Notas:
//   - No usa timestamps automáticos.
// =============================================================================

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PostulacionGrupo extends Model
{
    use HasFactory;

    protected $table = 'postulacion_grupo';

    public $timestamps = false;

    protected $fillable = [
        'postulacion_id',
        'grupo_id',
        'materia_id',
    ];

    public function postulacion()
    {
        return $this->belongsTo(Postulacion::class, 'postulacion_id');
    }

    public function grupo()
    {
        return $this->belongsTo(Grupo::class, 'grupo_id');
    }

    public function materia()
    {
        return $this->belongsTo(Materia::class, 'materia_id');
    }
}
