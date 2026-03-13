<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UniversidadSeeder extends Seeder
{
    /**
     * Corre el seeder de universidades con nombres cortos para que quepan en varchar(15)
     * si es que no has agrandado la columna todavía.
     */
    public function run(): void
    {
        // Limpiamos la tabla antes de insertar
        DB::table('public.universidad')->delete();

        DB::table('public.universidad')->insert([
            [
                'nombre' => 'UNMSM',
                'sedes'  => 'Lima Centro',
            ],
            [
                'nombre' => 'PUCP',
                'sedes'  => 'San Miguel',
            ],
            [
                'nombre' => 'U de Lima',
                'sedes'  => 'Surco',
            ],
            [
                'nombre' => 'UNI',
                'sedes'  => 'Rimac',
            ],
            [
                'nombre' => 'UPC',
                'sedes'  => 'Monterrico',
            ],
        ]);
    }
}
