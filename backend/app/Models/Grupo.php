<?php

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
