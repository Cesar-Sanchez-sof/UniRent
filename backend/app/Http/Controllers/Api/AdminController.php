<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Publicacion;
use App\Models\Alquiler;
use App\Models\Incidencia;
use App\Models\Categoria;
use App\Models\Universidad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    /**
     * Verificar que el usuario sea administrador.
     */
    private function checkAdmin(Request $request)
    {
        $user = $request->user();
        if (!$user || !$user->isAdmin()) {
            abort(response()->json(['message' => 'No autorizado. Se requieren permisos de administrador.'], 403));
        }
    }

    /**
     * Obtener métricas generales para el dashboard.
     */
    public function getMetrics(Request $request)
    {
        $this->checkAdmin($request);

        $totalUsers = User::count();
        $totalPublications = Publicacion::count();
        $totalRentals = Alquiler::count();
        
        // Comisiones generadas: 30% del subtotal (monto_total - monto_seguro) en alquileres Aceptados/Activos/Finalizados
        $totalCommissions = Alquiler::whereIn('estado', ['Activo', 'Finalizado'])
            ->selectRaw('SUM((monto_total - monto_seguro) * 0.30) as total')
            ->first()
            ->total ?? 0.00;

        $activeIncidents = Incidencia::whereIn('estado', ['Pendiente', 'En Revision'])->count();

        // Distribución de publicaciones por categoría
        $categoriesDistribution = Categoria::select('categoria.id_categoria', 'categoria.nombre')
            ->selectRaw('COUNT(publicacion.id_publicacion) as count')
            ->leftJoin('publicacion', 'categoria.id_categoria', '=', 'publicacion.id_categoria')
            ->groupBy('categoria.id_categoria', 'categoria.nombre')
            ->get();

        // Alquileres por estado
        $rentalsByStatus = Alquiler::select('estado', DB::raw('count(*) as count'))
            ->groupBy('estado')
            ->get();

        return response()->json([
            'metrics' => [
                'total_usuarios' => $totalUsers,
                'total_publicaciones' => $totalPublications,
                'total_alquileres' => $totalRentals,
                'total_comisiones' => (float)$totalCommissions,
                'incidencias_activas' => $activeIncidents,
            ],
            'categories_distribution' => $categoriesDistribution,
            'rentals_status' => $rentalsByStatus
        ]);
    }

    /**
     * Obtener la lista de usuarios y sus deudas.
     */
    public function getUsersDebt(Request $request)
    {
        $this->checkAdmin($request);

        $users = User::select('id_usuario', 'primer_nombre', 'primer_apellido', 'username', 'correo', 'deuda', 'telefono')
            ->orderBy('deuda', 'desc')
            ->orderBy('primer_nombre', 'asc')
            ->get();

        return response()->json($users);
    }

    /**
     * Modificar la deuda de un usuario manualmente (Cobranzas).
     */
    public function updateUserDebt(Request $request, $id)
    {
        $this->checkAdmin($request);

        $validator = Validator::make($request->all(), [
            'deuda' => 'required|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::findOrFail($id);
        $user->deuda = $request->deuda;
        $user->save();

        // Enviar notificación al usuario sobre la actualización de su deuda
        try {
            \App\Models\Notificacion::create([
                'id_usuario' => $user->id_usuario,
                'titulo' => 'Actualización de Cuenta',
                'mensaje' => "El administrador ha actualizado tu estado de cuenta. Tu deuda actual es de S/ " . number_format($request->deuda, 2),
                'leido' => false
            ]);
        } catch (\Exception $e) {}

        return response()->json([
            'message' => 'Deuda de usuario actualizada con éxito.',
            'user' => $user
        ]);
    }

    /**
     * Obtener todas las incidencias (Libro de Reclamaciones).
     */
    public function getIncidencias(Request $request)
    {
        $this->checkAdmin($request);

        $incidencias = Incidencia::with([
            'alquiler.publicacion',
            'usuarioReportante',
            'usuarioReportado'
        ])->orderBy('created_at', 'desc')->get();

        return response()->json($incidencias);
    }

    /**
     * Cambiar el estado o gravedad de una incidencia.
     */
    public function updateIncidenciaStatus(Request $request, $id)
    {
        $this->checkAdmin($request);

        $validator = Validator::make($request->all(), [
            'estado' => 'nullable|in:Pendiente,En Revision,Resuelta,Desestimada',
            'gravedad' => 'nullable|in:Baja,Media,Alta'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $incidencia = Incidencia::findOrFail($id);

        if ($request->has('estado')) {
            $incidencia->estado = $request->estado;
        }

        if ($request->has('gravedad')) {
            $incidencia->gravedad = $request->gravedad;
        }

        $incidencia->updated_at = now();
        $incidencia->save();

        // Notificar a las partes sobre el cambio de estado
        try {
            $mensaje = "El reclamo asociado al alquiler de '{$incidencia->alquiler->publicacion->titulo}' ha cambiado a estado: {$incidencia->estado}.";
            
            // Notificar al reportante
            \App\Models\Notificacion::create([
                'id_usuario' => $incidencia->id_usuario_reportante,
                'id_alquiler' => $incidencia->id_alquiler,
                'titulo' => 'Actualización de Reclamo',
                'mensaje' => $mensaje,
                'leido' => false
            ]);

            // Notificar al reportado
            \App\Models\Notificacion::create([
                'id_usuario' => $incidencia->id_usuario_reportado,
                'id_alquiler' => $incidencia->id_alquiler,
                'titulo' => 'Actualización de Reclamo',
                'mensaje' => $mensaje,
                'leido' => false
            ]);
        } catch (\Exception $e) {}

        return response()->json([
            'message' => 'Incidencia actualizada con éxito.',
            'incidencia' => $incidencia
        ]);
    }

    /**
     * Crear una nueva categoría.
     */
    public function storeCategoria(Request $request)
    {
        $this->checkAdmin($request);

        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:50|unique:categoria,nombre'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $categoria = Categoria::create([
            'nombre' => $request->nombre
        ]);

        return response()->json([
            'message' => 'Categoría creada con éxito.',
            'categoria' => $categoria
        ], 201);
    }

    /**
     * Actualizar una categoría.
     */
    public function updateCategoria(Request $request, $id)
    {
        $this->checkAdmin($request);

        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:50|unique:categoria,nombre,' . $id . ',id_categoria'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $categoria = Categoria::findOrFail($id);
        $categoria->nombre = $request->nombre;
        $categoria->save();

        return response()->json([
            'message' => 'Categoría actualizada con éxito.',
            'categoria' => $categoria
        ]);
    }

    /**
     * Eliminar una categoría.
     */
    public function destroyCategoria(Request $request, $id)
    {
        $this->checkAdmin($request);

        $categoria = Categoria::findOrFail($id);
        
        // Verificar si hay publicaciones con esta categoría
        $hasPublicaciones = Publicacion::where('id_categoria', $id)->exists();
        if ($hasPublicaciones) {
            return response()->json([
                'message' => 'No se puede eliminar la categoría porque tiene publicaciones asociadas.'
            ], 400);
        }

        $categoria->delete();

        return response()->json([
            'message' => 'Categoría eliminada con éxito.'
        ]);
    }

    /**
     * Crear una nueva universidad.
     */
    public function storeUniversidad(Request $request)
    {
        $this->checkAdmin($request);

        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:100',
            'sedes' => 'required|string|max:100'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $universidad = Universidad::create([
            'nombre' => $request->nombre,
            'sedes' => $request->sedes
        ]);

        return response()->json([
            'message' => 'Universidad creada con éxito.',
            'universidad' => $universidad
        ], 201);
    }

    /**
     * Actualizar una universidad.
     */
    public function updateUniversidad(Request $request, $id)
    {
        $this->checkAdmin($request);

        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:100',
            'sedes' => 'required|string|max:100'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $universidad = Universidad::findOrFail($id);
        $universidad->nombre = $request->nombre;
        $universidad->sedes = $request->sedes;
        $universidad->save();

        return response()->json([
            'message' => 'Universidad actualizada con éxito.',
            'universidad' => $universidad
        ]);
    }

    /**
     * Eliminar una universidad.
     */
    public function destroyUniversidad(Request $request, $id)
    {
        $this->checkAdmin($request);

        $universidad = Universidad::findOrFail($id);

        // Verificar si hay usuarios asociados
        $hasUsuarios = User::where('id_universidad', $id)->exists();
        if ($hasUsuarios) {
            return response()->json([
                'message' => 'No se puede eliminar la universidad porque tiene usuarios asociados.'
            ], 400);
        }

        $universidad->delete();

        return response()->json([
            'message' => 'Universidad eliminada con éxito.'
        ]);
    }

    /**
     * Obtener todas las solicitudes de pago de comisiones.
     */
    public function getSolicitudesPago(Request $request)
    {
        $this->checkAdmin($request);

        $solicitudes = \App\Models\SolicitudPago::with('usuario')
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($solicitudes);
    }

    /**
     * Procesar (Aprobar/Rechazar) una solicitud de pago.
     */
    public function processSolicitudPago(Request $request, $id)
    {
        $this->checkAdmin($request);

        $request->validate([
            'estado' => 'required|in:Aprobado,Rechazado'
        ]);

        $solicitud = \App\Models\SolicitudPago::findOrFail($id);
        $solicitud->estado = $request->estado;
        $solicitud->save();

        $user = \App\Models\User::findOrFail($solicitud->id_usuario);

        if ($request->estado === 'Aprobado') {
            // Modificar la deuda a 0!
            $user->deuda = 0.00;
            $user->save();

            // Notificar al usuario
            try {
                \App\Models\Notificacion::create([
                    'id_usuario' => $user->id_usuario,
                    'titulo' => 'Pago de Deuda Aprobado',
                    'mensaje' => "Tu comprobante de pago por S/ " . number_format($solicitud->monto, 2) . " (Nro. Op: {$solicitud->nro_operacion}) ha sido verificado. Tu deuda actual es S/ 0.00.",
                    'leido' => false
                ]);
            } catch (\Exception $e) {}
        } else {
            // Notificar rechazo
            try {
                \App\Models\Notificacion::create([
                    'id_usuario' => $user->id_usuario,
                    'titulo' => 'Pago de Deuda Rechazado',
                    'mensaje' => "Tu comprobante de pago por S/ " . number_format($solicitud->monto, 2) . " (Nro. Op: {$solicitud->nro_operacion}) fue rechazado. Por favor verifica los datos.",
                    'leido' => false
                ]);
            } catch (\Exception $e) {}
        }

        return response()->json([
            'message' => 'Solicitud de pago procesada con éxito.',
            'solicitud' => $solicitud,
            'user' => $user
        ]);
    }
}
