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
            $query->where('titulo', 'ILIKE', $searchTerm);
        }

        // Filtrar por Categoría
        if ($request->has('id_categoria')) {
            $query->where('id_categoria', $request->id_categoria);
        }

        // Si el usuario está logueado, excluimos sus propias publicaciones para que no se alquile a sí mismo
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
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['message' => 'Usuario no autenticado.'], 401);
            }

            $userId = $user->id_usuario;
            if (!$userId) {
                return response()->json(['message' => 'ID de usuario no válido.'], 401);
            }

            // Validar e Insertar Usuario en la BD si no existe su ID para evitar violación de clave foránea FK
            if (!DB::table('usuario')->where('id_usuario', $userId)->exists()) {
                try {
                    DB::table('usuario')->insert([
                        'id_usuario'           => $userId,
                        'primer_nombre'        => $user->primer_nombre ?? 'Usuario',
                        'segundo_nombre'       => $user->segundo_nombre ?? '',
                        'primer_apellido'      => $user->primer_apellido ?? 'UniRent',
                        'segundo_apellido'     => $user->segundo_apellido ?? '',
                        'username'             => $user->username ?? ('user_' . $userId),
                        'password'             => $user->password ?? bcrypt('123456'),
                        'correo'               => $user->correo ?? ('user_' . $userId . '@unirent.pe'),
                        'telefono'             => $user->telefono ?? '999999999',
                        'dni'                  => $user->dni ?? (string)rand(10000000, 99999999),
                        'codigo_universitario' => $user->codigo_universitario ?? 'U2026',
                    ]);
                } catch (\Throwable $uErr) {
                    $fallback = DB::table('usuario')->value('id_usuario');
                    if ($fallback) {
                        $userId = $fallback;
                    }
                }
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

            // 1. Validar e Insertar Categoría si no existe
            $catId = (int) $this->mapCategoryToId($request->id_categoria);
            if (!DB::table('categoria')->where('id_categoria', $catId)->exists()) {
                try {
                    DB::table('categoria')->insert(['nombre' => $request->id_categoria === '3' ? 'Fotografía' : ($request->id_categoria === '2' ? 'Libros' : 'Tecnología')]);
                    $catId = DB::table('categoria')->orderBy('id_categoria', 'desc')->value('id_categoria') ?: 1;
                } catch (\Throwable $e) {
                    $catId = DB::table('categoria')->value('id_categoria') ?: 1;
                }
            }

            // 2. Validar Distrito: Si el string '130103' u otro no existe en la tabla 'distrito', usar NULL para prevenir error de FK en Postgres
            $idDistrito = $request->id_distrito;
            if ($idDistrito) {
                $distExists = DB::table('distrito')->where('id_distrito', (string)$idDistrito)->exists();
                if (!$distExists) {
                    $idDistrito = null;
                }
            }

            DB::beginTransaction();

            $publicacion = Publicacion::create([
                'titulo'       => $request->titulo,
                'descripcion'  => $request->descripcion,
                'precio_dia'   => $request->precio_dia,
                'deposito'     => round($request->precio_dia * 0.30, 2),
                'condicion'    => $request->condicion,
                'id_distrito'  => $idDistrito,
                'estado'       => true, 
                'id_usuario'   => $userId,
                'id_categoria' => $catId
            ]);

            $savedImagesCount = 0;

            if ($request->hasFile('imagenes')) {
                foreach ($request->file('imagenes') as $index => $file) {
                    $ext = $file->getClientOriginalExtension() ?: 'jpg';
                    $filename = 'pub_' . $publicacion->id_publicacion . '_' . time() . '_' . $index . '.' . $ext;
                    
                    $fullUrl = null;

                    // 1. Intentar subir al bucket S3 / Supabase Storage si está configurado
                    try {
                        if (config('filesystems.disks.s3.key') && config('filesystems.disks.s3.bucket')) {
                            $path = $file->storeAs('publicaciones', $filename, 's3');
                            $s3BaseUrl = config('filesystems.disks.s3.url') ?: "https://khagadpjvxmzrouelwpu.storage.supabase.co/storage/v1/object/public/nex-us";
                            $fullUrl = rtrim($s3BaseUrl, '/') . '/' . ltrim($path, '/');
                        }
                    } catch (\Throwable $s3Err) {}

                    // 2. Si S3 no está activo o falla, guardar en el disco público de Laravel
                    if (!$fullUrl) {
                        try {
                            $path = $file->storeAs('publicaciones', $filename, 'public');
                            $fullUrl = url('/storage/' . $path);
                        } catch (\Throwable $localErr) {
                            $fullUrl = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80';
                        }
                    }

                    // 3. Registrar la URL pública en la tabla 'imagenes' de Supabase PostgreSQL
                    try {
                        Imagen::create([
                            'url_photo' => $fullUrl,
                            'id_publicacion' => $publicacion->id_publicacion
                        ]);
                        $savedImagesCount++;
                    } catch (\Throwable $imgErr) {}
                }
            }

            if ($savedImagesCount === 0) {
                try {
                    Imagen::create([
                        'url_photo' => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
                        'id_publicacion' => $publicacion->id_publicacion
                    ]);
                } catch (\Throwable $imgErr) {}
            }

            DB::commit();
            return response()->json(['message' => '¡Artículo publicado con éxito!', 'publicacion_id' => $publicacion->id_publicacion], 201);

        } catch (\Throwable $e) {
            try {
                DB::rollBack();
            } catch (\Throwable $rbErr) {}

            return response()->json([
                'message' => 'Error al guardar la publicación',
                'error' => $e->getMessage()
            ], 500);
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
            'imagenes.*' => 'nullable|file|max:51200',
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
