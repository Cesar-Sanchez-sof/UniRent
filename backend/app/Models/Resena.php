<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Resena extends Model
{
    use HasFactory;

    protected $table = 'reseña';
    protected $primaryKey = 'id_resena';
    public $timestamps = false;

    protected $fillable = [
        'calificacion',
        'comentario',
        'id_alquiler',
        'tipo',
    ];

    public function alquiler()
    {
        return $this->belongsTo(Alquiler::class, 'id_alquiler', 'id_alquiler');
    }
}
