<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Aula extends Model
{
    use HasFactory;

    protected $table = 'aula';

    public $timestamps = false;

    protected $fillable = [
        'nro',
        'piso',
        'capacidad',
    ];

    protected function casts(): array
    {
        return [
            'piso' => 'integer',
            'capacidad' => 'integer',
        ];
    }

    public function horarios()
    {
        return $this->hasMany(Horario::class, 'aula_id');
    }
}
