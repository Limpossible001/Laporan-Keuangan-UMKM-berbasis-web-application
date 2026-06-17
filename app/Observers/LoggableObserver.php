<?php

namespace App\Observers;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

/**
 * Observer generik yang dipakai untuk semua model yang ingin di-log
 * (Purchase, Sale, CashFlow, Inventory, Supplier).
 *
 * Cara pakai: daftarkan di AppServiceProvider::boot(), contoh:
 *   Purchase::observe(new LoggableObserver('Purchase', fn($m) =>
 *      "Pembelian {$m->quantity}x item #{$m->inventory_id} dari supplier #{$m->supplier_id}"
 *   ));
 */
class LoggableObserver
{
    protected string $moduleName;
    protected ?\Closure $describeUsing;

    public function __construct(string $moduleName, ?\Closure $describeUsing = null)
    {
        $this->moduleName    = $moduleName;
        $this->describeUsing = $describeUsing;
    }

    public function created(Model $model): void
    {
        $this->log('created', $model);
    }

    public function updated(Model $model): void
    {
        $this->log('updated', $model);
    }

    public function deleted(Model $model): void
    {
        $this->log('deleted', $model);
    }

    protected function log(string $action, Model $model): void
    {
        $description = $this->describeUsing
            ? ($this->describeUsing)($model)
            : "{$this->moduleName} #{$model->getKey()} {$action}";

        ActivityLog::create([
            'user_id'     => Auth::id(), // null dulu selama Sanctum belum aktif (Tahap B)
            'action'      => $action,
            'module'      => $this->moduleName,
            'description' => $description,
            'logged_at'   => now(),
        ]);
    }
}