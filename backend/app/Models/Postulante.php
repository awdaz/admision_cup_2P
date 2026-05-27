<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Postulante extends Model
{
    use HasFactory;

    protected $table = 'postulante';

    public $timestamps = false;

    protected $fillable = [
        'persona_id',
        'codigo',
        'colegio_procedencia',
        'requisitos_verificado',
    ];

    protected function casts(): array
    {
        return [
            'requisitos_verificado' => 'boolean',
        ];
    }

    public function persona()
    {
        return $this->belongsTo(Persona::class, 'persona_id');
    }

    public function postulanteRequisitos()
    {
        return $this->hasMany(PostulanteRequisito::class, 'postulante_id');
    }

    public function postulacions()
    {
        return $this->hasMany(Postulacion::class, 'postulante_id');
    }

    public function pagos()
    {
        return $this->hasMany(Pago::class, 'postulante_id');
    }
}
