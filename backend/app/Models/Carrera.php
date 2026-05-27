<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Carrera extends Model
{
    use HasFactory;

    protected $table = 'carrera';

    public $timestamps = false;

    protected $fillable = [
        'codigo',
        'nombre',
        'cupo',
        'nota_corte',
    ];

    protected function casts(): array
    {
        return [
            'cupo' => 'integer',
            'nota_corte' => 'decimal:2',
        ];
    }

    public function postulacions()
    {
        return $this->hasMany(Postulacion::class, 'carrera_id');
    }

    public function primeraOpcionPostulacions()
    {
        return $this->hasMany(Postulacion::class, 'primera_opcion_id');
    }

    public function segundaOpcionPostulacions()
    {
        return $this->hasMany(Postulacion::class, 'segunda_opcion_id');
    }

    public function carreraAsignadaPostulacions()
    {
        return $this->hasMany(Postulacion::class, 'carrera_asignada_id');
    }
}
