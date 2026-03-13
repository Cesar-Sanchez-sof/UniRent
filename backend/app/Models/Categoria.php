<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    use HasFactory;

    protected $table = 'categoria';
    protected $primaryKey = 'id_categoria';
    public $timestamps = false; // El SQL no tiene created_at/updated_at

    protected $fillable = [
        'nombre',
    ];

    /**
     * Relación: Una categoría tiene muchas publicaciones.
     */
    public function publicaciones()
    {
        return $this->hasMany(Publicacion::class, 'id_categoria', 'id_categoria');
    }
}
