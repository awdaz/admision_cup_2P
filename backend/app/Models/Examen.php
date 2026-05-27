<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Examen extends Model
{
    use HasFactory;

    protected $table = 'examen';

    public $timestamps = false;

    protected $fillable = [
        'nro',
        'descripcion',
        'fecha',
        'grupo_id',
        'porcentaje',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
            'porcentaje' => 'decimal:2',
        ];
    }

    public function grupo()
    {
        return $this->belongsTo(Grupo::class, 'grupo_id');
    }

    public function rindes()
    {
        return $this->hasMany(Rinde::class, 'examen_id');
    }
}
