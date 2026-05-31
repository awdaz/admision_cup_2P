<?php

namespace Database\Factories;

use App\Models\Persona;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class UserFactory extends Factory
{
    protected $model = User::class;

    protected static ?string $password;

    public function definition(): array
    {
        return [
            'username' => fake()->unique()->userName(),
            'email' => fake()->unique()->safeEmail(),
            'password_hash' => static::$password ??= Hash::make('password'),
            'tipo' => 'postulante',
            'activo' => true,
            'persona_id' => Persona::factory(),
        ];
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'username' => 'admin',
            'tipo' => 'admin',
        ]);
    }

    public function docente(): static
    {
        return $this->state(fn (array $attributes) => [
            'tipo' => 'docente',
        ]);
    }

    public function postulante(): static
    {
        return $this->state(fn (array $attributes) => [
            'tipo' => 'postulante',
        ]);
    }

    public function inactivo(): static
    {
        return $this->state(fn (array $attributes) => [
            'activo' => false,
        ]);
    }
}
