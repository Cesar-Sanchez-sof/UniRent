<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alquiler;
use App\Models\Publicacion;
use App\Models\Incidencia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AlquilerController extends Controller
{
    /**
     * Obtiene los alquileres que otros usuarios han solicitado de mis productos.
     */
    public function incomingRentals(Request $request)
    {
        $user = $request->user();
        
        $solicitudes = Alquiler::with(['publicacion.imagenes', 'usuario', 'resenas'])
            ->whereHas('publicacion', function ($query) use ($user) {
                $query->where('id_usuario', $user->id_usuario);
            })
            ->orderBy('fecha_registro', 'desc')
            ->get();

        return response()->json($solicitudes);
    }

    /**
     * Actualiza el estado de una solicitud de alquiler.
     */
    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();
        $alquiler = Alquiler::whereHas('publicacion', function ($q) use ($user) {
            $q->where('id_usuario', $user->id_usuario);
        })->find($id);

        if (!$alquiler) {
            return response()->json(['message' => 'Solicitud no encontrada'], 404);
        }

        $validator = Validator::make($request->all(), [
            'estado' => 'required|in:Pendiente,Activo,Finalizado,Cancelado'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $alquiler->update(['estado' => $request->estado]);

        // Notificar al cliente sobre el cambio de estado
        \App\Models\Notificacion::create([
            'id_usuario' => $alquiler->id_usuario_cliente,
            'id_alquiler' => $alquiler->id_alquiler,
            'titulo' => 'Actualización de Alquiler',
            'mensaje' => "Tu solicitud para '{$alquiler->publicacion->titulo}' ha sido marcada como: {$request->estado}.",
            'leido' => false
        ]);

        return response()->json(['message' => "Solicitud actualizada a {$request->estado}"]);
    }

    /**
     * Obtiene los alquileres solicitados por el usuario autenticado.
     */
    public function myRentals(Request $request)
    {
        $user = $request->user();
        
        $alquileres = Alquiler::with(['publicacion.imagenes', 'publicacion.usuario', 'publicacion.distrito', 'resenas'])
            ->where('id_usuario_cliente', $user->id_usuario)
            ->orderBy('fecha_registro', 'desc')
            ->get();

        return response()->json($alquileres);
    }

    /**
     * Obtiene todos los rangos de fechas ya reservados para un producto.
     */
    public function getBookedDates($id)
    {
        $alquileres = Alquiler::where('id_publicacion', $id)
            ->whereIn('estado', ['Pendiente', 'Activo'])
            ->select('fecha_alquiler as from', 'fecha_devolucion as to')
            ->get();

        return response()->json($alquileres);
    }

    /**
     * Registra una nueva solicitud de alquiler según el SQL NextUs.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // VALIDACIÓN DE SEGURIDAD: Máximo 3 incidencias para permitir alquilar
        $incidenciasActivas = Incidencia::where('id_usuario_reportado', $user->id_usuario)
            ->where('estado', '!=', 'Desestimada')
            ->count();

        if ($incidenciasActivas >= 3) {
            return response()->json([
                'message' => 'Tu cuenta tiene restricciones de alquiler debido a 3 o más incidencias reportadas. Por favor, contacta a soporte.',
                'code' => 'USER_BANNED_BY_INCIDENTS'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'id_publicacion' => 'required|exists:publicacion,id_publicacion',
            'fec_inicio' => 'required|date|after_or_equal:today',
            'fec_fin' => 'required|date|after_or_equal:fec_inicio',
            'monto_total' => 'required|numeric',
            'monto_garantia' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $user = $request->user();

            // 1. Verificar traslape de fechas
            // Solo bloquean las fechas los alquileres que NO están Cancelados ni Finalizados
            $existeTraslape = Alquiler::where('id_publicacion', $request->id_publicacion)
                ->whereIn('estado', ['Pendiente', 'Activo']) 
                ->where(function ($query) use ($request) {
                    $query->where(function ($q) use ($request) {
                        $q->where('fecha_alquiler', '<=', $request->fec_fin)
                          ->where('fecha_devolucion', '>=', $request->fec_inicio);
                    });
                })
                ->exists();

            if ($existeTraslape) {
                return response()->json([
                    'message' => 'El artículo ya está reservado para algunas de las fechas seleccionadas.'
                ], 409); // Conflict
            }

            // Obtener el dueño del artículo
            $publicacion = Publicacion::findOrFail($request->id_publicacion);
            $idDueno = $publicacion->id_usuario;

            // Crear el alquiler
            $alquiler = Alquiler::create([
                'id_publicacion' => $request->id_publicacion,
                'id_usuario_cliente' => $user->id_usuario,
                'fecha_alquiler' => $request->fec_inicio,
                'fecha_devolucion' => $request->fec_fin,
                'monto_total' => $request->monto_total,
                'monto_seguro' => $request->monto_garantia,
                'estado' => 'Pendiente'
            ]);

            // Notificar al DUEÑO
            \App\Models\Notificacion::create([
                'id_usuario' => $idDueno,
                'id_alquiler' => $alquiler->id_alquiler,
                'titulo' => 'Nueva Solicitud Recibida',
                'mensaje' => "{$user->primer_nombre} quiere alquilar tu '{$publicacion->titulo}'.",
                'leido' => false
            ]);

            return response()->json([

                'message' => '¡Solicitud de alquiler registrada con éxito!',
                'id_alquiler' => $alquiler->id_alquiler
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al registrar el alquiler',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
