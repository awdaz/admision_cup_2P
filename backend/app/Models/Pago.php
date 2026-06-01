<?php

// =============================================================================
// Modelo: Pago
// Tabla: pago
// Propósito: Registra los pagos realizados por los postulantes para su
//            postulación. Incluye información de la transacción, método de
//            pago, gateway utilizado y respuesta del mismo.
//
// Relaciones:
//   - belongsTo(Postulacion) → Postulación a la que aplica el pago.
//   - belongsTo(Postulante)  → Postulante que realizó el pago.
//
// Notas:
//   - No usa timestamps automáticos.
//   - 'monto' es decimal(2).
//   - 'gateway' y 'respuesta_gateway' almacenan datos de la pasarela de pago.
// =============================================================================

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
