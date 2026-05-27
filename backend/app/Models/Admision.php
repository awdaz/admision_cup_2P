<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Admision extends Model
{
    use HasFactory;

    protected $table = 'admision';

    public $timestamps = false;

    protected $fillable = [
        'nro',
        'estado',
        'fecha_inicio',
        'fecha_fin',
        'gestion',
        'descripcion',
    ];

    protected function casts(): array
    {
        return [
            'fecha_inicio' => 'date',
            'fecha_fin' => 'date',
            'gestion' => 'integer',
        ];
    }

    public function postulacions()
    {
        return $this->hasMany(Postulacion::class, 'admision_id');
    }
}
