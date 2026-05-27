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
            ['ci' => 'admin'],
            [
                'nombre' => 'Admin',
                'apellido' => 'Sistema',
                'fecha_nac' => '2024-01-01',
                'sexo' => 'Otro',
                'email' => 'admin@cup.ficct',
                'telefono' => '000000000',
                'direccion' => 'Oficina FICCT',
                'ciudad' => 'Santa Cruz',
            ]
        );

        User::create([
            'username' => 'admin',
            'email' => 'admin@cup.ficct',
            'password_hash' => Hash::make('admin123'),
            'tipo' => 'admin',
            'activo' => true,
            'persona_id' => $persona->id,
        ]);

        $this->command->info('Usuario admin creado: admin / admin123');
    }
}
