<?php

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
