<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use Illuminate\Http\Request;

class NotificacionController extends Controller
{
    public function index(Request $request)
    {
        try {
            $notificaciones = Notificacion::where('id_usuario', $request->user()->id_usuario)
                ->orderBy('id_notificacion', 'desc')
                ->limit(20)
                ->get();

            return response()->json($notificaciones);
        } catch (\Throwable $e) {
            return response()->json([]);
        }
    }

    public function markAsRead(Request $request, $id)
    {
        try {
            $notificacion = Notificacion::where('id_usuario', $request->user()->id_usuario)
                ->find($id);

            if ($notificacion) {
                $notificacion->update(['leido' => true]);
            }
        } catch (\Throwable $e) {}

        return response()->json(['message' => 'Notificación leída']);
    }

    public function markAllAsRead(Request $request)
    {
        try {
            Notificacion::where('id_usuario', $request->user()->id_usuario)
                ->where('leido', false)
                ->update(['leido' => true]);
        } catch (\Throwable $e) {}

        return response()->json(['message' => 'Todas leídas']);
    }
}
