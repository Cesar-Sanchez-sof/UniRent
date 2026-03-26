<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuario';
    protected $primaryKey = 'id_usuario';
    public $timestamps = false;

    protected $appends = ['foto_perfil'];

    protected $fillable = [
        'primer_nombre',
        'segundo_nombre',
        'primer_apellido',
        'segundo_apellido',
        'username',
        'password',
        'correo',
        'telefono',
        'dni',
        'puntaje_dueno',
        'puntaje_arrendador',
        'codigo_universitario',
        'numero_alquileres',
        'estado',
        'deuda', // Nuevo campo para control de mora/recargas
        'id_universidad',
        'foto_perfil',
    ];

    public function getFotoPerfilAttribute($value)
    {
        if (!$value) return null;
        if (filter_var($value, FILTER_VALIDATE_URL)) return $value;
        
        // Si el valor es una ruta relativa, usamos el disco s3 para generar la URL
        return \Illuminate\Support\Facades\Storage::disk('s3')->url($value);
    }

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'estado' => 'boolean',
            'puntaje_dueno' => 'decimal:1',
            'puntaje_arrendador' => 'decimal:1',
        ];
    }

    public function universidad()
    {
        return $this->belongsTo(Universidad::class, 'id_universidad', 'id_universidad');
    }

    /**
     * Incidencias donde el usuario fue el reportado (el que se portó mal).
     */
    public function incidenciasRecibidas()
    {
        return $this->hasMany(Incidencia::class, 'id_usuario_reportado', 'id_usuario');
    }

    /**
     * Incidencias que el usuario reportó a otros.
     */
    public function incidenciasReportadas()
    {
        return $this->hasMany(Incidencia::class, 'id_usuario_reportante', 'id_usuario');
    }
}
