<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inventory extends Model
{
    protected $fillable = [
        'user_id', 'item_id', 'product_name', 'category', 'unit_price',
        'quantity', 'last_updated', 'notes'
    ];

    protected $casts = [
        'last_updated' => 'datetime',
        'quantity'     => 'integer',   // Input 1: INT, bukan decimal
        'unit_price'   => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(Purchase::class);
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }
}