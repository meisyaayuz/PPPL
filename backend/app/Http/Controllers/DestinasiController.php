<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Destinasi;

class DestinasiController extends Controller
{
    public function __construct()
    {
        // Hanya admin yang bisa create, update, delete destinasi.
        // User biasa hanya bisa melihat daftar dan detailnya.
        $this->middleware('auth:api')->except(['index', 'show']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Destinasi::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'region' => 'nullable|string|max:255',
            'kategori' => 'nullable|string',
            'deskripsi' => 'nullable|string',
            'lokasi' => 'nullable|string|max:255',
            'kode_wilayah' => 'nullable|string|max:20',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'harga' => 'nullable|numeric|min:0',
            'gambar' => 'nullable|string',
            'eco_status' => 'nullable|array',
            'weather' => 'nullable|array',
            'geo_json' => 'nullable|array',
        ]);

        $destinasi = Destinasi::create($validated);

        return response()->json($destinasi, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $destinasi = Destinasi::findOrFail($id);
        return response()->json($destinasi);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $destinasi = Destinasi::findOrFail($id);

        $validated = $request->validate([
            'nama' => 'sometimes|string|max:255',
            'region' => 'nullable|string|max:255',
            'kategori' => 'nullable|string',
            'deskripsi' => 'nullable|string',
            'lokasi' => 'nullable|string|max:255',
            'kode_wilayah' => 'nullable|string|max:20',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'harga' => 'nullable|numeric|min:0',
            'gambar' => 'nullable|string',
            'eco_status' => 'nullable|array',
            'weather' => 'nullable|array',
            'geo_json' => 'nullable|array',
        ]);

        $destinasi->update($validated);

        return response()->json($destinasi);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $destinasi = Destinasi::findOrFail($id);
        $destinasi->delete();

        return response()->json(['message' => 'Destinasi deleted successfully']);
    }
}
