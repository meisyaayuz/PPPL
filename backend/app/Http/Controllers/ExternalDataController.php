<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class ExternalDataController extends Controller
{
    /**
     * Get weather data from BMKG API based on kode_wilayah.
     */
    public function getWeather(Request $request)
    {
        $request->validate([
            'kode_wilayah' => 'required|string'
        ]);

        $kode = $request->kode_wilayah;
        $cacheKey = 'weather_' . $kode;

        if (Cache::has($cacheKey)) {
            return response()->json(Cache::get($cacheKey));
        }

        try {
            $response = Http::timeout(10)->get("https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4={$kode}");

            if ($response->successful()) {
                $data = $response->json();
                
                // Fetch the nearest weather prediction (usually the first element in cuaca array)
                $cuacaData = $data['data'][0]['cuaca'][0][0] ?? null;

                if ($cuacaData) {
                    $weatherDesc = $cuacaData['weather_desc'];
                    $temperature = $cuacaData['t'];
                    $humidity = $cuacaData['hu'];
                    $weatherCode = $cuacaData['weather']; // BMKG weather code
                    
                    $warning = null;
                    // Usually code 60+ indicates rain, 95+ indicates severe thunderstorms
                    if (in_array($weatherCode, [60, 61, 63, 65, 80, 81, 95, 97])) {
                        $warning = 'Peringatan: Potensi hujan atau cuaca buruk. Harap berhati-hati.';
                    }

                    $result = [
                        'temperature' => $temperature,
                        'condition' => $weatherDesc,
                        'humidity' => $humidity,
                        'warning' => $warning,
                        'source' => 'BMKG'
                    ];

                    // Cache for 1 hour
                    Cache::put($cacheKey, $result, now()->addHours(1));

                    return response()->json($result);
                }
            }
        } catch (\Exception $e) {
            // Fallback or error logging
        }

        // Default / Fallback
        return response()->json([
            'temperature' => 28,
            'condition' => 'Cerah',
            'humidity' => 70,
            'warning' => null,
            'source' => 'Fallback (BMKG API failed or code invalid)'
        ]);
    }

    /**
     * Get eco status (environmental data) from Overpass API (OSM) based on latitude & longitude.
     */
    public function getEcoStatus(Request $request)
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lon' => 'required|numeric'
        ]);

        $lat = $request->lat;
        $lon = $request->lon;
        $cacheKey = "eco_{$lat}_{$lon}";

        if (Cache::has($cacheKey)) {
            return response()->json(Cache::get($cacheKey));
        }

        // Query Overpass API for industrial areas (pollution), forests (fire risk), and reefs
        $query = '[out:json][timeout:15];
        (
          node["landuse"="industrial"](around:10000, ' . $lat . ', ' . $lon . ');
          way["landuse"="industrial"](around:10000, ' . $lat . ', ' . $lon . ');
          node["natural"="wood"](around:10000, ' . $lat . ', ' . $lon . ');
          way["natural"="wood"](around:10000, ' . $lat . ', ' . $lon . ');
          node["natural"="reef"](around:10000, ' . $lat . ', ' . $lon . ');
          way["natural"="reef"](around:10000, ' . $lat . ', ' . $lon . ');
        );
        out tags;';

        try {
            $response = Http::asForm()
                ->withHeaders(['User-Agent' => 'DestinasiApp/1.0'])
                ->timeout(20)
                ->post('https://overpass-api.de/api/interpreter', [
                    'data' => $query
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $elements = $data['elements'] ?? [];

                $industrialCount = 0;
                $forestCount = 0;
                $reefCount = 0;

                foreach ($elements as $el) {
                    if (isset($el['tags']['landuse']) && $el['tags']['landuse'] === 'industrial') {
                        $industrialCount++;
                    }
                    if (isset($el['tags']['natural']) && $el['tags']['natural'] === 'wood') {
                        $forestCount++;
                    }
                    if (isset($el['tags']['natural']) && $el['tags']['natural'] === 'reef') {
                        $reefCount++;
                    }
                }

                // Analyze pollution based on industrial count
                $pollutionLevel = 'rendah';
                if ($industrialCount > 10) {
                    $pollutionLevel = 'tinggi';
                } elseif ($industrialCount > 3) {
                    $pollutionLevel = 'sedang';
                }

                // Analyze forest fire risk
                $forestFireRisk = 'rendah';
                if ($forestCount > 20) {
                    $forestFireRisk = 'tinggi';
                } elseif ($forestCount > 5) {
                    $forestFireRisk = 'sedang';
                }

                // Coral reef condition
                $coralReefCondition = $reefCount > 0 ? 'baik' : null;

                // Safety level based on extremes
                $safetyLevel = 'aman';
                if ($pollutionLevel === 'tinggi' || $forestFireRisk === 'tinggi') {
                    $safetyLevel = 'hati-hati';
                }

                $result = [
                    'pollutionLevel' => $pollutionLevel,
                    'coralReefCondition' => $coralReefCondition,
                    'forestFireRisk' => $forestFireRisk,
                    'safetyLevel' => $safetyLevel,
                    'source' => 'OpenStreetMap / Overpass API'
                ];

                Cache::put($cacheKey, $result, now()->addHours(24));

                return response()->json($result);
            } else {
                $errorMsg = 'Status: ' . $response->status() . ' - Body: ' . $response->body();
            }
        } catch (\Exception $e) {
            // Fallback
            $errorMsg = $e->getMessage();
        }

        // Default / Fallback
        return response()->json([
            'pollutionLevel' => 'sedang',
            'safetyLevel' => 'hati-hati',
            'source' => 'Fallback (Overpass API failed)',
            'error' => $errorMsg ?? 'Unknown error'
        ]);
    }
}
