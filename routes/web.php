<?php

use App\Http\Controllers\AiConsultController;
use App\Http\Controllers\DermLogicController;
use Illuminate\Support\Facades\Route;

Route::get('/', [DermLogicController::class, 'index'])->name('home');
Route::get('/referensi', [DermLogicController::class, 'referensi'])->name('referensi');
Route::get('/pengetahuan', [DermLogicController::class, 'pengetahuan'])->name('pengetahuan');
Route::post('/ai/tanya', [AiConsultController::class, 'ask'])->name('ai.ask');
