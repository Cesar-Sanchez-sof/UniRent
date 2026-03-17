<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Imagen extends Model
{
    use HasFactory;

    protected $table = 'imagenes';
    protected $primaryKey = 'id_imagenes';
    public $timestamps = false; // El SQL no tiene created_at / updated_at

    protected $fillable = [
        'url_photo',
        'id_publicacion',
    ];

    public function getUrlPhotoAttribute()
    {
        $value = $this->attributes['url_photo'] ?? null;
        if (!$value) return null;
        if (str_starts_with($value, 'http')) return $value;
        
        $baseUrl = config('filesystems.disks.s3.url');
        if ($baseUrl) {
            return rtrim($baseUrl, '/') . '/' . ltrim($value, '/');
        }

        return \Illuminate\Support\Facades\Storage::disk('s3')->url($value);
    }

    public function publicacion()
    {
        return $this->belongsTo(Publicacion::class, 'id_publicacion', 'id_publicacion');
    }
}

