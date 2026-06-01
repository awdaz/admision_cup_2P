<?php

// =============================================================================
// Modelo: Requisito
// Tabla: requisito
// Propósito: Catalogo de requisitos documentales que los postulantes deben
//            presentar (ej. certificado de nacimiento, título, etc.).
//
// Relaciones:
//   - hasMany(PostulanteRequisito) → Relación con los requisitos que cada
//                                     postulante ha presentado/verificado.
//
// Notas:
//   - No usa timestamps automáticos.
// =============================================================================

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Requisito extends Model
{
    use HasFactory;

    protected $table = 'requisito';

    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'descripcion',
    ];

    public function postulanteRequisitos()
    {
        return $this->hasMany(PostulanteRequisito::class, 'requisito_id');
    }
}
