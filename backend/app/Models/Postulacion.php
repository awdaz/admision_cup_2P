<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Postulacion extends Model
{
    use HasFactory;

    protected $table = 'postulacion';

    public $timestamps = false;

    protected $fillable = [
        'estado',
        'fecha',
        'hora',
        'postulante_id',
        'carrera_id',
        'primera_opcion_id',
        'segunda_opcion_id',
        'turno_id',
        'semestre_id',
        'admision_id',
        'promedio_matematicas',
        'promedio_fisica',
        'promedio_computacion',
        'promedio_ingles',
        'promedio_general',
        'aprobado',
        'carrera_asignada_id',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
            'hora' => 'string',
            'promedio_matematicas' => 'decimal:2',
            'promedio_fisica' => 'decimal:2',
            'promedio_computacion' => 'decimal:2',
            'promedio_ingles' => 'decimal:2',
            'promedio_general' => 'decimal:2',
            'aprobado' => 'boolean',
        ];
    }

    public function postulante()
    {
        return $this->belongsTo(Postulante::class, 'postulante_id');
    }

    public function carreraRel()
    {
        return $this->belongsTo(Carrera::class, 'carrera_id');
    }

    public function primeraOpcion()
    {
        return $this->belongsTo(Carrera::class, 'primera_opcion_id');
    }

    public function segundaOpcion()
    {
        return $this->belongsTo(Carrera::class, 'segunda_opcion_id');
    }

    public function carreraAsignada()
    {
        return $this->belongsTo(Carrera::class, 'carrera_asignada_id');
    }

    public function turno()
    {
        return $this->belongsTo(Turno::class, 'turno_id');
    }

    public function semestre()
    {
        return $this->belongsTo(Semestre::class, 'semestre_id');
    }

    public function admision()
    {
        return $this->belongsTo(Admision::class, 'admision_id');
    }

    public function pagos()
    {
        return $this->hasMany(Pago::class, 'postulacion_id');
    }

    public function rindes()
    {
        return $this->hasMany(Rinde::class, 'postulacion_id');
    }

    public function postulacionGrupos()
    {
        return $this->hasMany(PostulacionGrupo::class, 'postulacion_id');
    }
}
