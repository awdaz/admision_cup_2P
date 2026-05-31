<?php

namespace Database\Seeders;

use App\Models\Admision;
use App\Models\Aula;
use App\Models\Carrera;
use App\Models\Materia;
use App\Models\Requisito;
use App\Models\Semestre;
use App\Models\Turno;
use Illuminate\Database\Seeder;

class CatalogoSeeder extends Seeder
{
    public function run(): void
    {
        Turno::insertOrIgnore([
            ['nombre' => 'Mañana', 'modalidad' => 'presencial'],
            ['nombre' => 'Tarde', 'modalidad' => 'presencial'],
            ['nombre' => 'Noche', 'modalidad' => 'virtual'],
        ]);

        Carrera::insertOrIgnore([
            ['codigo' => 'ING-SIS', 'nombre' => 'Ingeniería de Sistemas', 'cupo' => 200, 'nota_corte' => null],
            ['codigo' => 'ING-INF', 'nombre' => 'Ingeniería Informática', 'cupo' => 150, 'nota_corte' => null],
            ['codigo' => 'ING-RED', 'nombre' => 'Ingeniería en Redes y Telecomunicaciones', 'cupo' => 100, 'nota_corte' => null],
            ['codigo' => 'ING-ROB', 'nombre' => 'Ingeniería en Robótica', 'cupo' => 50, 'nota_corte' => null],
        ]);

        Semestre::insertOrIgnore([
            ['semestre' => '1-2026', 'anio' => 2026],
        ]);

        Admision::insertOrIgnore([
            [
                'nro' => 'ADM-001-2026',
                'estado' => 'activa',
                'fecha_inicio' => '2026-01-15',
                'fecha_fin' => '2026-03-15',
                'gestion' => 2026,
                'descripcion' => 'Admisión ordinaria gestión 2026',
            ],
        ]);

        Materia::insertOrIgnore([
            ['codigo' => 'MAT', 'nombre' => 'Matemáticas', 'peso' => 30.00, 'descripcion' => 'Razonamiento lógico matemático y álgebra'],
            ['codigo' => 'FIS', 'nombre' => 'Física', 'peso' => 30.00, 'descripcion' => 'Conceptos fundamentales de física'],
            ['codigo' => 'COM', 'nombre' => 'Computación', 'peso' => 30.00, 'descripcion' => 'Introducción a la computación y algoritmos'],
            ['codigo' => 'ING', 'nombre' => 'Inglés', 'peso' => 10.00, 'descripcion' => 'Comprensión lectora y gramática básica del inglés'],
        ]);

        Requisito::insertOrIgnore([
            ['nombre' => 'Título Bachiller', 'descripcion' => 'Título de bachiller otorgado por unidad educativa reconocida'],
            ['nombre' => 'Certificado de Nacimiento', 'descripcion' => 'Certificado de nacimiento original o computarizado'],
            ['nombre' => 'Cédula de Identidad', 'descripcion' => 'Fotocopia de cédula de identidad vigente'],
            ['nombre' => 'Fotografías', 'descripcion' => 'Tres fotografías 4x4 fondo azul'],
            ['nombre' => 'Examen Médico', 'descripcion' => 'Certificado de aptitud médica'],
        ]);

        Aula::insertOrIgnore([
            ['nro' => '101', 'piso' => 1, 'capacidad' => 70],
            ['nro' => '102', 'piso' => 1, 'capacidad' => 70],
            ['nro' => '103', 'piso' => 1, 'capacidad' => 70],
            ['nro' => '104', 'piso' => 1, 'capacidad' => 70],
            ['nro' => '201', 'piso' => 2, 'capacidad' => 70],
            ['nro' => '202', 'piso' => 2, 'capacidad' => 70],
            ['nro' => '203', 'piso' => 2, 'capacidad' => 70],
            ['nro' => '204', 'piso' => 2, 'capacidad' => 70],
            ['nro' => 'LAB-1', 'piso' => 3, 'capacidad' => 35],
            ['nro' => 'LAB-2', 'piso' => 3, 'capacidad' => 35],
            ['nro' => 'LAB-3', 'piso' => 3, 'capacidad' => 35],
            ['nro' => 'LAB-4', 'piso' => 3, 'capacidad' => 35],
        ]);

        $this->command->info('Catálogos creados: carreras, turnos, semestres, admisiones, materias, requisitos, aulas.');
    }
}
