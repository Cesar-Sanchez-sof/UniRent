<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alquiler;
use App\Models\Resena;
use App\Models\User;
use App\Models\Incidencia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ResenaController extends Controller
{
    /**
     * Almacena una nueva reseña (puede ser de Cliente a Dueño o de Dueño a Cliente).
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_alquiler' => 'required|exists:alquiler,id_alquiler',
            'calificacion' => 'required|numeric|min:1|max:5',
            'comentario' => 'required|string|max:255',
            'tipo' => 'required|in:cliente,dueno', // cliente califica a dueño, dueno califica a cliente
        ]);

        $alquiler = Alquiler::with('publicacion')->findOrFail($request->id_alquiler);
        $userId = auth()->id();

        // VALIDACIONES DE PERMISOS
        if ($request->tipo === 'cliente') {
            if ($alquiler->id_usuario_cliente !== $userId) {
                return response()->json(['message' => 'No eres el cliente de este alquiler.'], 403);
            }
        } else {
            if ($alquiler->publicacion->id_usuario !== $userId) {
                return response()->json(['message' => 'No eres el dueño de este artículo.'], 403);
            }
        }

        // VALIDAR QUE NO EXISTA YA ESA RESEÑA
        $exists = Resena::where('id_alquiler', $request->id_alquiler)
                        ->where('tipo', $request->tipo)
                        ->exists();
        
        if ($exists) {
            return response()->json(['message' => 'Ya has calificado esta parte del proceso.'], 400);
        }

        return DB::transaction(function () use ($request, $alquiler) {
            $resena = Resena::create([
                'id_alquiler' => $request->id_alquiler,
                'calificacion' => $request->calificacion,
                'comentario' => $request->comentario,
                'tipo' => $request->tipo,
            ]);

            if ($request->tipo === 'cliente') {
                // Cliente califica -> Actualizamos puntaje_dueno del Dueño
                $targetUser = User::find($alquiler->publicacion->id_usuario);
                if ($targetUser) {
                    $avg = Resena::where('tipo', 'cliente')
                        ->whereHas('alquiler.publicacion', function($q) use ($targetUser) {
                            $q->where('id_usuario', $targetUser->id_usuario);
                        })->avg('calificacion');
                    $targetUser->update(['puntaje_dueno' => $avg]);
                }
            } else {
                // Dueño califica -> Actualizamos puntaje_arrendador del Cliente
                $targetUser = User::find($alquiler->id_usuario_cliente);
                if ($targetUser) {
                    $avg = Resena::where('tipo', 'dueno')
                        ->whereHas('alquiler', function($q) use ($targetUser) {
                            $q->where('id_usuario_cliente', $targetUser->id_usuario);
                        })->avg('calificacion');
                    $targetUser->update(['puntaje_arrendador' => $avg]);

                    // LOGICA DE INCIDENCIAS AUTOMATICAS
                    if ($request->calificacion <= 2) {
                        Incidencia::create([
                            'id_alquiler' => $request->id_alquiler,
                            'id_usuario_reportado' => $targetUser->id_usuario,
                            'id_usuario_reportante' => auth()->id(),
                            'id_resena' => $resena->id_resena,
                            'descripcion' => $request->comentario,
                            'gravedad' => ($request->calificacion == 1) ? 'Alta' : 'Media',
                            'estado' => 'Pendiente'
                        ]);
                    }
                }
            }

            return response()->json([
                'message' => 'Calificación guardada correctamente.',
                'resena' => $resena
            ], 201);
        });
    }

    /**
     * Obtiene solo las reseñas de clientes (para mostrar en el detalle del producto).
     */
    public function getByPublicacion($id_publicacion)
    {
        $resenas = Resena::where('tipo', 'cliente')
            ->whereHas('alquiler', function($query) use ($id_publicacion) {
                $query->where('id_publicacion', $id_publicacion);
            })->with('alquiler.usuario')->get();

        return response()->json($resenas);
    }
}
