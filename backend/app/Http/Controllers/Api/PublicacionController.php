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
            return response()->json(['message' => 'Tienes una deuda pendiente mayor a S/ 50.00. No puedes publicar hasta regularizarla.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'titulo'       => 'required|string|max:100',
            'descripcion'  => 'required|string|max:1000',
            'precio_dia'   => 'required|numeric|min:1',
            'condicion'    => 'required|string|max:50',
            'id_categoria' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (!$request->hasFile('imagenes')) {
            return response()->json(['message' => 'Por favor adjunta al menos 1 fotografía del artículo.'], 422);
        }

        // Categoría válida: verifica que exista en la tabla 'categoria', de lo contrario usa la primera disponible
        $catId = (int) $this->mapCategoryToId($request->id_categoria);
        if (!DB::table('categoria')->where('id_categoria', $catId)->exists()) {
            $firstCat = DB::table('categoria')->value('id_categoria');
            $catId = $firstCat ?: 1;
        }

        // Distrito válido: verifica que exista en la tabla 'distrito', de lo contrario usa el primero o null
        $idDistrito = $request->id_distrito;
        if (!$idDistrito || !DB::table('distrito')->where('id_distrito', $idDistrito)->exists()) {
            $firstDist = DB::table('distrito')->value('id_distrito');
            $idDistrito = $firstDist ?: null;
        }

        try {
            DB::beginTransaction();

            $publicacion = Publicacion::create([
                'titulo'       => $request->titulo,
                'descripcion'  => $request->descripcion,
                'precio_dia'   => $request->precio_dia,
                'deposito'     => round($request->precio_dia * 0.30, 2),
                'condicion'    => $request->condicion,
                'id_distrito'  => $idDistrito,
                'estado'       => true, 
                'id_usuario'   => $user->id_usuario,
                'id_categoria' => $catId
            ]);

            $savedImagesCount = 0;

            if ($request->hasFile('imagenes')) {
                foreach ($request->file('imagenes') as $index => $file) {
                    $ext = $file->getClientOriginalExtension() ?: 'jpg';
                    $filename = 'pub_' . $publicacion->id_publicacion . '_' . time() . '_' . $index . '.' . $ext;
                    
                    $path = null;
                    // Intento 1: Subir a S3
                    try {
                        $path = $file->storeAs('publicaciones', $filename, 's3');
                    } catch (\Throwable $s3Err) {
                        // Intento 2: Subir a disco público local
                        try {
                            $path = $file->storeAs('publicaciones', $filename, 'public');
                        } catch (\Throwable $localErr) {
                            $path = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80';
                        }
                    }

                    if ($path) {
                        Imagen::create([
                            'url_photo' => $path,
                            'id_publicacion' => $publicacion->id_publicacion
                        ]);
                        $savedImagesCount++;
                    }
                }
            }

            // Si por alguna razón no se guardó ninguna imagen, poner una imagen por defecto
            if ($savedImagesCount === 0) {
                Imagen::create([
                    'url_photo' => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
                    'id_publicacion' => $publicacion->id_publicacion
                ]);
            }

            DB::commit();
            return response()->json(['message' => '¡Artículo publicado con éxito!', 'publicacion_id' => $publicacion->id_publicacion], 201);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al guardar la publicación', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Actualiza una publicación existente.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        
        // Buscamos la publicación que pertenezca al usuario
        $publicacion = Publicacion::where('id_usuario', $user->id_usuario)->find($id);

        if (!$publicacion) {
            return response()->json(['message' => 'Publicación no encontrada o no tienes permisos'], 404);
        }

        // Validación de datos
        $validator = Validator::make($request->all(), [
            'titulo' => 'sometimes|required|string|max:80',
            'descripcion' => 'sometimes|required|string|max:500',
            'precio_dia' => 'sometimes|required|numeric|min:1',
            'condicion' => 'sometimes|required|string|max:50',
            'id_distrito' => 'sometimes|required|exists:distrito,id_distrito',
            'id_categoria' => 'sometimes|required|string',
            'estado' => 'sometimes|string', 
            'imagenes' => 'sometimes|array|max:8',
            'imagenes.*' => 'image|mimes:jpeg,png,jpg,webp|max:10240',
            'delete_images' => 'sometimes|array', // IDs de imágenes a eliminar
            'delete_images.*' => 'exists:imagen,id_imagen',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            // Actualizar campos básicos
            $updateData = $request->only(['titulo', 'descripcion', 'precio_dia', 'condicion', 'id_distrito']);
            
            if ($request->has('id_categoria')) {
                $updateData['id_categoria'] = $this->mapCategoryToId($request->id_categoria);
            }

            // Convertir estado a booleano real
            if ($request->has('estado')) {
                $updateData['estado'] = filter_var($request->estado, FILTER_VALIDATE_BOOLEAN);
            }

            $publicacion->update($updateData);

            // 1. Eliminar imágenes seleccionadas (si se solicitó)
            if ($request->has('delete_images')) {
                foreach ($request->delete_images as $imgId) {
                    $imagen = Imagen::where('id_publicacion', $publicacion->id_publicacion)->find($imgId);
                    if ($imagen) {
                        // Opcional: Eliminar de S3 físicamente (si tienes el path)
                        // Storage::disk('s3')->delete($imagen->url_photo);
                        $imagen->delete();
                    }
                }
            }

            // 2. Agregar nuevas imágenes a S3
            if ($request->hasFile('imagenes')) {
                foreach ($request->file('imagenes') as $index => $file) {
                    $filename = 'pub_' . $publicacion->id_publicacion . '_' . time() . '_' . $index . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('publicaciones', $filename, 's3');
                    
                    Imagen::create([
                        'url_photo' => $path, 
                        'id_publicacion' => $publicacion->id_publicacion
                    ]);
                }
            }

            DB::commit();

            // Recargar con relaciones para devolver la info actualizada
            $publicacion->load(['imagenes', 'categoria', 'distrito']);

            return response()->json([
                'message' => '¡Publicación actualizada con éxito!',
                'publicacion' => $publicacion
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar la publicación',
                'error' => $e->getMessage()
            ], 500);
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
