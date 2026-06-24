<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\Supplier;
use Illuminate\Support\Facades\Auth;

class SupplierObserver
{
    public function created(Supplier $supplier): void
    {
        $this->log('created', $supplier);
    }

    public function updated(Supplier $supplier): void
    {
        $this->log('updated', $supplier);
    }

    public function deleted(Supplier $supplier): void
    {
        $this->log('deleted', $supplier);
    }

    protected function log(string $action, Supplier $supplier): void
    {
        ActivityLog::create([
            'user_id'     => Auth::id(),
            'action'      => $action,
            'module'      => 'Supplier',
            'description' => "Supplier: {$supplier->name}",
            'logged_at'   => now(),
        ]);
    }
}