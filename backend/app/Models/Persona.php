<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Persona extends Model
{
    use HasFactory;

    protected $table = 'persona';

    public $timestamps = false;

    protected $fillable = [
        'ci',
        'nombre',
        'apellido',
        'fecha_nac',
        'sexo',
        'email',
        'telefono',
        'direccion',
        'ciudad',
    ];

    protected function casts(): array
    {
        return [
            'fecha_nac' => 'date',
        ];
    }

    public function postulante()
    {
        return $this->hasOne(Postulante::class, 'persona_id');
    }

    public function docente()
    {
        return $this->hasOne(Docente::class, 'persona_id');
    }

    public function usuario()
    {
        return $this->hasOne(User::class, 'persona_id');
    }
}
