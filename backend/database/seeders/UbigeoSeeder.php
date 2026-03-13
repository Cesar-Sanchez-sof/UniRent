<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class UbigeoSeeder extends Seeder
{
    public function run()
    {
        $baseUrl = "https://raw.githubusercontent.com/RitchieRD/ubigeos-peru-data/main/json/";
        
        try {
            // 1. Departamentos
            $this->command->info("Descargando departamentos...");
            $resDepts = Http::withOptions(['verify' => false])->get($baseUrl . "1_ubigeo_departamentos.json")->json();
            $depts = $resDepts['ubigeo_departamentos']; // Extraer del objeto
            
            $insertDepts = array_map(fn($d) => [
                'id_departamento' => $d['ubigeo'],
                'nombre' => mb_convert_case($d['departamento'], MB_CASE_TITLE, "UTF-8")
            ], $depts);
            DB::table('departamento')->insert($insertDepts);

            // 2. Provincias
            $this->command->info("Descargando provincias...");
            $resProvs = Http::withOptions(['verify' => false])->get($baseUrl . "2_ubigeo_provincias.json")->json();
            $provs = $resProvs['ubigeo_provincias'];
            
            $insertProvs = array_map(fn($p) => [
                'id_provincia' => $p['ubigeo'],
                'nombre' => mb_convert_case($p['provincia'], MB_CASE_TITLE, "UTF-8"),
                'id_departamento' => substr($p['ubigeo'], 0, 2) // Los primeros 2 dígitos son el departamento
            ], $provs);
            foreach (array_chunk($insertProvs, 100) as $chunk) {
                DB::table('provincia')->insert($chunk);
            }

            // 3. Distritos
            $this->command->info("Descargando distritos (+1,800)...");
            $resDists = Http::withOptions(['verify' => false])->get($baseUrl . "3_ubigeo_distritos.json")->json();
            $distritos = $resDists['ubigeo_distritos'];
            
            $insertDists = array_map(fn($dist) => [
                'id_distrito' => $dist['ubigeo'],
                'nombre' => mb_convert_case($dist['distrito'], MB_CASE_TITLE, "UTF-8"),
                'id_provincia' => substr($dist['ubigeo'], 0, 4) // Los primeros 4 dígitos son la provincia
            ], $distritos);
            foreach (array_chunk($insertDists, 100) as $chunk) {
                DB::table('distrito')->insert($chunk);
            }

            $this->command->info("¡Todo el Perú cargado con éxito!");

        } catch (\Exception $e) {
            $this->command->error("Error cargando Ubigeo: " . $e->getMessage());
        }
    }
}
