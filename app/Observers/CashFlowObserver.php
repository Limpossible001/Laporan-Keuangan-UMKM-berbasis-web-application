<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\CashFlow;
use Illuminate\Support\Facades\Auth;

class CashFlowObserver
{
    public function created(CashFlow $cashFlow): void
    {
        $this->log('created', $cashFlow);
    }

    public function updated(CashFlow $cashFlow): void
    {
        $this->log('updated', $cashFlow);
    }

    public function deleted(CashFlow $cashFlow): void
    {
        $this->log('deleted', $cashFlow);
    }

    protected function log(string $action, CashFlow $cashFlow): void
    {
        $prefix = $cashFlow->type === 'in' ? 'Kas masuk: ' : 'Kas keluar: ';

        ActivityLog::create([
            'user_id'     => Auth::id(),
            'action'      => $action,
            'module'      => 'CashFlow',
            'description' => $prefix . $cashFlow->description . " (Rp" . number_format($cashFlow->amount, 0, ',', '.') . ")",
            'logged_at'   => now(),
        ]);
    }
}