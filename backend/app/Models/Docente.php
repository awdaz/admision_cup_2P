<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Docente extends Model
{
    use HasFactory;

    protected $table = 'docente';

    public $timestamps = false;

    protected $fillable = [
        'persona_id',
        'cod_docente',
        'es_profesional_area',
        'tiene_maestria',
        'tiene_diplomado_edu_sup',
        'contratado',
    ];

    protected function casts(): array
    {
        return [
            'es_profesional_area' => 'boolean',
            'tiene_maestria' => 'boolean',
            'tiene_diplomado_edu_sup' => 'boolean',
            'contratado' => 'boolean',
        ];
    }

    public function persona()
    {
        return $this->belongsTo(Persona::class, 'persona_id');
    }

    public function grupos()
    {
        return $this->hasMany(Grupo::class, 'docente_id');
    }
}
