<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Publicacion extends Model
{
    use HasFactory;

    protected $table = 'publicacion'; // Se quitó 'public.' para mantener consistencia
    protected $primaryKey = 'id_publicacion';
    public $timestamps = false; // Añadido porque en el SQL no hay created_at/updated_at

    protected $fillable = [
        'titulo',
        'descripcion',
        'precio_dia',
        'deposito',
        'condicion',
        'estado',
        'id_usuario',
        'id_categoria',
        'id_distrito', // Nuevo campo normalizado
    ];

    protected $casts = [
        'precio_dia' => 'decimal:2',
        'deposito' => 'decimal:2',
        'estado' => 'boolean',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuario', 'id_usuario');
    }

    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'id_categoria', 'id_categoria');
    }

    public function imagenes()
    {
        return $this->hasMany(Imagen::class, 'id_publicacion', 'id_publicacion');
    }

    public function distrito()
    {
        return $this->belongsTo(Distrito::class, 'id_distrito', 'id_distrito');
    }
}
