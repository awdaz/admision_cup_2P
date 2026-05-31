<?php

namespace Database\Seeders;

use App\Models\Persona;
use App\Models\Postulante;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    public function run(): void
    {
        if (!User::where('username', 'docente.prueba')->exists()) {
            $docPersona = Persona::firstOrCreate(
                ['ci' => '8765432'],
                [
                    'nombre' => 'Carlos',
                    'apellido' => 'Docente',
                    'fecha_nac' => '1985-06-15',
                    'sexo' => 'Masculino',
                    'email' => 'carlos.docente@uagrm.edu.bo',
                    'telefono' => '71234567',
                    'direccion' => 'Calle 21 #123',
                    'ciudad' => 'Santa Cruz',
                ]
            );

            User::create([
                'username' => 'docente.prueba',
                'email' => 'carlos.docente@uagrm.edu.bo',
                'password_hash' => Hash::make('docente456'),
                'tipo' => 'docente',
                'activo' => true,
                'persona_id' => $docPersona->id,
            ]);

            $this->command->info('Docente de prueba creado: docente.prueba / docente456');
        }

        if (!User::where('username', 'postulante.prueba')->exists()) {
            $postPersona = Persona::firstOrCreate(
                ['ci' => '11223344'],
                [
                    'nombre' => 'María',
                    'apellido' => 'Postulante',
                    'fecha_nac' => '2005-03-20',
                    'sexo' => 'Femenino',
                    'email' => 'maria.postulante@test.com',
                    'telefono' => '79876543',
                    'direccion' => 'Av. Principal #456',
                    'ciudad' => 'Santa Cruz',
                ]
            );

            User::create([
                'username' => 'postulante.prueba',
                'email' => 'maria.postulante@test.com',
                'password_hash' => Hash::make('postulante789'),
                'tipo' => 'postulante',
                'activo' => true,
                'persona_id' => $postPersona->id,
            ]);

            Postulante::create([
                'persona_id' => $postPersona->id,
                'codigo' => 'POST-00001',
                'colegio_procedencia' => 'Colegio San José',
                'requisitos_verificado' => true,
            ]);

            $this->command->info('Postulante de prueba creado: postulante.prueba / postulante789');
        }
    }
}
