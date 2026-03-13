<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Departamento;
use App\Models\Provincia;
use App\Models\Distrito;
use Illuminate\Http\Request;

class UbicacionController extends Controller
{
    public function getDepartamentos()
    {
        $data = Departamento::orderBy('nombre')->get();
        return response()->json($data);
    }

    public function getProvincias($id_departamento)
    {
        $data = Provincia::where('id_departamento', $id_departamento)
                ->orderBy('nombre')
                ->get();
        return response()->json($data);
    }

    public function getDistritos($id_provincia)
    {
        $data = Distrito::where('id_provincia', $id_provincia)
                ->orderBy('nombre')
                ->get();
        return response()->json($data);
    }
}
