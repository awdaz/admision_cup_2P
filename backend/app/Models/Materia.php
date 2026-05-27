<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Materia extends Model
{
    use HasFactory;

    protected $table = 'materia';

    public $timestamps = false;

    protected $fillable = [
        'codigo',
        'nombre',
        'peso',
        'descripcion',
    ];

    protected function casts(): array
    {
        return [
            'peso' => 'decimal:2',
        ];
    }

    public function grupos()
    {
        return $this->hasMany(Grupo::class, 'materia_id');
    }

    public function postulacionGrupos()
    {
        return $this->hasMany(PostulacionGrupo::class, 'materia_id');
    }
}
