<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Sale extends Model
{
    protected $fillable = [
        'date', 'inventory_id', 'quantity',
        'unit_price', 'total_revenue', 'customer_notes'
    ];

    protected $casts = [
        'date'     => 'date',
        'quantity' => 'integer', // Input 1
    ];

    public function inventory(): BelongsTo
    {
        return $this->belongsTo(Inventory::class);
    }
}