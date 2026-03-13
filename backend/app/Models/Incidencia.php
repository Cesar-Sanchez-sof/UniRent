<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Incidencia extends Model
{
    use HasFactory;

    protected $table = 'incidencias';
    protected $primaryKey = 'id_incidencia';

    protected $fillable = [
        'id_alquiler',
        'id_usuario_reportado',
        'id_usuario_reportante',
        'id_resena',
        'descripcion',
        'estado',
        'gravedad',
        'evidencias'
    ];

    protected $casts = [
        'evidencias' => 'array',
    ];

    public function alquiler()
    {
        return $this->belongsTo(Alquiler::class, 'id_alquiler');
    }

    public function usuarioReportado()
    {
        return $this->belongsTo(User::class, 'id_usuario_reportado');
    }

    public function usuarioReportante()
    {
        return $this->belongsTo(User::class, 'id_usuario_reportante');
    }

    public function resena()
    {
        return $this->belongsTo(Resena::class, 'id_resena');
    }
}
