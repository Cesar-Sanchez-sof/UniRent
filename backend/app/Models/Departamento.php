<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Departamento extends Model
{
    protected $table = 'departamento';
    protected $primaryKey = 'id_departamento';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    public function provincias()
    {
        return $this->hasMany(Provincia::class, 'id_departamento', 'id_departamento');
    }
}
