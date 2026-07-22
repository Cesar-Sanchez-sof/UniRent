<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PublicacionController;
use App\Http\Controllers\Api\UbicacionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/**
 * Rutas de Autenticación Públicas
 */
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/universidades', [AuthController::class, 'getUniversidades']);

/**
 * Rutas Protegidas (Requieren Token)
 */
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        // Cargamos la relación con universidad para tener el nombre completo
        return $request->user()->load('universidad');
    });
    Route::post('/user/update', [AuthController::class, 'updateProfile']);
    Route::post('/user/upload-photo', [AuthController::class, 'uploadPhoto']);
    Route::post('/user/change-password', [AuthController::class, 'changePassword']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Publicaciones protegidas
    Route::get('/user/publicaciones', [PublicacionController::class, 'myPublications']);
    Route::post('/publicaciones', [PublicacionController::class, 'store']);
    Route::post('/publicaciones/{id}', [PublicacionController::class, 'update']); // Usamos POST para soportar FormData con imágenes
    Route::delete('/publicaciones/{id}', [PublicacionController::class, 'destroy']);

    // Alquileres
    Route::get('/user/alquileres', [\App\Http\Controllers\Api\AlquilerController::class, 'myRentals']);
    Route::get('/user/solicitudes', [\App\Http\Controllers\Api\AlquilerController::class, 'incomingRentals']);
    Route::patch('/alquileres/{id}/status', [\App\Http\Controllers\Api\AlquilerController::class, 'updateStatus']);
    Route::post('/alquileres', [\App\Http\Controllers\Api\AlquilerController::class, 'store']);

    // Notificaciones
    Route::get('/notifications', [\App\Http\Controllers\Api\NotificacionController::class, 'index']);
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\Api\NotificacionController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [\App\Http\Controllers\Api\NotificacionController::class, 'markAllAsRead']);

    // Reseñas
    Route::post('/resenas', [\App\Http\Controllers\Api\ResenaController::class, 'store']);

    // Incidencias
    Route::get('/user/incidencias', [\App\Http\Controllers\Api\IncidenciaController::class, 'index']);
    Route::get('/user/incidencias/count', [\App\Http\Controllers\Api\IncidenciaController::class, 'count']);
    Route::post('/incidencias', [\App\Http\Controllers\Api\IncidenciaController::class, 'store']);
    Route::post('/incidencias/{id}/evidence', [\App\Http\Controllers\Api\IncidenciaController::class, 'uploadEvidence']);

    // Solicitudes de Pago
    Route::get('/user/solicitudes-pago', [\App\Http\Controllers\Api\SolicitudPagoController::class, 'index']);
    Route::post('/solicitudes-pago', [\App\Http\Controllers\Api\SolicitudPagoController::class, 'store']);

    // Rutas Administrativas
    Route::get('/admin/metrics', [\App\Http\Controllers\Api\AdminController::class, 'getMetrics']);
    Route::get('/admin/users-debt', [\App\Http\Controllers\Api\AdminController::class, 'getUsersDebt']);
    Route::post('/admin/users-debt/{id}', [\App\Http\Controllers\Api\AdminController::class, 'updateUserDebt']);
    Route::get('/admin/incidencias', [\App\Http\Controllers\Api\AdminController::class, 'getIncidencias']);
    Route::patch('/admin/incidencias/{id}/status', [\App\Http\Controllers\Api\AdminController::class, 'updateIncidenciaStatus']);
    Route::get('/admin/solicitudes-pago', [\App\Http\Controllers\Api\AdminController::class, 'getSolicitudesPago']);
    Route::post('/admin/solicitudes-pago/{id}/procesar', [\App\Http\Controllers\Api\AdminController::class, 'processSolicitudPago']);
    
    // CRUD Categorías Admin
    Route::post('/admin/categorias', [\App\Http\Controllers\Api\AdminController::class, 'storeCategoria']);
    Route::put('/admin/categorias/{id}', [\App\Http\Controllers\Api\AdminController::class, 'updateCategoria']);
    Route::delete('/admin/categorias/{id}', [\App\Http\Controllers\Api\AdminController::class, 'destroyCategoria']);

    // CRUD Universidades Admin
    Route::post('/admin/universidades', [\App\Http\Controllers\Api\AdminController::class, 'storeUniversidad']);
    Route::put('/admin/universidades/{id}', [\App\Http\Controllers\Api\AdminController::class, 'updateUniversidad']);
    Route::delete('/admin/universidades/{id}', [\App\Http\Controllers\Api\AdminController::class, 'destroyUniversidad']);
});

/**
 * Rutas públicas de productos
 */
Route::get('/publicaciones', [PublicacionController::class, 'index']);
Route::get('/categorias', [PublicacionController::class, 'getCategorias']);
Route::get('/publicaciones/{id}', [PublicacionController::class, 'show']);
Route::get('/publicaciones/{id}/booked-dates', [\App\Http\Controllers\Api\AlquilerController::class, 'getBookedDates']);
Route::get('/publicaciones/{id}/resenas', [\App\Http\Controllers\Api\ResenaController::class, 'getByPublicacion']);

/**
 * Rutas de Ubicación (Ubigeo)
 */
Route::get('/ubicaciones/departamentos', [UbicacionController::class, 'getDepartamentos']);
Route::get('/ubicaciones/provincias/{departamento_id}', [UbicacionController::class, 'getProvincias']);
Route::get('/ubicaciones/distritos/{provincia_id}', [UbicacionController::class, 'getDistritos']);
