<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Destinasi extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama',
        'region',
        'kode_wilayah',
        'kategori',
        'deskripsi',
        'lokasi',
        'latitude',
        'longitude',
        'harga',
        'gambar',
        'eco_status',
        'weather',
        'geo_json',
    ];

    protected $casts = [
        'eco_status' => 'array',
        'weather' => 'array',
        'geo_json' => 'array',
        'latitude' => 'float',
        'longitude' => 'float',
        'harga' => 'float',
    ];
}
