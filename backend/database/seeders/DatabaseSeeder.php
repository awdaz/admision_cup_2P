<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CatalogoSeeder::class,
            AdminUserSeeder::class,
            TestUserSeeder::class,
        ]);

        $this->command->info('==============================');
        $this->command->info('Base de datos poblada.');
        $this->command->info('Admin:     admin / admin123');
        $this->command->info('Docente:   docente.prueba / docente456');
        $this->command->info('Postulante: postulante.prueba / postulante789');
        $this->command->info('==============================');
    }
}
