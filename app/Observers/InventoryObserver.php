<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\Inventory;
use Illuminate\Support\Facades\Auth;

class InventoryObserver
{
    public function created(Inventory $inventory): void
    {
        $this->log('created', $inventory);
    }

    public function updated(Inventory $inventory): void
    {
        $this->log('updated', $inventory);
    }

    public function deleted(Inventory $inventory): void
    {
        $this->log('deleted', $inventory);
    }

    protected function log(string $action, Inventory $inventory): void
    {
        ActivityLog::create([
            'user_id'     => Auth::id(),
            'action'      => $action,
            'module'      => 'Inventory',
            'description' => "Item inventory: {$inventory->product_name} (stok: {$inventory->quantity})",
            'logged_at'   => now(),
        ]);
    }
}