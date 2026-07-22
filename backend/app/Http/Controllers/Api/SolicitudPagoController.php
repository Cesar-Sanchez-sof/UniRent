<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SolicitudPago;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SolicitudPagoController extends Controller
{
    /**
     * Crear una solicitud de pago.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'monto' => 'required|numeric|min:0.01',
            'nro_operacion' => 'required|string|max:100',
            'foto' => 'nullable|image|max:5120', // máximo 5MB
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        // Validar que tenga deuda
        if ((float)($user->deuda ?? 0) <= 0) {
            return response()->json(['message' => 'No registras deudas pendientes.'], 400);
        }

        // Crear la solicitud
        $solicitud = SolicitudPago::create([
            'id_usuario' => $user->id_usuario,
            'monto' => $request->monto,
            'nro_operacion' => $request->nro_operacion,
            'estado' => 'Pendiente',
        ]);

        // Guardar comprobante si se sube directamente
        if ($request->hasFile('foto')) {
            $file = $request->file('foto');
            $ext = $file->getClientOriginalExtension() ?: 'jpg';
            $filename = 'pay_' . $solicitud->id_solicitud . '_' . time() . '.' . $ext;
            
            $fullUrl = null;

            // 1. Intentar subir al bucket S3 / Supabase Storage si está configurado
            try {
                if (config('filesystems.disks.s3.key') && config('filesystems.disks.s3.bucket')) {
                    $path = $file->storeAs('comprobantes', $filename, 's3');
                    $s3BaseUrl = config('filesystems.disks.s3.url') ?: "https://khagadpjvxmzrouelwpu.storage.supabase.co/storage/v1/object/public/nex-us";
                    $fullUrl = rtrim($s3BaseUrl, '/') . '/' . ltrim($path, '/');
                }
            } catch (\Throwable $s3Err) {}

            // 2. Si S3 no está activo o falla, guardar en el disco público de Laravel
            if (!$fullUrl) {
                try {
                    $path = $file->storeAs('comprobantes', $filename, 'public');
                    $fullUrl = $path; // Guardamos ruta relativa
                } catch (\Throwable $localErr) {
                    $fullUrl = null;
                }
            }

            if ($fullUrl) {
                $solicitud->comprobante_url = $fullUrl;
                $solicitud->save();
            }
        }

        // Notificar a todos los administradores del sistema
        try {
            $admins = \App\Models\User::where('is_admin', true)
                ->orWhere('correo', 'admin@unirent.com')
                ->get();

            foreach ($admins as $admin) {
                \App\Models\Notificacion::create([
                    'id_usuario' => $admin->id_usuario,
                    'titulo' => 'Nueva Solicitud de Pago',
                    'mensaje' => "El usuario @{$user->username} ha registrado una solicitud de pago por S/ " . number_format($solicitud->monto, 2) . " (Op: {$solicitud->nro_operacion}).",
                    'leido' => false
                ]);
            }
        } catch (\Exception $e) {}

        return response()->json([
            'message' => 'Solicitud de pago registrada con éxito. Pendiente de aprobación.',
            'solicitud' => $solicitud
        ], 201);
    }

    /**
     * Obtener el historial de solicitudes de pago del usuario autenticado.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $solicitudes = SolicitudPago::where('id_usuario', $user->id_usuario)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($solicitudes);
    }
}
