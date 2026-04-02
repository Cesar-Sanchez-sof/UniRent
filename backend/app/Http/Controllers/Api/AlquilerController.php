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
        
        // Buscamos el alquiler. Puede ser el dueño del producto o el cliente quien solicita el cambio.
        $alquiler = Alquiler::with(['publicacion.usuario', 'usuario'])->find($id);

        if (!$alquiler) {
            return response()->json(['message' => 'Solicitud no encontrada'], 404);
        }

        // Determinar roles
        $esDueno = $alquiler->publicacion->id_usuario === $user->id_usuario;
        $esCliente = $alquiler->id_usuario_cliente === $user->id_usuario;

        if (!$esDueno && !$esCliente) {
            return response()->json(['message' => 'No tienes permisos para esta acción'], 403);
        }

        $validator = Validator::make($request->all(), [
            'estado' => 'required|in:Pendiente,Activo,Finalizado,Cancelado'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $nuevoEstado = $request->estado;
        $estadoAnterior = $alquiler->estado;

        // Evitar procesar si el estado es el mismo
        if ($nuevoEstado === $estadoAnterior) {
            return response()->json(['message' => "La solicitud ya está en estado {$nuevoEstado}"]);
        }

        try {
            \Illuminate\Support\Facades\DB::beginTransaction();

            // Lógica de Deuda (30% comisión sobre el subtotal de días, excluyendo garantía)
            $subtotal = $alquiler->monto_total - $alquiler->monto_seguro;
            $comision = $subtotal * 0.30;
            $dueno = $alquiler->publicacion->usuario;

            // CASO 1: Se ACEPTA la solicitud (Pendiente -> Activo)
            if ($estadoAnterior === 'Pendiente' && $nuevoEstado === 'Activo') {
                if (!$esDueno) {
                    throw new \Exception("Solo el dueño puede aceptar la solicitud.");
                }
                // Sumar deuda al dueño
                $dueno->increment('deuda', $comision);
            }

            // CASO 2: Se CANCELA la solicitud (Activo -> Cancelado)
            if ($estadoAnterior === 'Activo' && $nuevoEstado === 'Cancelado') {
                if ($esCliente) {
                    // Si el CLIENTE cancela, se le quita la deuda al dueño (sin penalización para el dueño)
                    $dueno->decrement('deuda', $comision);
                }
                // Si el DUÑO cancela, NO se decrementa (se queda como penalización)
            }

            // Actualizar el estado
            $alquiler->update(['estado' => $nuevoEstado]);

            // Notificaciones
            $targetUserId = ($esDueno) ? $alquiler->id_usuario_cliente : $alquiler->publicacion->id_usuario;
            $targetRole = ($esDueno) ? "dueño" : "cliente";

            \App\Models\Notificacion::create([
                'id_usuario' => $targetUserId,
                'id_alquiler' => $alquiler->id_alquiler,
                'titulo' => 'Actualización de Alquiler',
                'mensaje' => "El {$targetRole} ha marcado '{$alquiler->publicacion->titulo}' como: {$nuevoEstado}.",
                'leido' => false
            ]);

            \Illuminate\Support\Facades\DB::commit();

            return response()->json([
                'message' => "Solicitud actualizada a {$nuevoEstado}",
                'deuda_actualizada' => $esDueno || $esCliente ? $dueno->deuda : null
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar el estado',
                'error' => $e->getMessage()
            ], 500);
        }
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
