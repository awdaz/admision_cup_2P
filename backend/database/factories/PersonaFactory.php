<?php

namespace Database\Factories;

use App\Models\Persona;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonaFactory extends Factory
{
    protected $model = Persona::class;

    public function definition(): array
    {
        $sexo = fake()->randomElement(['Masculino', 'Femenino']);
        $nombre = $sexo === 'Masculino' ? fake()->firstNameMale() : fake()->firstNameFemale();
        $apellido = fake()->lastName();

        return [
            'ci' => fake()->unique()->numerify('########'),
            'nombre' => $nombre,
            'apellido' => $apellido,
            'fecha_nac' => fake()->date('Y-m-d', '2005-12-31'),
            'sexo' => $sexo,
            'email' => fake()->unique()->safeEmail(),
            'telefono' => '7' . fake()->numerify('#######'),
            'direccion' => fake()->address(),
            'ciudad' => fake()->randomElement(['Santa Cruz', 'La Paz', 'Cochabamba', 'Sucre', 'Tarija']),
        ];
    }
}
