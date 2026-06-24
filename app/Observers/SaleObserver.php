<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\Sale;
use Illuminate\Support\Facades\Auth;

class SaleObserver
{
    public function created(Sale $sale): void
    {
        $this->log('created', $sale);
    }

    public function updated(Sale $sale): void
    {
        $this->log('updated', $sale);
    }

    public function deleted(Sale $sale): void
    {
        $this->log('deleted', $sale);
    }

    protected function log(string $action, Sale $sale): void
    {
        ActivityLog::create([
            'user_id'     => Auth::id(),
            'action'      => $action,
            'module'      => 'Sale',
            'description' => "Penjualan {$sale->quantity} unit (item #{$sale->inventory_id}) senilai Rp"
                . number_format($sale->total_revenue, 0, ',', '.'),
            'logged_at'   => now(),
        ]);
    }
}