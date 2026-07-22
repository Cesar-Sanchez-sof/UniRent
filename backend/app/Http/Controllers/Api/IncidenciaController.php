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
        
        if ($incidencia->id_usuario_reportado !== auth()->id() && $incidencia->id_usuario_reportante !== auth()->id()) {
            return response()->json(['message' => 'No tienes permiso para subir evidencias a este reporte.'], 403);
        }

        $file = $request->file('foto');
        $ext = $file->getClientOriginalExtension() ?: 'jpg';
        $filename = 'inc_' . $incidencia->id_incidencia . '_' . time() . '.' . $ext;
        
        $fullUrl = null;

        // 1. Intentar subir al bucket S3 / Supabase Storage si está configurado
        try {
            if (config('filesystems.disks.s3.key') && config('filesystems.disks.s3.bucket')) {
                $path = $file->storeAs('incidencias', $filename, 's3');
                $s3BaseUrl = config('filesystems.disks.s3.url') ?: "https://khagadpjvxmzrouelwpu.storage.supabase.co/storage/v1/object/public/nex-us";
                $fullUrl = rtrim($s3BaseUrl, '/') . '/' . ltrim($path, '/');
            }
        } catch (\Throwable $s3Err) {}

        // 2. Si S3 no está activo o falla, guardar en el disco público de Laravel
        if (!$fullUrl) {
            try {
                $path = $file->storeAs('incidencias', $filename, 'public');
                $fullUrl = $path; // Guardamos ruta relativa
            } catch (\Throwable $localErr) {
                return response()->json(['message' => 'Error al almacenar el archivo.'], 500);
            }
        }

        $evidencias = $incidencia->evidencias ?? [];
        $evidencias[] = $fullUrl;
        
        $incidencia->update(['evidencias' => $evidencias]);

        return response()->json(['message' => 'Evidencia subida.', 'path' => $fullUrl]);
    }

    /**
     * Registrar una nueva incidencia (Libro de Reclamaciones).
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_alquiler' => 'nullable|exists:alquiler,id_alquiler',
            'descripcion' => 'required|string',
            'gravedad'    => 'required|in:Baja,Media,Alta',
        ]);

        $user = $request->user();
        $idAlquiler = null;
        $idUsuarioReportado = null;

        if ($request->filled('id_alquiler')) {
            $alquiler = \App\Models\Alquiler::with('publicacion')->findOrFail($request->id_alquiler);
            $idAlquiler = $alquiler->id_alquiler;

            // Validar que el usuario sea parte del alquiler
            $esDueno = $alquiler->publicacion->id_usuario === $user->id_usuario;
            $esCliente = $alquiler->id_usuario_cliente === $user->id_usuario;

            if (!$esDueno && !$esCliente) {
                return response()->json(['message' => 'No tienes permisos para reportar esta transacción.'], 403);
            }

            // El reportado es la otra persona en la transacción
            $idUsuarioReportado = $esCliente ? $alquiler->publicacion->id_usuario : $alquiler->id_usuario_cliente;
        }

        $incidencia = Incidencia::create([
            'id_alquiler'            => $idAlquiler,
            'id_usuario_reportado'   => $idUsuarioReportado,
            'id_usuario_reportante'  => $user->id_usuario,
            'descripcion'            => $request->descripcion,
            'estado'                 => 'Pendiente',
            'gravedad'               => $request->gravedad,
        ]);

        // Crear una notificación para el usuario reportado (si existe)
        if ($idUsuarioReportado) {
            try {
                \App\Models\Notificacion::create([
                    'id_usuario'  => $idUsuarioReportado,
                    'id_alquiler' => $idAlquiler,
                    'titulo'      => 'Nueva incidencia reportada',
                    'mensaje'     => "Se ha registrado un reclamo/incidencia sobre el alquiler de '{$alquiler->publicacion->titulo}'.",
                    'leido'       => false,
                ]);
            } catch (\Exception $e) {}
        }

        return response()->json([
            'message'    => 'Incidencia registrada con éxito.',
            'incidencia' => $incidencia,
        ], 201);
    }
}
