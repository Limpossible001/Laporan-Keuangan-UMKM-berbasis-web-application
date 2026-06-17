<?php

namespace App\Providers;

use App\Models\Purchase;
use App\Models\Sale;
use App\Models\CashFlow;
use App\Models\Inventory;
use App\Models\Supplier;
use App\Observers\LoggableObserver;
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
        Purchase::observe(new LoggableObserver(
            'Purchase',
            fn ($m) => "Pembelian {$m->quantity} unit (item #{$m->inventory_id}) dari supplier #{$m->supplier_id} senilai Rp" . number_format($m->total_amount, 0, ',', '.')
        ));

        Sale::observe(new LoggableObserver(
            'Sale',
            fn ($m) => "Penjualan {$m->quantity} unit (item #{$m->inventory_id}) senilai Rp" . number_format($m->total_revenue, 0, ',', '.')
        ));

        CashFlow::observe(new LoggableObserver(
            'CashFlow',
            fn ($m) => ($m->type === 'in' ? 'Kas masuk: ' : 'Kas keluar: ') . $m->description . " (Rp" . number_format($m->amount, 0, ',', '.') . ")"
        ));

        Inventory::observe(new LoggableObserver(
            'Inventory',
            fn ($m) => "Item inventory: {$m->product_name} (stok: {$m->quantity})"
        ));

        Supplier::observe(new LoggableObserver(
            'Supplier',
            fn ($m) => "Supplier: {$m->name}"
        ));
    }
}