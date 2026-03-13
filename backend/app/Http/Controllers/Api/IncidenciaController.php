<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Incidencia;
use Illuminate\Http\Request;

class IncidenciaController extends Controller
{
    /**
     * Listar incidencias reportadas contra el usuario autenticado.
     */
    public function index()
    {
        $incidencias = Incidencia::where('id_usuario_reportado', auth()->id())
            ->with(['alquiler.publicacion', 'usuarioReportante', 'resena'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($incidencias);
    }

    /**
     * Obtener el conteo de incidencias para mostrar un badge en el perfil.
     */
    public function count()
    {
        $count = Incidencia::where('id_usuario_reportado', auth()->id())
            ->where('estado', '!=', 'Desestimada')
            ->count();

        return response()->json(['count' => $count]);
    }

    /**
     * (Opcional) El usuario reportado podría subir evidencias para defenderse.
     */
    public function uploadEvidence(Request $request, $id)
    {
        $request->validate([
            'foto' => 'required|image|max:5120',
        ]);

        $incidencia = Incidencia::findOrFail($id);
        
        if ($incidencia->id_usuario_reportado !== auth()->id()) {
            return response()->json(['message' => 'No tienes permiso.'], 403);
        }

        $path = $request->file('foto')->store('incidencias', 'public');
        
        $evidencias = $incidencia->evidencias ?? [];
        $evidencias[] = $path;
        
        $incidencia->update(['evidencias' => $evidencias]);

        return response()->json(['message' => 'Evidencia subida.', 'path' => $path]);
    }
}
