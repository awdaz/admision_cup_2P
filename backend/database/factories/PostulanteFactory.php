<?php

namespace Database\Factories;

use App\Models\Persona;
use App\Models\Postulante;
use Illuminate\Database\Eloquent\Factories\Factory;

class PostulanteFactory extends Factory
{
    protected $model = Postulante::class;

    public function definition(): array
    {
        $persona = Persona::factory()->create();

        return [
            'persona_id' => $persona->id,
            'codigo' => 'POST-' . str_pad($persona->id, 5, '0', STR_PAD_LEFT),
            'colegio_procedencia' => fake()->randomElement([
                'Colegio San José',
                'Colegio Don Bosco',
                'Colegio Alemán',
                'Colegio La Salle',
                'Colegio Santa María',
            ]),
            'requisitos_verificado' => fake()->boolean(70),
        ];
    }
}
