<?php

namespace App\Providers;

use App\Models\Purchase;
use App\Models\Sale;
use App\Models\CashFlow;
use App\Models\Inventory;
use App\Models\Supplier;
use App\Observers\PurchaseObserver;
use App\Observers\SaleObserver;
use App\Observers\CashFlowObserver;
use App\Observers\InventoryObserver;
use App\Observers\SupplierObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Purchase::observe(PurchaseObserver::class);
        Sale::observe(SaleObserver::class);
        CashFlow::observe(CashFlowObserver::class);
        Inventory::observe(InventoryObserver::class);
        Supplier::observe(SupplierObserver::class);
    }
}