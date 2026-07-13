<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\CashFlowController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\ActivityLogController;

//Semua route API  diawali /api/...
Route::middleware('api')->group(function () {

    // ── Auth (PUBLIK — Tahap B) ─────────────────
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login',    [AuthController::class, 'login']);

    // ── Rute di bawah ini WAJIB login (Bearer token Sanctum) ──
    Route::middleware('auth:sanctum')->group(function () {

        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me',      [AuthController::class, 'me']);

        // ── Dashboard (BARU — Tahap E) ───────────────────────────
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // ── Profile (BARU — Catatan #7) ─────────
        Route::get('/profile',  [ProfileController::class, 'show']);
        Route::post('/profile', [ProfileController::class, 'update']);

        // ── Suppliers (BARU v4.0) ───────────────
        Route::get('/suppliers',           [SupplierController::class, 'index']);
        Route::post('/suppliers',          [SupplierController::class, 'store']);
        Route::put('/suppliers/{id}',      [SupplierController::class, 'update']);
        Route::delete('/suppliers/{id}',   [SupplierController::class, 'destroy']);

        // ── Purchases ────────────────────────────
        Route::get('/purchases', [PurchaseController::class, 'index']);
        Route::post('/purchases', [PurchaseController::class, 'store']);
        Route::put('/purchases/{id}', [PurchaseController::class, 'update']);
        Route::delete('/purchases/{id}', [PurchaseController::class, 'destroy']);

        // ── Sales ────────────────────────────────
        Route::get('/sales',            [SaleController::class, 'index']);
        Route::post('/sales',           [SaleController::class, 'store']);
        Route::put('/sales/{id}',       [SaleController::class, 'update']);
        Route::delete('/sales/{id}',    [SaleController::class, 'destroy']);

        // ── Cash Flows ───────────────────────────
        Route::get('/cashflows/summary',   [CashFlowController::class, 'summary']);
        Route::get('/cashflows',           [CashFlowController::class, 'index']);
        Route::post('/cashflows',          [CashFlowController::class, 'store']);
        Route::put('/cashflows/{id}',      [CashFlowController::class, 'update']);
        Route::delete('/cashflows/{id}',   [CashFlowController::class, 'destroy']);

        // ── Inventory ────────────────────────────
        Route::get('/inventory',              [InventoryController::class, 'index']);
        Route::post('/inventory',             [InventoryController::class, 'store']);
        Route::put('/inventory/{id}',         [InventoryController::class, 'update']);
        Route::delete('/inventory/{id}',      [InventoryController::class, 'destroy']);
        Route::patch('/inventory/{id}/adjust',[InventoryController::class, 'adjustStock']);

        // ── Activity Log (BARU v4.0) ─────────────
        Route::get('/activity-logs', [ActivityLogController::class, 'index']);

        // ── Reports (BARU — Tahap F) ─────────────
        Route::get('/reports/profit-loss',   [ReportController::class, 'profitLoss']);
        Route::get('/reports/cash-flow',     [ReportController::class, 'cashFlow']);
        Route::get('/reports/category',      [ReportController::class, 'category']);
        Route::get('/reports/export/pdf',    [ReportController::class, 'exportPdf']);
        Route::get('/reports/export/excel',  [ReportController::class, 'exportExcel']);
    });
});