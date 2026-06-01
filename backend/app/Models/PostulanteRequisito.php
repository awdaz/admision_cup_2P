<?php

// =============================================================================
// Modelo: PostulanteRequisito (Pivote)
// Tabla: postulante_requisito
// Propósito: Tabla pivote que relaciona un postulante con los requisitos que
//            debe cumplir. Indica si cada requisito fue cumplido y la fecha
//            de verificación.
//
// Relaciones:
//   - belongsTo(Postulante) → Postulante asociado.
//   - belongsTo(Requisito)  → Requisito asociado.
//
// Notas:
//   - No usa timestamps automáticos.
//   - 'cumplido' es booleano; 'fecha_verificacion' es datetime.
// =============================================================================

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
