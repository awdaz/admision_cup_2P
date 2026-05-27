<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Rinde extends Model
{
    use HasFactory;

    protected $table = 'rinde';

    public $timestamps = false;

    protected $fillable = [
        'postulacion_id',
        'examen_id',
        'nota',
    ];

    protected function casts(): array
    {
        return [
            'nota' => 'decimal:2',
        ];
    }

    public function postulacion()
    {
        return $this->belongsTo(Postulacion::class, 'postulacion_id');
    }

    public function examen()
    {
        return $this->belongsTo(Examen::class, 'examen_id');
    }
}
