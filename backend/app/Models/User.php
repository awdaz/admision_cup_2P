<?php

// =============================================================================
// Modelo: User
// Tabla: usuario
// Propósito: Gestiona la autenticación y autorización de los usuarios del
//            sistema. Extiende Authenticatable de Laravel con soporte para
//            Sanctum (API tokens) y notificaciones.
//
// Relaciones:
//   - belongsTo(Persona) → Datos personales del usuario.
//
// Notas:
//   - No usa timestamps automáticos.
//   - 'activo' es booleano (indica si la cuenta está habilitada).
//   - 'tipo' define el rol (ej. admin, postulante, etc.).
//   - La contraseña se almacena como 'password_hash'.
// =============================================================================

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuario';

    public $timestamps = false;

    protected $fillable = [
        'username',
        'email',
        'password_hash',
        'tipo',
        'activo',
        'persona_id',
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
        ];
    }

    public function persona()
    {
        return $this->belongsTo(Persona::class, 'persona_id');
    }
}
