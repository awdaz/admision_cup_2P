<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PostulanteRequisito extends Model
{
    use HasFactory;

    protected $table = 'postulante_requisito';

    public $timestamps = false;

    protected $fillable = [
        'postulante_id',
        'requisito_id',
        'cumplido',
        'fecha_verificacion',
    ];

    protected function casts(): array
    {
        return [
            'cumplido' => 'boolean',
            'fecha_verificacion' => 'datetime',
        ];
    }

    public function postulante()
    {
        return $this->belongsTo(Postulante::class, 'postulante_id');
    }

    public function requisito()
    {
        return $this->belongsTo(Requisito::class, 'requisito_id');
    }
}
