<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\CashFlowController;
use App\Http\Controllers\Api\InventoryController;

//Semua route API  diawali /api/...
Route::middleware('api')->group(function() {
   
    // Purchases
    Route::get('/purchases', [PurchaseController::class, 'index']);
    Route::post('/purchases', [PurchaseController::class, 'store']);
    Route::put('/purchases/{id}', [PurchaseController::class, 'update']);
    Route::delete('/purchases/{id}', [PurchaseController::class, 'destroy']);

    // ── Sales ───────────────────────────────────
    Route::get('/sales',            [SaleController::class, 'index']);
    Route::post('/sales',           [SaleController::class, 'store']);
    Route::put('/sales/{id}',       [SaleController::class, 'update']);
    Route::delete('/sales/{id}',    [SaleController::class, 'destroy']);

    // ── Cash Flows ──────────────────────────────
    Route::get('/cashflows',           [CashFlowController::class, 'index']);
    Route::post('/cashflows',          [CashFlowController::class, 'store']);
    Route::put('/cashflows/{id}',      [CashFlowController::class, 'update']);
    Route::delete('/cashflows/{id}',   [CashFlowController::class, 'destroy']);
    Route::get('/cashflows/summary',   [CashFlowController::class, 'summary']); 

    // ── Inventory ───────────────────────────────
    Route::get('/inventory',              [InventoryController::class, 'index']);
    Route::post('/inventory',             [InventoryController::class, 'store']);
    Route::put('/inventory/{id}',         [InventoryController::class, 'update']);
    Route::delete('/inventory/{id}',      [InventoryController::class, 'destroy']);
    Route::patch('/inventory/{id}/adjust',[InventoryController::class, 'adjustStock']); 

});