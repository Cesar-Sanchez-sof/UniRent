<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Universidad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function getUniversidades()
    {
        try {
            $universidades = DB::select("SELECT id_universidad, nombre || ' - ' || sedes AS nombre_completo FROM universidad ORDER BY nombre ASC");
            return response()->json($universidades);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'primer_nombre'   => 'required|string|max:30',
            'primer_apellido' => 'required|string|max:30',
            'segundo_apellido' => 'required|string|max:30',
            'username'         => 'required|string|max:20|unique:usuario,username',
            'password'         => 'required|string|min:8',
            'correo'           => 'required|email|max:50|unique:usuario,correo',
            'telefono'         => 'required|string|max:9',
            'dni'              => 'required|string|max:8|unique:usuario,dni',
            'codigo_universitario' => 'required|string|max:10',
            'id_universidad'   => 'required|exists:universidad,id_universidad',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $user = User::create([
                'primer_nombre'   => $request->primer_nombre,
                'segundo_nombre'  => $request->segundo_nombre,
                'primer_apellido' => $request->primer_apellido,
                'segundo_apellido' => $request->segundo_apellido,
                'username'         => $request->username,
                'password'         => Hash::make($request->password),
                'correo'           => $request->correo,
                'telefono'         => $request->telefono,
                'dni'              => $request->dni,
                'codigo_universitario' => $request->codigo_universitario,
                'id_universidad'   => $request->id_universidad,
                'incidencias'      => 0,
                'puntaje_dueno'    => 5.0,
                'puntaje_arrendador' => 5.0,
                'numero_alquileres' => 0,
                'estado'           => true,
            ]);

            return response()->json(['message' => 'Usuario registrado con éxito'], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al guardar', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Inicio de sesión profesional (Sanctum)
     */
    public function login(Request $request)
    {
        $request->validate([
            'correo' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('correo', $request->correo)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }

        // Creamos el token de acceso
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Bienvenido a NexUs',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id_usuario,
                'nombre' => $user->primer_nombre . ' ' . $user->primer_apellido,
                'username' => $user->username,
                'foto' => $user->foto_perfil
            ]
        ]);
    }

    /**
     * Cierre de sesión (Revocar token)
     */
    /**
     * Subida instantánea de foto de perfil
     */
    public function uploadPhoto(Request $request)
    {
        try {
            // 1. Diagnóstico: Ver qué llegó exactamente
            $file = $request->file('foto');

            if (!$file) {
                return response()->json([
                    'message' => 'Laravel no reconoce "foto" como un archivo válido.',
                    'debug' => [
                        'has_foto_in_input' => $request->has('foto'),
                        'all_input' => $request->all(),
                        'file_error' => $request->hasFile('foto') ? 'Archivo presente pero inválido' : 'Archivo ausente'
                    ]
                ], 422);
            }

            // 2. Si el archivo existe pero tiene errores de PHP (ej. muy pesado)
            if (!$file->isValid()) {
                return response()->json([
                    'message' => 'El archivo llegó pero no es válido.',
                    'error_code' => $file->getError(), // 1: upload_max_filesize, 2: post_max_size, etc.
                    'error_message' => $file->getErrorMessage()
                ], 422);
            }

            // 3. Validación de formato
            $request->validate([
                'foto' => 'required|image|mimes:jpeg,png,jpg,webp|max:10244', // Max 10MB
            ]);

            $user = $request->user();

            // 4. Definir nombre y ruta pública
            // Queremos que se guarde en: backend/public/storage/perfiles/nombre.jpg
            $filename = 'avatar_' . $user->id_usuario . '_' . time() . '.' . $file->getClientOriginalExtension();

            // storeAs guarda en storage/app/public/perfiles, que luego se vincula a public/storage
            $path = $file->storeAs('perfiles', $filename, 'public');

            // 5. UPDATE directo a la base de datos con la RUTA (string)
            // Se guardará algo como: "perfiles/avatar_1_123456.jpg"
            DB::table('usuario')
                ->where('id_usuario', $user->id_usuario)
                ->update(['foto_perfil' => $path]);

            return response()->json([
                'message' => 'Ruta actualizada en la base de datos.',
                'foto_url' => asset('storage/' . $path),
                'foto_path' => $path
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error en el servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * Cambio de contraseña seguro
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password'     => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Verificar si la contraseña actual es correcta
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'La contraseña actual no es correcta'], 422);
        }

        try {
            $user->password = Hash::make($request->new_password);
            $user->save();

            return response()->json(['message' => 'Contraseña actualizada con éxito']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al actualizar la contraseña'], 500);
        }
    }

    /**
     * Actualización de perfil del usuario
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'primer_nombre'   => 'required|string|max:30',
            'segundo_nombre'  => 'nullable|string|max:30',
            'primer_apellido' => 'required|string|max:30',
            'segundo_apellido' => 'required|string|max:30',
            'username'         => 'required|string|max:20|unique:usuario,username,' . $user->id_usuario . ',id_usuario',
            'telefono'         => 'required|string|max:9',
            'correo'           => 'required|email|max:50|unique:usuario,correo,' . $user->id_usuario . ',id_usuario',
            'foto'             => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Max 2MB
            'current_password' => 'nullable|string|min:8',
            'new_password'     => 'nullable|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $user->primer_nombre = $request->primer_nombre;
            $user->segundo_nombre = $request->segundo_nombre;
            $user->primer_apellido = $request->primer_apellido;
            $user->segundo_apellido = $request->segundo_apellido;
            $user->username = $request->username;
            $user->telefono = $request->telefono;
            $user->correo = $request->correo;

            // Procesar la foto de perfil si se envía
            if ($request->hasFile('foto')) {
                $file = $request->file('foto');
                $filename = time() . '_' . $user->username . '.' . $file->getClientOriginalExtension();
                // Guardamos en storage/app/public/perfiles
                $path = $file->storeAs('perfiles', $filename, 'public');
                $user->foto_perfil = $path;
            }

            // Lógica de seguridad para contraseña
            if ($request->filled('new_password')) {
                if (!Hash::check($request->current_password, $user->password)) {
                    return response()->json(['message' => 'La contraseña actual es incorrecta'], 422);
                }
                $user->password = Hash::make($request->new_password);
            }

            $user->save();

            return response()->json([
                'message' => 'Perfil actualizado correctamente',
                'user' => $user->load('universidad'),
                'foto_url' => $user->foto_perfil ? asset('storage/' . $user->foto_perfil) : null
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al actualizar', 'error' => $e->getMessage()], 500);
        }
    }
}
