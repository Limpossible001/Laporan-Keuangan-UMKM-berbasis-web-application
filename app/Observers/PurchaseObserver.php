<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\Purchase;
use Illuminate\Support\Facades\Auth;

class PurchaseObserver
{
    public function created(Purchase $purchase): void
    {
        $this->log('created', $purchase);
    }

    public function updated(Purchase $purchase): void
    {
        $this->log('updated', $purchase);
    }

    public function deleted(Purchase $purchase): void
    {
        $this->log('deleted', $purchase);
    }

    protected function log(string $action, Purchase $purchase): void
    {
        ActivityLog::create([
            'user_id'     => Auth::id(),
            'action'      => $action,
            'module'      => 'Purchase',
            'description' => "Pembelian {$purchase->quantity} unit (item #{$purchase->inventory_id}) dari supplier #{$purchase->supplier_id} senilai Rp"
                . number_format($purchase->total_amount, 0, ',', '.'),
            'logged_at'   => now(),
        ]);
    }
}