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
            $path = $request->file('foto')->store('comprobantes', 'public');
            $solicitud->comprobante_url = $path;
            $solicitud->save();
        }

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
