<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Semestre extends Model
{
    use HasFactory;

    protected $table = 'semestre';

    public $timestamps = false;

    protected $fillable = [
        'semestre',
        'anio',
    ];

    protected function casts(): array
    {
        return [
            'anio' => 'integer',
        ];
    }

    public function postulacions()
    {
        return $this->hasMany(Postulacion::class, 'semestre_id');
    }
}
