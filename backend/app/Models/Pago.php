<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Pago extends Model
{
    use HasFactory;

    protected $table = 'pago';

    public $timestamps = false;

    protected $fillable = [
        'numero_recibo',
        'monto',
        'metodo_pago',
        'estado',
        'transaccion_id',
        'gateway',
        'respuesta_gateway',
        'postulacion_id',
        'postulante_id',
    ];

    protected function casts(): array
    {
        return [
            'monto' => 'decimal:2',
        ];
    }

    public function postulacion()
    {
        return $this->belongsTo(Postulacion::class, 'postulacion_id');
    }

    public function postulante()
    {
        return $this->belongsTo(Postulante::class, 'postulante_id');
    }
}
