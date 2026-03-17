<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Publicacion;
use App\Models\Imagen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PublicacionController extends Controller
{
    /**
     * Muestra una lista de todas las publicaciones activas.
     */
    public function index(Request $request)
    {
        $query = Publicacion::with(['imagenes', 'categoria', 'usuario', 'distrito'])
            ->where('estado', true)
            ->whereHas('usuario', function ($q) {
                $q->where('deuda', '<=', 50);
            });

        // Filtrar por Búsqueda (LIKE)
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = '%' . $request->search . '%';
            $query->where('titulo', 'ILIKE', $searchTerm); // ILIKE para búsqueda insensible a mayúsculas en Postgres
        }

        // Filtrar por Categoría
        if ($request->has('id_categoria')) {
            $query->where('id_categoria', $request->id_categoria);
        }

        // Si el usuario está logueado, excluimos sus publicaciones
        if ($user = auth('sanctum')->user()) {
            $query->where('id_usuario', '!=', $user->id_usuario);
        }

        $publicaciones = $query->latest('id_publicacion')->get();

        return response()->json($publicaciones);
    }

    /**
     * Muestra el detalle de una publicación específica.
     */
    public function show($id)
    {
        $publicacion = Publicacion::with(['imagenes', 'categoria', 'usuario', 'distrito'])
            ->find($id);

        if (!$publicacion) {
            return response()->json(['message' => 'Publicación no encontrada'], 404);
        }

        if ($publicacion->usuario && $publicacion->usuario->deuda > 50) {
            return response()->json(['message' => 'El artículo no está disponible en este momento.'], 403);
        }

        return response()->json($publicacion);
    }

    /**
     * Obtiene las publicaciones activas del usuario autenticado.
     */
    public function myPublications(Request $request)
    {
        try {
            $user = $request->user();
            $publicaciones = Publicacion::with(['imagenes', 'categoria', 'distrito', 'usuario'])
                ->where('id_usuario', $user->id_usuario)
                ->where('estado', true)
                ->orderBy('id_publicacion', 'desc')
                ->get();

            return response()->json($publicaciones);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error interno al obtener publicaciones',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Guarda una nueva publicación.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->deuda > 50) {
            return response()->json(['message' => 'Deuda pendiente mayor a S/ 50.00'], 403);
        }

        $validator = Validator::make($request->all(), [
            'titulo' => 'required|string|max:80',
            'descripcion' => 'required|string|max:500',
            'precio_dia' => 'required|numeric|min:1',
            'condicion' => 'required|string|max:50',
            'id_distrito' => 'required|exists:distrito,id_distrito',
            'id_categoria' => 'required|string',
            'imagenes' => 'required|array|min:1|max:8',
            'imagenes.*' => 'image|mimes:jpeg,png,jpg,webp|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $publicacion = Publicacion::create([
                'titulo' => $request->titulo,
                'descripcion' => $request->descripcion,
                'precio_dia' => $request->precio_dia,
                'condicion' => $request->condicion,
                'id_distrito' => $request->id_distrito,
                'estado' => true, 
                'id_usuario' => $user->id_usuario,
                'id_categoria' => $this->mapCategoryToId($request->id_categoria)
            ]);

            if ($request->hasFile('imagenes')) {
                foreach ($request->file('imagenes') as $index => $file) {
                    $filename = 'pub_' . $publicacion->id_publicacion . '_' . time() . '_' . $index . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('publicaciones', $filename, 's3');
                    Imagen::create(['url_photo' => $path, 'id_publicacion' => $publicacion->id_publicacion]);
                }
            }

            DB::commit();
            return response()->json(['message' => '¡Artículo publicado!', 'publicacion_id' => $publicacion->id_publicacion], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al guardar', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Actualiza una publicación existente.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $publicacion = Publicacion::where('id_usuario', $user->id_usuario)->find($id);

        if (!$publicacion) {
            return response()->json(['message' => 'No encontrada'], 404);
        }

        try {
            $publicacion->update([
                'titulo' => $request->titulo,
                'descripcion' => $request->descripcion,
                'precio_dia' => $request->precio_dia,
                'condicion' => $request->condicion,
                'id_categoria' => $request->id_categoria ? $this->mapCategoryToId($request->id_categoria) : $publicacion->id_categoria
            ]);

            return response()->json(['message' => 'Actualizada con éxito']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al actualizar', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Elimina una publicación (Soft Delete).
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $publicacion = Publicacion::where('id_usuario', $user->id_usuario)->find($id);

        if (!$publicacion) {
            return response()->json(['message' => 'No encontrada'], 404);
        }

        $publicacion->update(['estado' => false]);
        return response()->json(['message' => 'Publicación ocultada correctamente']);
    }

    /**
     * Mapeo de categorías.
     */
    private function mapCategoryToId($categorySlug)
    {
        $map = [
            'tech' => 1, 'books' => 2, 'photo' => 3, 'art' => 4, 'tools' => 5, 'sports' => 6,
        ];
        return $map[$categorySlug] ?? (is_numeric($categorySlug) ? $categorySlug : 1);
    }
}
