<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Universidad extends Model
{
    use HasFactory;

    protected $table = 'universidad';
    protected $primaryKey = 'id_universidad';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'sedes',
    ];

    public function usuarios()
    {
        return $this->hasMany(User::class, 'id_universidad', 'id_universidad');
    }
}
