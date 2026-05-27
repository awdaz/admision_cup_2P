<?php

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
