<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    use HasFactory;

    protected $table = 'notificacion';
    protected $primaryKey = 'id_notificacion';
    
    // Desactivamos los timestamps estándar de Laravel (created_at/updated_at)
    // ya que tu tabla usa fecha_registro con DEFAULT CURRENT_TIMESTAMP
    public $timestamps = false; 

    protected $fillable = [
        'titulo',
        'mensaje',
        'leido',
        'id_usuario',
        'id_alquiler'
    ];

    // Aseguramos que fecha_registro se trate como una fecha
    protected $casts = [
        'fecha_registro' => 'datetime',
        'leido' => 'boolean'
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuario', 'id_usuario');
    }

    public function alquiler()
    {
        return $this->belongsTo(Alquiler::class, 'id_alquiler', 'id_alquiler');
    }
}
