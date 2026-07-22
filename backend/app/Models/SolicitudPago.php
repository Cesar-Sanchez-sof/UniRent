<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SolicitudPago extends Model
{
    protected $table = 'solicitud_pago';
    protected $primaryKey = 'id_solicitud';

    protected $fillable = [
        'id_usuario',
        'monto',
        'nro_operacion',
        'comprobante_url',
        'estado'
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuario', 'id_usuario');
    }
}
