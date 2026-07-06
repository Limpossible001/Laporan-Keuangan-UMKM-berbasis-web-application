<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Purchase extends Model
{
    protected $fillable = [
        'date', 'supplier_id', 'inventory_id',
        'quantity', 'unit_price', 'total_amount', 'description'
    ];

    protected $casts = [
        'date'      => 'date',
        'quantity'  => 'integer', //Notes Kak Rayhan
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function inventory(): BelongsTo
    {
        return $this->belongsTo(Inventory::class);
    }
}