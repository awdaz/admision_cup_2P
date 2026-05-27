<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Turno extends Model
{
    use HasFactory;

    protected $table = 'turno';

    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'modalidad',
    ];

    public function grupos()
    {
        return $this->hasMany(Grupo::class, 'turno_id');
    }

    public function postulacions()
    {
        return $this->hasMany(Postulacion::class, 'turno_id');
    }
}
