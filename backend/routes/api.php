<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DestinasiController;

use App\Http\Controllers\ExternalDataController;

Route::group([
    'middleware' => 'api',
    'prefix' => 'auth'
], function ($router) {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('refresh', [AuthController::class, 'refresh']);
    Route::get('me', [AuthController::class, 'me']);
});

Route::apiResource('users', UserController::class);
Route::apiResource('destinasis', DestinasiController::class);

// External API endpoints for live data
Route::get('weather', [ExternalDataController::class, 'getWeather']);
Route::get('ecosystem', [ExternalDataController::class, 'getEcoStatus']);

Route::get('/test', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'Hello dari Backend Laravel!'
    ]);
});
