<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Alquiler extends Model
{
    use HasFactory;

    protected $table = 'alquiler';
    protected $primaryKey = 'id_alquiler';
    
    // Tu tabla usa fecha_registro con DEFAULT, así que desactivamos los de Laravel
    public $timestamps = false; 

    protected $fillable = [
        'monto_total',
        'monto_seguro',
        'estado',
        'fecha_alquiler',
        'fecha_devolucion',
        'id_publicacion',
        'id_usuario_cliente',
    ];

    public function publicacion()
    {
        return $this->belongsTo(Publicacion::class, 'id_publicacion', 'id_publicacion');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuario_cliente', 'id_usuario');
    }

    public function resenas()
    {
        return $this->hasMany(Resena::class, 'id_alquiler', 'id_alquiler');
    }
}
