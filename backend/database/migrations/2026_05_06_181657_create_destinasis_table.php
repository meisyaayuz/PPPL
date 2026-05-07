<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('destinasis', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->text('deskripsi');
            $table->string('region')->nullable();
            $table->string('kode_wilayah')->nullable(); // Kode wilayah BMKG (adm4), e.g. 31.71.01.1001
            $table->string('kategori')->default('Pariwisata'); // Pariwisata, Biota Laut, Biota Darat, Flora Fauna
            $table->string('lokasi')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->decimal('harga', 15, 2)->default(0);
            $table->text('gambar')->nullable();
            $table->json('eco_status')->nullable();
            $table->json('weather')->nullable();
            $table->json('geo_json')->nullable(); // Untuk menyimpan polygon/polyline
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('destinasis');
    }
};
