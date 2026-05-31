<?php

namespace Database\Seeders;

use App\Models\Persona;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        if (User::where('username', 'admin')->exists()) {
            $this->command->info('Usuario admin ya existe. Omitiendo.');
            return;
        }

        $persona = Persona::firstOrCreate(
            ['ci' => '1234567'],
            [
                'nombre' => 'Admin',
                'apellido' => 'Principal',
                'fecha_nac' => '1990-01-01',
                'sexo' => 'Masculino',
                'email' => 'admin@cup.uagrm.edu.bo',
                'telefono' => '70000000',
                'direccion' => 'Oficina Central',
                'ciudad' => 'Santa Cruz',
            ]
        );

        User::create([
            'username' => 'admin',
            'email' => 'admin@cup.uagrm.edu.bo',
            'password_hash' => Hash::make('admin123'),
            'tipo' => 'admin',
            'activo' => true,
            'persona_id' => $persona->id,
        ]);

        $this->command->info('Usuario admin creado: admin / admin123');
    }
}
